import {Pressable, StyleSheet, Text, View} from 'react-native';
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
        styles.container,
      ]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {sentAt ? (
          <Text style={styles.description}>
            {DateUtil.getRelativeDateFromNow(sentAt)}
          </Text>
        ) : null}
      </View>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
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
