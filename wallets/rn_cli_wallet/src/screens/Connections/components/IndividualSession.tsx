import {useNavigation} from '@react-navigation/native';
import {View, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';

import SvgChevronRight from '@/assets/ChevronRight';
import {useTheme} from '@/hooks/useTheme';

interface IndividualSessionProps {
  name: string | undefined;
  icons: string;
  url: string;
  topic: string;
}

const IndividualSession = ({
  name,
  icons,
  url,
  topic,
}: IndividualSessionProps) => {
  const icon = icons ? icons : null;
  const navigator = useNavigation();
  const Theme = useTheme();
  const textColor = Theme['fg-100'];

  const onPress = () => {
    navigator.navigate('SessionDetail', {topic: topic});
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.flexRow}>
        {icon ? (
          <Image source={{uri: icon}} style={styles.iconContainer} />
        ) : null}
        <View style={styles.textContainer}>
          <Text style={[styles.mainText, {color: textColor}]}>
            {name ? name : 'No Name'}
          </Text>
          <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="middle">
            {url}
          </Text>
        </View>
        <SvgChevronRight fill={Theme['fg-250']} height={16} width={16} />
      </View>
    </TouchableOpacity>
  );
};

export default IndividualSession;

const styles = StyleSheet.create({
  container: {
    height: 80,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    paddingLeft: 10,
    marginRight: 10,
    flex: 1,
  },
  mainText: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  urlText: {
    fontSize: 13,
    lineHeight: 28,
    color: '#798686',
  },
});
