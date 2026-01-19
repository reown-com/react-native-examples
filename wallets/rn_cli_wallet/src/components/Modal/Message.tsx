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
        <Text variant="lg-400" color="text-tertiary" style={styles.title}>
          Message
        </Text>
      )}
      <Text variant="md-400" color="text-primary">
        {message}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius[4],
    maxHeight: 120,
  },
  content: {
    rowGap: Spacing[2],
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    padding: Spacing[5],
  },
  title: {
    marginBottom: Spacing[1],
  },
});
