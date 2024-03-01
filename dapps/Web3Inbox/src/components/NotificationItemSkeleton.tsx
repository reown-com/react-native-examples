import {StyleSheet, View} from 'react-native';
import useColors from '@/hooks/useColors';

export default function NotificationItemSkeleton() {
  const Theme = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: Theme['fg-150'],
        },
      ]}>
      <View
        style={[
          styles.title,
          {
            backgroundColor: Theme['bg-100'],
          },
        ]}
      />
      <View
        style={[
          styles.description,
          {
            backgroundColor: Theme['bg-100'],
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
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
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
