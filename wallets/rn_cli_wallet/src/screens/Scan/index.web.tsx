/// <reference lib="dom" />
import { BrowserQRCodeReader } from '@zxing/browser';
import {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SvgClose from '@/assets/Close';
import { RootStackScreenProps } from '@/utils/TypesUtil';
import styles, { SCAN_AREA_SIZE } from './styles';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/utils/haptics';
import { Button } from '@/components/Button';
import { BorderRadius, Spacing } from '@/utils/ThemeUtil';

const CUTOUT_RADIUS = BorderRadius[4];

// Ask for 720p. Unconstrained, Safari hands back 640x480, and since the QR
// only fills the 280px cutout in the middle of a cover-scaled preview, its
// modules land on too few pixels for zxing to lock on quickly.
const VIDEO_CONSTRAINTS: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: 'environment' },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
};

// zxing defaults to 500ms between decode attempts, i.e. two tries a second,
// which is what made scanning feel unresponsive.
const READER_OPTIONS = { delayBetweenScanAttempts: 100 };

const stopStream = (stream: MediaStream | null) =>
  stream?.getTracks().forEach(track => track.stop());

// Corner brackets, mirroring the native ScannerFrame (stroke 5, radius 30,
// arm ~50). CORNER_OFFSET pushes them just outside the cutout window.
const CORNER_SIZE = 52;
const CORNER_STROKE = 5;
const CORNER_RADIUS = 30;
const CORNER_OFFSET = 14;

const Video = forwardRef<HTMLVideoElement>((_, ref) =>
  createElement('video', {
    autoPlay: true,
    muted: true,
    playsInline: true,
    ref,
    style: webStyles.video,
  }),
);

type Props = RootStackScreenProps<'Scan'>;

