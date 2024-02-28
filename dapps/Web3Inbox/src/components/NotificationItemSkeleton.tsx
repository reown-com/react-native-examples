import {StyleSheet, View} from 'react-native';
import useColors from '@/hooks/useColors';

export default function NotificationItemSkeleton() {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.border,
        },
      ]}>
      <View
        style={[
          styles.title,
          {
            backgroundColor: colors.background,
          },
        ]}
      />
      <View
        style={[
          styles.description,
          {
            backgroundColor: colors.background,
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
