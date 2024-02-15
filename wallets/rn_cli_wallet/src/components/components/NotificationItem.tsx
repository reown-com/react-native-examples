import {Pressable, StyleSheet, Text, View} from 'react-native';
import useColors from '@/utils/theme';
import {DateUtil} from '@/utils/date';

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
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        {
          backgroundColor:
            pressed && url ? colors.backgroundActive : colors.background,
          borderColor: colors.border,
        },
        styles.container,
      ]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, {color: colors.primary}]}>{title}</Text>
        {sentAt ? (
          <Text style={[styles.sentAt, {color: colors.secondary}]}>
            {DateUtil.getRelativeDateFromNow(sentAt)}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.description, {color: colors.secondary}]}>
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
