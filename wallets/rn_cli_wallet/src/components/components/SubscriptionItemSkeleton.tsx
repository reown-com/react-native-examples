import {View} from 'react-native';
import useColors from '@/utils/theme';

export default function SubscriptionItemSkeleton({style}) {
  const colors = useColors();

  return (
    <View
      style={[
        {
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
          borderColor: colors.border,
          backgroundColor: colors.background,
        },
        style,
      ]}>
      <View
        style={{
          width: '50%',
          height: 16,
          backgroundColor: colors.backgroundSecondary,
          borderRadius: 4,
        }}
      />
      <View
        style={{
          width: '70%',
          height: 12,
          backgroundColor: colors.backgroundSecondary,
          borderRadius: 4,
        }}
      />
    </View>
  );
}
