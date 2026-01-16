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

interface IEventProps {
  events?: string[];
  style?: StyleProp<ViewStyle>;
}

export function Events({ events, style }: IEventProps) {
  const Theme = useTheme();

  if (!events?.length) {
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
        Events
      </Text>
      <View style={styles.row}>
        {events?.map((event: string, index: number) => (
          <Tag key={index} value={event} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius[5],
    padding: Spacing[2],
    maxHeight: 120,
  },
  content: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
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
