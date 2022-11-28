import {useEffect, useState} from 'react';
import {Platform, StyleSheet, TouchableOpacity, View, Text} from 'react-native';

import {
  Camera,
  Code,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {useIsFocused} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import SvgChevronRight from '@/assets/ChevronRight';
import {RootStackScreenProps} from '@/utils/TypesUtil';
import styles from './styles';

type Props = RootStackScreenProps<'Scan'>;

export default function Scan({navigation}: Props) {
  const device = useCameraDevice('back');
  const [showCamera, setShowCamera] = useState(false);

  // 2. Only activate Camera when the app is focused and this screen is currently opened
  const isActive = useIsFocused();

  const onCodeScanned = (codes: Code[]) => {
    const uri = codes[0].value;
    navigation.navigate('Home', {
      screen: 'ConnectionsStack',
      params: {screen: 'Connections', params: {uri: uri!}},
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
