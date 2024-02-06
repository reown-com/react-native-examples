import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors} from '../utils/theme';

export default function SubscriptionItem({
  title,
  description,
  imageURL,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        {
          backgroundColor: pressed ? colors.background : 'transparent',
        },
        styles.container,
      ]}>
      <View style={styles.imageContainer}>
        <View style={styles.imageBorder} />
        <Image source={{uri: imageURL}} style={styles.image} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
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
    borderBottomWidth: 1,
    borderColor: colors.backgroundActive,
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  description: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.secondary,
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
