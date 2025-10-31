import { useIsFocused } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Camera,
  Code,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = 250; // Size of the transparent square
const scanAreaLeft = (width - SCAN_AREA_SIZE) / 2;
const scanAreaTop = (height - SCAN_AREA_SIZE) / 2;

export default function Scanner() {
  const device = useCameraDevice('back', {
    physicalDevices: ['wide-angle-camera'],
  });
  const { hasPermission, requestPermission } = useCameraPermission(); // Add this

  // 2. Only activate Camera when the app is focused and this screen is currently opened
  const isActive = useIsFocused();

  const onCodeScanned = (codes: Code[]) => {
    const uri = codes[0].value;
    console.log(uri);
    // navigation.navigate('Home', {
    //   screen: 'ConnectionsStack',
    //   params: {screen: 'Connections', params: {uri: uri!}},
    // });
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned,
  });

  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      {/* <TouchableOpacity onPress={goBack} style={styles.backButton} hitSlop={40}>
        <SvgChevronRight
          fill="white"
          height={24}
          width={24}
          style={styles.backIcon}
        />
      </TouchableOpacity> */}

      {hasPermission && device ? (
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isActive}
            codeScanner={codeScanner}
          />
          <BlurView
            intensity={80}
            style={[styles.blurOverlay, { top: 0, height: scanAreaTop }]}
            tint="dark"
          />
          <BlurView
            intensity={80}
            style={[
              styles.blurOverlay,
              {
                top: scanAreaTop,
                left: 0,
                width: scanAreaLeft,
                height: SCAN_AREA_SIZE,
              },
            ]}
            tint="dark"
          />
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text>Camera not available</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    zIndex: 1,
    backgroundColor: 'black',
    opacity: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    height: 36,
    width: 36,
    marginTop: 16,
    marginLeft: 16,
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurOverlay: {
    position: 'absolute',
    width: '100%',
  },
});
