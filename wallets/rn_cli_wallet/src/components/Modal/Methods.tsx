import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import {useTheme} from '@/hooks/useTheme';
import {Tag} from '@/components/Tag';

interface IMethodsProps {
  methods?: string[];
  style?: StyleProp<ViewStyle>;
}

export function Methods({methods, style}: IMethodsProps) {
  const Theme = useTheme();

  if (!methods?.length) {
    return null;
  }

  return (
    <ScrollView
      bounces={false}
      style={[styles.container, {backgroundColor: Theme['bg-150']}, style]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, {color: Theme['fg-150']}]}>Methods</Text>
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
    borderRadius: 20,
    maxHeight: 120,
  },
  content: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    padding: 8,
  },
  title: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    margin: 4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
