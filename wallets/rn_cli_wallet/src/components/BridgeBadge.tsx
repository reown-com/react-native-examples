import {Image, StyleSheet, View} from 'react-native';
import Bridge from '@/assets/bridge.png';

export function BridgeBadge() {
  return (
    <View style={styles.container}>
      <Image source={Bridge} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#363636',
    marginEnd: 8,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  image: {
    width: 16,
    height: 16,
    top: 3,
  },
});
