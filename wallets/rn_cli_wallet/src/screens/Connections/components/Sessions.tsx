import { View, StyleSheet, FlatList } from 'react-native';
import { useSnapshot } from 'valtio';
import { SessionTypes } from '@walletconnect/types';

import SettingsStore from '@/store/SettingsStore';
import ModalStore from '@/store/ModalStore';
import IndividualSession from './IndividualSession';
import { Text } from '@/components/Text';
import { ActionButton } from '@/components/ActionButton';
import { Spacing } from '@/utils/ThemeUtil';
import { useTheme } from '@/hooks/useTheme';

function Sessions() {
  const Theme = useTheme();
  const { sessions } = useSnapshot(SettingsStore.state);

  if (!sessions?.length) {
    return (
      <View
        style={[styles.container, styles.emptyStateContainer, { backgroundColor: Theme['bg-primary'] }]}
      >
        <Text variant="h6-400" color="text-primary">
          No connected apps yet
        </Text>
        <Text variant="lg-400" color="text-secondary" center>
          Apps you connect will show up here. Scan a QR code to add your first one.
        </Text>
        <ActionButton
          style={styles.emptyStateButton}
          fullWidth
          onPress={() => ModalStore.open('ScannerOptionsModal', {})}
        >
          Scan QR code
        </ActionButton>
      </View>
    );
  }

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      style={styles.scrollView}
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
            session={item as SessionTypes.Struct}
          />
        );
      }}
    />
  );
}

export default Sessions;

const styles = StyleSheet.create({
  scrollView: {
    paddingTop: Spacing[3],
  },
  scrollViewContainer: {
    marginTop: Spacing[2],
    paddingHorizontal: Spacing[4],
  },
  container: {
    flex: 1,
    gap: Spacing[2],
    paddingTop: Spacing[4],
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    paddingHorizontal: Spacing[6],
  },
  emptyStateButton: {
    marginTop: Spacing[4],
  },
});
