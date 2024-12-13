import {StyleSheet, Text, View} from 'react-native';

interface ModalHeaderProps {
  heading: string;
}

export function ModalHeader({heading}: ModalHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.heading]}>
        <Text style={[styles.headingText]}>{heading}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    // marginHorizontal: 16,
    padding: 10,
  },
  heading: {
    borderRadius: 20,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
});
