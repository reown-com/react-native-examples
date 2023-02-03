import React from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';

interface IndividualSessionProps {
  name: string | undefined;
  icons: string;
  url: string;
}

//ToDo: Change to TouchableOpacity and navigate to Session on next Sprint
const IndividualSession = ({name, icons, url}: IndividualSessionProps) => {
  return (
    <View style={styles.sessionContainer}>
      <View style={styles.flexRow}>
        {icons ? (
          <Image
            source={{uri: icons.toString()}}
            style={styles.iconContainer}
          />
        ) : null}
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>{name ? name : 'No Name'}</Text>
          <Text style={styles.greyText}>{url.slice(8)} </Text>
        </View>
      </View>
      {/* // ToDo: Add in Chevron  */}
    </View>
  );
};

export default IndividualSession;

const styles = StyleSheet.create({
  sessionContainer: {
    height: 80,
    paddingVertical: 10,
    display: 'flex',
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
    display: 'flex',
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
