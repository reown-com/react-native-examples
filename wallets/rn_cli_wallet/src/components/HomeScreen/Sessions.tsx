import React from 'react';
import {View, Image, Text, StyleSheet, ScrollView} from 'react-native';
import IndividualSession from './IndividualSession';
import {useSnapshot} from 'valtio';
import SettingsStore from '../../store/SettingsStore';

const TickImage = require('../../assets/Tick.png');

function Sessions() {
  const {sessions} = useSnapshot(SettingsStore.state);

  // @notice: Empty State with no Session
  if (!sessions || sessions.length === 0) {
    return (
      <View style={styles.container}>
        <Image source={TickImage} style={styles.imageContainer} />
        <Text style={styles.greyText}>
          Apps you connect with will appear here. To connect paste the code that
          is displayed in the app.
        </Text>
      </View>
    );
  }

  // @notice: Main Rendering of Sessions
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      {sessions.map((session, index) => {
        const {name, icons, url} = session?.peer.metadata;
        return (
          <IndividualSession
            key={index}
            icons={icons.toString()}
            name={name}
            url={url}
          />
        );
      })}
    </ScrollView>
  );
}

export default Sessions;

const styles = StyleSheet.create({
  scrollViewContainer: {
    marginTop: 16,
  },
  sessionContainer: {
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
  greyText: {
    fontSize: 14,
    color: '#798686',
    textAlign: 'center',
  },
  imageContainer: {
    height: 30,
    width: 35,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
