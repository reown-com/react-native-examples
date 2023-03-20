import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Chevron from '../assets/Chevron.png';

interface Props {
  title: string;
  onBackPress?: () => void;
  onActionPress?: () => void;
  actionIcon?: any;
  actionIconStyle?: any;
}

function NavigationHeader({
  title,
  onBackPress,
  onActionPress,
  actionIcon,
  actionIconStyle,
}: Props) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      {onBackPress ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onBackPress}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Image style={styles.backIcon} source={Chevron} />
        </TouchableOpacity>
      ) : (
        <View style={styles.button} />
      )}
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>
        {title}
      </Text>
      {actionIcon ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onActionPress}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Image style={actionIconStyle} source={actionIcon} />
        </TouchableOpacity>
      ) : (
        <View style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  button: {
    width: 24,
    height: 24,
    justifyContent: 'center',
  },
  backIcon: {
    width: 8,
    height: 18,
  },
  title: {
    fontWeight: '600',
    color: '#1f1f1f',
    fontSize: 20,
    lineHeight: 24,
  },
  titleDark: {
    color: 'white',
  },
});

export default NavigationHeader;
