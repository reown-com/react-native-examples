import {Image, StyleSheet} from 'react-native';
import VerifiedIcon from '@/assets/VerifiedDomain.png';

export function VerifiedDomain() {
  return <Image source={VerifiedIcon} style={styles.icon} />;
}

const styles = StyleSheet.create({
  icon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginEnd: 5,
  },
});
