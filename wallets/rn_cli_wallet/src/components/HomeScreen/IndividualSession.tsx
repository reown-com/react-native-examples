import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Image, Text, StyleSheet, TouchableOpacity} from 'react-native';
import SvgChevronRight from '../../assets/ChevronRight';
import {useTheme} from '../../hooks/useTheme';

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
          <Text style={styles.mainText}>{name ? name : 'No Name'}</Text>
          <Text style={styles.greyText}>{url.slice(8)} </Text>
        </View>
      </View>
      <SvgChevronRight fill={Theme['fg-250']} height={16} width={16} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    paddingLeft: 10,
  },
  mainText: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  greyText: {
    fontSize: 13,
    lineHeight: 28,
    color: '#798686',
  },
});
