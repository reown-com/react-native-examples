import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface ITagProps {
  value: string;
  grey?: boolean;
}

export function Tag({ value, grey }: ITagProps) {
  const Theme = useTheme();
  const backgroundColor = grey
    ? Theme['foreground-tertiary']
    : Theme['foreground-accent-primary-10'];
  const colorKey = grey ? 'text-tertiary' : 'text-accent-primary';
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text variant="sm-500" color={colorKey}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 26,
    paddingHorizontal: Spacing[2],
    borderRadius: BorderRadius[7],
    marginRight: Spacing[1],
    marginBottom: Spacing[2],
  },
});
