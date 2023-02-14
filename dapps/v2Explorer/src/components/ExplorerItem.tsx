import React from 'react';
import {
  Image,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface ExplorerItemProps {
  explorerData: any;
  isLoading: boolean;
}

export const ExplorerItem = ({explorerData, isLoading}: ExplorerItemProps) => {
  if (isLoading) {
    return <ActivityIndicator color="#FFFFFF" />;
  }

  return (
    <View style={styles.explorerContainer}>
      {explorerData.map((item, index) => {
        return (
          <TouchableOpacity
            // onPress={() => {}}
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
    </View>
  );
};

const styles = StyleSheet.create({
  explorerContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  explorerItem: {
    width: '33%',
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  explorerIcon: {
    height: 32,
    width: 32,
    borderRadius: 8,
  },
  explorerIconText: {
    color: 'white',
    marginTop: 8,
    maxWidth: 100,
  },
});
