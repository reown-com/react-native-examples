import {Pressable, StyleSheet, Text} from 'react-native';
import {colors} from '../utils/theme';

export default function SubscriptionItem({title, description, onPress}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        {
          backgroundColor: pressed
            ? colors.backgroundActive
            : colors.background,
        },
        subscriptionItemStyles.container,
      ]}>
      <Text style={subscriptionItemStyles.title}>{title}</Text>
      <Text style={subscriptionItemStyles.description}>{description}</Text>
    </Pressable>
  );
}

const subscriptionItemStyles = StyleSheet.create({
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
});
