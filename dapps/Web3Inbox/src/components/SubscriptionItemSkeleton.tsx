import {StyleSheet, View} from 'react-native';
import useColors from '@/hooks/useColors';

export default function SubscriptionItemSkeleton() {
  const Theme = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: Theme['fg-150'],
          backgroundColor: Theme['bg-100'],
        },
      ]}>
      <View
        style={[
          styles.title,
          {
            backgroundColor: Theme['accent-010'],
          },
        ]}
      />
      <View
        style={[
          styles.description,
          {
            backgroundColor: Theme['accent-010'],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    opacity: 0.8,
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  title: {
    width: '50%',
    height: 16,
    borderRadius: 4,
  },
  description: {
    width: '70%',
    height: 12,

    borderRadius: 4,
  },
});
