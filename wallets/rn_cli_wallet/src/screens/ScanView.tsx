import React, {useEffect, useState} from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';

import {
  Camera,
  Code,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import SvgChevronRight from '../assets/ChevronRight';

export interface ScanViewProps {
  value: string;
}

export function ScanView() {
  const navigation = useNavigation();
  const device = useCameraDevice('back');
  const [showCamera, setShowCamera] = useState(false);

  // 2. Only activate Camera when the app is focused and this screen is currently opened
  const isActive = useIsFocused();

  const onCodeScanned = (codes: Code[]) => {
    const uri = codes[0].value;
    navigation.navigate('ConnectionsScreen', {
      uri,
    });
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned,
  });

  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA,
    ).then(result => {
      if (result === RESULTS.GRANTED) {
        setShowCamera(true);
      }
    });
  }, []);

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <TouchableOpacity onPress={goBack} style={styles.backButton} hitSlop={40}>
        <SvgChevronRight
          fill="white"
          height={24}
          width={24}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      {showCamera && device ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          codeScanner={codeScanner}
        />
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
    transform: [{rotate: '180deg'}],
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
