import { StyleSheet, View } from 'react-native';

import SvgCheckCircle from '@/assets/CheckCircle';
import SvgXCircle from '@/assets/XCircle';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

const PERMISSIONS = [
  {
    text: 'View your balance & activity',
    allowed: true,
  },
  {
    text: 'Request transaction approvals',
    allowed: true,
  },
  {
    text: 'Move funds without permission',
    allowed: false,
  },
];

export function AppPermissions() {
  const Theme = useTheme();

  return (
    <View style={styles.container}>
      {PERMISSIONS.map((permission, index) => (
        <View key={index} style={styles.row}>
          {permission.allowed ? (
            <SvgCheckCircle
              width={20}
              height={20}
              fill={Theme['icon-success']}
            />
          ) : (
            <SvgXCircle width={20} height={20} fill={Theme['icon-error']} />           
          )}
          <Text variant="md-400" color="text-primary">
            {permission.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
});
