import {Pressable, StyleSheet, Text, View} from 'react-native';

import {DateUtil} from '@/utils/date';
import {useTheme} from '@/hooks/useTheme';

type NotificationItemProps = {
  title: string;
  description: string;
  sentAt: number;
  url: string | null;
  onPress: () => void;
};

export default function NotificationItem({
  title,
  description,
  sentAt,
  url,
  onPress,
}: NotificationItemProps) {
  const Theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        {
          backgroundColor:
            pressed && url ? Theme['accent-glass-010'] : Theme['inverse-100'],
          borderColor: Theme['gray-glass-020'],
        },
        styles.container,
      ]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, {color: Theme['fg-100']}]}>{title}</Text>
        {sentAt ? (
          <Text style={[styles.sentAt, {color: Theme['fg-200']}]}>
            {DateUtil.getRelativeDateFromNow(sentAt)}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.description, {color: Theme['fg-200']}]}>
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
  },
  sentAt: {
    fontSize: 12,
    fontWeight: '400',
  },
});
