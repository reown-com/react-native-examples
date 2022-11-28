import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useSnapshot} from 'valtio';

import SettingsStore from '@/store/SettingsStore';
import ConnectTemplateSvg from '@/assets/ConnectTemplate';
import IndividualSession from './IndividualSession';

function Sessions() {
  const {sessions} = useSnapshot(SettingsStore.state);

  if (!sessions?.length) {
    return (
      <View style={styles.container}>
        <ConnectTemplateSvg height={37} width={33} />
        <Text style={styles.greyText}>
          Apps you connect with will appear here. To connect scan or paste the
          code that is displayed in the app.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollViewContainer}
      data={sessions}
      renderItem={({item}) => {
        const {name, icons, url} = item?.peer.metadata;
        return (
          <IndividualSession
            key={item.topic}
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
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greyText: {
    fontSize: 14,
    color: '#798686',
    textAlign: 'center',
  },
});
