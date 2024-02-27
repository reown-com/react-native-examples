import useColors from '@/hooks/useColors';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

interface ISubscriptionItem {
  title: string;
  description: string;
  imageURL: string;
  onPress: () => void;
}

export default function SubscriptionItem({
  title,
  description,
  imageURL,
  onPress,
}: ISubscriptionItem) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.container,
        {
          backgroundColor: pressed
            ? colors.backgroundActive
            : colors.background,
          borderColor: colors.border,
        },
      ]}>
      <View style={styles.imageContainer}>
        <View style={styles.imageBorder} />
        <Image source={{uri: imageURL}} style={styles.image} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, {color: colors.primary}]}>{title}</Text>
        <Text style={[styles.description, {color: colors.secondary}]}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: 12,
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 32,
    position: 'relative',
  },
  imageBorder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 32,
    borderWidth: 1.25,
    borderColor: 'rgba(150,150,150,1)',
    zIndex: 999,
    opacity: 0.15,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
});
