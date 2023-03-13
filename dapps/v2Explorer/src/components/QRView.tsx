import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Chevron from '../assets/Chevron.png';
import {DEVICE_WIDTH} from '../constants/Platform';
import QrCode from './QRCode';

interface Props {
  uri: string;
  onBackPress: () => void;
}

function QRView({uri, onBackPress}: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      <View style={styles.sectionTitleContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
          <Image style={styles.chevronIcon} source={Chevron} />
        </TouchableOpacity>
        <Text
          style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
          Scan the code
        </Text>
        {<View style={styles.backButton} />}
      </View>
      <QrCode
        uri={uri}
        size={DEVICE_WIDTH * 0.8}
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
    width: DEVICE_WIDTH,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    width: 18,
    height: 18,
  },
  chevronIcon: {
    width: 8,
    height: 18,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#141414',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitleDark: {
    color: 'white',
  },
});

export default QRView;
