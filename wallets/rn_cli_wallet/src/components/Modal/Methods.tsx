import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Tag } from '@/components/Tag';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface IMethodsProps {
  methods?: string[];
  style?: StyleProp<ViewStyle>;
}

export function Methods({ methods, style }: IMethodsProps) {
  const Theme = useTheme();

  if (!methods?.length) {
    return null;
  }

  return (
    <ScrollView
      bounces={false}
      style={[
        styles.container,
        { backgroundColor: Theme['foreground-primary'] },
        style,
      ]}
      contentContainerStyle={styles.content}
    >
      <Text variant="sm-500" color="text-secondary" style={styles.title}>
        Methods
      </Text>
      <View style={styles.row}>
        {methods?.length &&
          methods?.map((method: string, index: number) => (
            <Tag key={index} value={method} />
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius[5],
    maxHeight: 120,
  },
  content: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    padding: Spacing[2],
  },
  title: {
    margin: Spacing[1],
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
