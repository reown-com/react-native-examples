import { useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

import { WalletConnectLoading } from '@/components/WalletConnectLoading';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

import { arePayModalAnimationsEnabled } from './utils';

interface LoadingViewProps {
  message?: string;
  note?: string;
  size?: number;
  variant?: 'lottie' | 'spinner';
}

const enteringKeyframe = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 14 }, { scale: 0.92 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
}).duration(260);

const exitingKeyframe = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
  100: { opacity: 0, transform: [{ translateY: -14 }, { scale: 0.92 }] },
}).duration(220);

export function LoadingView({
  message,
  note,
  size = 120,
  variant = 'lottie',
}: LoadingViewProps) {
  const Theme = useTheme();
  const hasMountedRef = useRef(false);
  const entering =
    arePayModalAnimationsEnabled && hasMountedRef.current
      ? enteringKeyframe
      : undefined;
  hasMountedRef.current = true;

  const messageKey = message || 'default';

  // The Lottie loader has white "track matte" strokes (Shape Layer 1/2) that
  // lottie-react-native's native renderers leak through at the end of each
  // loop — unnoticeable in light mode (white on white) but visible in dark
  // mode. Remap them to the modal background so they vanish in both themes.
  const lottieColorFilters = useMemo(
    () => [
      { keypath: 'Shape Layer 1', color: Theme['bg-primary'] },
      { keypath: 'Shape Layer 2', color: Theme['bg-primary'] },
    ],
    [Theme],
  );

  const resolvedVariant = arePayModalAnimationsEnabled ? variant : 'spinner';

  return (
    <View style={styles.loadingContainer}>
      {resolvedVariant === 'spinner' ? (
        <WalletConnectLoading size={size} />
      ) : (
        <LottieView
          source={require('@/assets/lottie/Loading.json')}
          autoPlay
          loop
          colorFilters={lottieColorFilters}
          style={{ width: size, height: size }}
          testID="pay-loading-lottie"
        />
      )}
      <View
        style={[
          styles.messageContainer,
          note && styles.messageContainerWithNote,
        ]}
      >
        <Animated.View
          key={messageKey}
          entering={entering}
          exiting={arePayModalAnimationsEnabled ? exitingKeyframe : undefined}
          style={styles.messageSlot}
        >
          <Text
            variant="h6-400"
            color="text-primary"
            style={styles.loadingText}
            testID="pay-loading-message"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {message || 'Loading...'}
          </Text>
          {note && (
            <Text
              variant="lg-400"
              color="text-secondary"
              center
              style={styles.loadingNote}
            >
              {note}
            </Text>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: Spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    marginTop: Spacing[4],
    minHeight: 64,
    width: '100%',
    overflow: 'hidden',
  },
  messageContainerWithNote: {
    minHeight: 110,
  },
  messageSlot: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[2],
  },
  loadingText: {
    textAlign: 'center',
  },
  loadingNote: {
    marginTop: Spacing[2],
  },
});