export default function Scan({ navigation }: Props) {
  const Theme = useTheme();
  const { top } = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedUri, setScannedUri] = useState<string | null>(null);
  // Measure the screen rather than the window: on desktop web the app is
  // clipped to a phone-sized frame (see DesktopFrameWrapper), so window height
  // would push the cutout and the buttons below the frame's overflow: hidden.
  const [frameHeight, setFrameHeight] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControls = useRef<{ stop: () => void } | null>(null);
  const cameraStream = useRef<MediaStream | null>(null);
  const hasHandledScan = useRef(false);
  const scanAreaTop = (frameHeight - SCAN_AREA_SIZE) / 3;

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setFrameHeight(event.nativeEvent.layout.height);
  }, []);

  const onBarcodeScanned = useCallback(({ data }: { data: string }) => {
    if (hasHandledScan.current || !data) return;

    hasHandledScan.current = true;
    haptics.scanSuccess();
    // Unmount the web camera before navigating. Its scanner runs on a timer,
    // and navigating from inside that callback can leave React mid-render.
    setIsCameraEnabled(false);
    setScannedUri(data);
  }, []);

  useEffect(() => {
    if (!scannedUri) return;

    const frame = requestAnimationFrame(() => {
      navigation.navigate('Home', {
        screen: 'Connections',
        params: { uri: scannedUri },
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [navigation, scannedUri]);

  useEffect(() => {
    const video = videoRef.current;
    if (!isCameraEnabled || !isFocused || !video) return;

    let isActive = true;
    const codeReader = new BrowserQRCodeReader(undefined, READER_OPTIONS);
    // Hand zxing the stream the permission gesture already opened. Calling
    // getUserMedia a second time right after the first stream's tracks were
    // stopped makes Safari reject the request or serve a black preview.
    // Only the permission gesture can refill this, so claim it eagerly; the
    // constraints path below re-acquires on a re-run (e.g. refocus).
    const stream = cameraStream.current;
    cameraStream.current = null;

    // Only the live generation may publish into the ref. A torn-down scanner
    // that settles late would otherwise overwrite its successor's controls,
    // and cleanup would then stop the wrong one.
    const publishControls = (controls: { stop: () => void }) => {
      if (!isActive) {
        controls.stop();
        return false;
      }
      scannerControls.current = controls;
      return true;
    };

    const onDecode = (
      result: { getText: () => string } | undefined,
      _error: unknown,
      controls: { stop: () => void },
    ) => {
      if (!publishControls(controls)) return;
      if (result) {
        onBarcodeScanned({ data: result.getText() });
      }
    };

    const decoding = stream?.active
      ? codeReader.decodeFromStream(stream, video, onDecode)
      : codeReader.decodeFromConstraints(VIDEO_CONSTRAINTS, video, onDecode);

    decoding.then(publishControls).catch(() => {
      // decodeFromStream can reject after attaching (play timeout) without
      // releasing the device, and we own this stream now, so stop it here.
      stopStream(stream);
      if (isActive) {
        setCameraError('Camera access could not be started.');
        setIsCameraEnabled(false);
      }
    });

    return () => {
      isActive = false;
      scannerControls.current?.stop();
      scannerControls.current = null;
    };
  }, [isCameraEnabled, isFocused, onBarcodeScanned]);

  // Release the stream if the screen unmounts between the permission gesture
  // and the decode effect claiming it.
  useEffect(
    () => () => {
      stopStream(cameraStream.current);
      cameraStream.current = null;
    },
    [],
  );

  const requestCameraPermission = useCallback(async () => {
    // Reset the guard so a re-enabled camera can process scans again. Without
    // this, returning to a still-mounted Scan screen after a successful scan
    // would restart the camera but silently drop every subsequent QR code.
    hasHandledScan.current = false;
    // Clear the last scan too, or re-scanning the same QR writes an identical
    // value and the navigate effect never re-runs.
    setScannedUri(null);
    setCameraError(null);
    if (
      typeof window === 'undefined' ||
      !window.isSecureContext ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setCameraError(
        'Camera access requires HTTPS or localhost in this browser.',
      );
      return;
    }

    try {
      // Safari only displays its camera prompt while the request is tied to a user gesture.
      const stream = await navigator.mediaDevices.getUserMedia(
        VIDEO_CONSTRAINTS,
      );
      // Keep it open and let the decode effect attach to it instead of
      // re-acquiring the device.
      stopStream(cameraStream.current);
      cameraStream.current = stream;
      setIsCameraEnabled(true);
    } catch (error) {
      switch (error instanceof DOMException ? error.name : '') {
        case 'NotAllowedError':
          // Every browser reports NotAllowedError on denial, so keep this
          // wording browser-neutral.
          setCameraError(
            'Camera access was denied. Allow it in your browser settings, then try again.',
          );
          break;
        case 'NotFoundError':
          setCameraError('No camera is available on this device.');
          break;
        case 'NotReadableError':
          setCameraError(
            'Camera is in use by another app. Close it, then try again.',
          );
          break;
        default:
          setCameraError('Camera access could not be started.');
      }
    }
  }, []);

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.container]}
      onLayout={onLayout}
    >
      {isCameraEnabled ? (
        <View style={StyleSheet.absoluteFill} testID="camera-wc-qr">
          <Video ref={videoRef} />
        </View>
      ) : null}

      {/* Dark overlay with a transparent center window + corner brackets.
          react-native-svg's evenodd cutout and stroked paths are unreliable on
          web, so this uses a boxShadow knockout and bordered Views instead, and
          centers horizontally with flexbox. Held back until onLayout reports a
          height so the cutout doesn't jump on the first frame. */}
      {frameHeight > 0 && (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, webStyles.overlay]}
        >
          <View style={[webStyles.cutout, { marginTop: scanAreaTop }]}>
            <View style={[webStyles.corner, webStyles.cornerTopLeft]} />
            <View style={[webStyles.corner, webStyles.cornerTopRight]} />
            <View style={[webStyles.corner, webStyles.cornerBottomLeft]} />
            <View style={[webStyles.corner, webStyles.cornerBottomRight]} />
          </View>
        </View>
      )}

      <Button
        onPress={goBack}
        style={[
          styles.closeButton,
          { top: top + 12, borderColor: Theme['border-secondary'] },
        ]}
        hitSlop={40}
      >
        <SvgClose fill="white" height={14} width={14} />
      </Button>

      {isCameraEnabled && frameHeight > 0 && (
        <View
          style={[
            styles.instructionContainer,
            { top: scanAreaTop + SCAN_AREA_SIZE + Spacing[8] },
          ]}
        >
          <Text variant="lg-400" style={styles.instructionText}>
            Scan a WalletConnect QR code
          </Text>
        </View>
      )}

      {!isCameraEnabled && frameHeight > 0 && (
        <View
          style={[
            webStyles.errorBelow,
            { top: scanAreaTop + SCAN_AREA_SIZE + Spacing[8] },
          ]}
        >
          <Text variant="lg-400" style={webStyles.errorText}>
            {cameraError ||
              'Camera unavailable. Allow camera access to scan codes.'}
          </Text>
          <Button
            accessibilityLabel="Allow camera access"
            onPress={requestCameraPermission}
            style={webStyles.allowCameraButton}
            testID="button-allow-camera"
          >
            <Text variant="md-500" style={webStyles.allowCameraText}>
              Allow camera access
            </Text>
          </Button>
        </View>
      )}
    </View>
  );
}

const webStyles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
  },
  cutout: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderRadius: CUTOUT_RADIUS,
    boxShadow: '0px 0px 0px 9999px rgba(0, 0, 0, 0.9)',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: 'white',
  },
  cornerTopLeft: {
    top: -CORNER_OFFSET,
    left: -CORNER_OFFSET,
    borderTopWidth: CORNER_STROKE,
    borderLeftWidth: CORNER_STROKE,
    borderTopLeftRadius: CORNER_RADIUS,
  },
  cornerTopRight: {
    top: -CORNER_OFFSET,
    right: -CORNER_OFFSET,
    borderTopWidth: CORNER_STROKE,
    borderRightWidth: CORNER_STROKE,
    borderTopRightRadius: CORNER_RADIUS,
  },
  cornerBottomLeft: {
    bottom: -CORNER_OFFSET,
    left: -CORNER_OFFSET,
    borderBottomWidth: CORNER_STROKE,
    borderLeftWidth: CORNER_STROKE,
    borderBottomLeftRadius: CORNER_RADIUS,
  },
  cornerBottomRight: {
    bottom: -CORNER_OFFSET,
    right: -CORNER_OFFSET,
    borderBottomWidth: CORNER_STROKE,
    borderRightWidth: CORNER_STROKE,
    borderBottomRightRadius: CORNER_RADIUS,
  },
  errorBelow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    gap: Spacing[4],
  },
  video: {
    height: '100%',
    objectFit: 'cover',
    width: '100%',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
  allowCameraButton: {
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: BorderRadius[4],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  allowCameraText: {
    color: 'white',
  },
});
