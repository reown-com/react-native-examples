import React from 'react';
import {Svg} from 'react-native-svg';
import {View, Image, StyleSheet} from 'react-native';
import {QrCodeUtil} from '../utils/QrCode';
import WCLogo from '../assets/WCGradientLogo.png';

interface Props {
  uri: string;
  size: number;
  theme?: 'light' | 'dark';
}

function QrCode({uri, size, theme = 'light'}: Props) {
  const dots = QrCodeUtil.generate(uri, size, size / 4, theme);
  return (
    <View style={styles.container}>
      <Svg height={size} width={size}>
        {dots}
      </Svg>
      <Image source={WCLogo} style={[styles.logo, {width: size / 4}]} />
    </View>
  );
}

export default QrCode;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    position: 'absolute',
  },
});
