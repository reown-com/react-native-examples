import React from 'react';
import {
  Image,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {navigateDeepLink} from '../utils/ExplorerUtils';
import {currentWCURI} from '../utils/UniversalProvider';

interface ExplorerItemProps {
  explorerData: any;
  isLoading: boolean;
}

export const ExplorerItem = ({explorerData, isLoading}: ExplorerItemProps) => {
  if (isLoading) {
    return <ActivityIndicator color="#FFFFFF" />;
  }

  return (
    <>
      {explorerData.map((item, index) => {
        return (
          <TouchableOpacity
            onPress={() =>
              navigateDeepLink(item.mobile.universal, currentWCURI)
            }
            key={index}
            style={styles.explorerItem}>
            <Image
              style={styles.explorerIcon}
              source={{uri: item.image_url.md}}
            />
            <View>
              <Text style={styles.explorerIconText} numberOfLines={1}>
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
    // height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  explorerIcon: {
    height: 59,
    width: 59,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  explorerIconText: {
    color: 'white',
    marginVertical: 8,
    maxWidth: 100,
  },
});
