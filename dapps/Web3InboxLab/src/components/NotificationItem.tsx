import {Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../utils/theme';
import {DateUtil} from '../utils/date';

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
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        {
          backgroundColor:
            pressed && url ? colors.backgroundActive : colors.background,
        },
        notificationItemStyles.container,
      ]}>
      <Text style={notificationItemStyles.title}>{title}</Text>
      <Text style={notificationItemStyles.description}>{description}</Text>
      <Text style={notificationItemStyles.description}>
        {DateUtil.getRelativeDateFromNow(sentAt)}
      </Text>
    </Pressable>
  );
}

const notificationItemStyles = StyleSheet.create({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  description: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.secondary,
  },
  sentAt: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.secondary,
  },
});
