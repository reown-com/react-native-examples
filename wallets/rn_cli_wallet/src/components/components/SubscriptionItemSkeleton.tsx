import {View} from 'react-native';

import {useTheme} from '@/hooks/useTheme';

export default function SubscriptionItemSkeleton({style}) {
  const Theme = useTheme();

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
        },
        style,
      ]}>
      <View
        style={{
          width: '50%',
          height: 16,
          backgroundColor: Theme['gray-glass-010'],
          borderRadius: 4,
        }}
      />
      <View
        style={{
          width: '70%',
          height: 12,
          backgroundColor: Theme['gray-glass-010'],
          borderRadius: 4,
        }}
      />
    </View>
  );
}
