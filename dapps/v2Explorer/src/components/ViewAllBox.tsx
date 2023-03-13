import * as React from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

import ViewAllIcon from '../assets/ViewAll.png';

interface Props {
  onPress: any;
}

export const ViewAllBox = ({onPress}: Props) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image style={styles.icon} source={ViewAllIcon} />
      <View>
        <Text
          style={[styles.text, isDarkMode && styles.textDark]}
          numberOfLines={1}>
          View All
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    height: 60,
    width: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  container: {
    width: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  text: {
    color: '#1f1f1f',
    marginVertical: 8,
    maxWidth: 100,
    fontWeight: '600',
    fontSize: 12,
  },
  textDark: {
    color: 'white',
  },
});
