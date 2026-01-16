import { View, StyleSheet, FlatList } from 'react-native';
import { useSnapshot } from 'valtio';

import SettingsStore from '@/store/SettingsStore';
import ConnectTemplateSvg from '@/assets/ConnectTemplate';
import IndividualSession from './IndividualSession';
import { Text } from '@/components/Text';
import { Spacing } from '@/utils/ThemeUtil';

function Sessions() {
  const { sessions } = useSnapshot(SettingsStore.state);

  if (!sessions?.length) {
    return (
      <View style={styles.container}>
        <ConnectTemplateSvg height={37} width={33} />
        <Text variant="md-400" color="text-secondary" center>
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
      renderItem={({ item }) => {
        const { name, icons, url } = item?.peer.metadata;
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
    marginTop: Spacing[2],
    paddingHorizontal: Spacing[4],
  },
  container: {
    flex: 1,
    paddingTop: Spacing[4],
    paddingHorizontal: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
