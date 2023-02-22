import React from 'react';
import {
  Image,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import {navigateDeepLink} from '../utils/ExplorerUtils';
import {currentWCURI} from '../utils/UniversalProvider';

interface ExplorerItemProps {
  explorerData: any;
  isLoading: boolean;
}

export const ExplorerItem = ({explorerData, isLoading}: ExplorerItemProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  if (isLoading) {
    return <ActivityIndicator color="#FFFFFF" />;
  }

  return (
    <>
      {explorerData.map((item: any, index: number) => {
        return (
          <TouchableOpacity
            onPress={() => {
              navigateDeepLink(
                item.mobile.universal,
                item.mobile.native,
                currentWCURI,
              );
            }}
            key={index}
            style={styles.explorerItem}>
            <Image
              style={styles.explorerIcon}
              source={{uri: item.image_url.md}}
            />
            <View>
              <Text
                style={
                  isDarkMode
                    ? styles.explorerIconText
                    : styles.explorerIconTextBlack
                }
                numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  explorerContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  explorerItem: {
    width: '25%',
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  explorerIcon: {
    height: 59,
    width: 59,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  explorerIconText: {
    color: 'white',
    marginVertical: 8,
    maxWidth: 100,
  },
  explorerIconTextBlack: {
    color: '#1F1F1F',
    marginVertical: 8,
    maxWidth: 100,
  },
});
