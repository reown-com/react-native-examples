import { ScrollView, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface IMessageProps {
  message: string;
  style?: StyleProp<ViewStyle>;
  showTitle?: boolean;
}

export function Message({ message, style, showTitle = true }: IMessageProps) {
  const Theme = useTheme();

  if (!message) {
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
      {showTitle && (
        <Text variant="sm-500" color="text-secondary" style={styles.title}>
          Message
        </Text>
      )}
      <Text variant="sm-400" color="text-secondary">
        {message}
      </Text>
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
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
  },
  title: {
    marginBottom: Spacing[1],
  },
});
