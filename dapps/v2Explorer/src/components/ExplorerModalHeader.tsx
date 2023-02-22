import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

interface ExplorerModalHeaderProps {
  close: () => void;
}

export const ExplorerModalHeader = ({close}: ExplorerModalHeaderProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.flexRow}>
      <Image style={styles.wcLogo} source={require('../assets/WCLogo.png')} />
      <TouchableOpacity
        style={isDarkMode ? styles.closeContainer : styles.closeContainerLight}
        onPress={() => close()}
        hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
        <Image
          style={styles.closeImage}
          source={
            isDarkMode
              ? require('../assets/CloseWhite.png')
              : require('../assets/Close.png')
          }
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  flexRow: {
    paddingVertical: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  wcLogo: {
    width: 181,
    height: 28,
  },
  closeImage: {
    width: 12,
    height: 12,
  },
  closeContainer: {
    height: 28,
    width: 28,
    backgroundColor: '#141414',
    borderRadius: 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeContainerLight: {
    height: 28,
    width: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
