import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import IndividualSession from './IndividualSession';
import {useSnapshot} from 'valtio';
import SettingsStore from '../../store/SettingsStore';
import ConnectTemplateSvg from '../../assets/ConnectTemplate';

function Sessions() {
  const {sessions} = useSnapshot(SettingsStore.state);

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollViewContainer}
      ListEmptyComponent={() => (
        <View style={styles.container}>
          <ConnectTemplateSvg height={40} width={40} />
          <Text style={styles.greyText}>
            Apps you connect with will appear here. To connect paste the code
            that is displayed in the app.
          </Text>
        </View>
      )}
      data={sessions || []}
      renderItem={({item}) => {
        const {name, icons, url} = item?.peer.metadata;
        return (
          <IndividualSession
            icons={icons.toString()}
            name={name}
            url={url}
            topic={item.topic}
          />
        );
      }}
    />
  );
}

export default Sessions;

const styles = StyleSheet.create({
  scrollViewContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sessionContainer: {
    height: 80,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 32,
  },
});
