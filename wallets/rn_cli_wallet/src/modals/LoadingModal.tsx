import { StyleSheet, View } from 'react-native';
import { useSnapshot } from 'valtio';

import { useTheme } from '@/hooks/useTheme';
import ModalStore from '@/store/ModalStore';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { ModalCloseButton } from '@/components/ModalCloseButton';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { WalletConnectLoading } from '@/components/WalletConnectLoading';

export function LoadingModal() {
  const Theme = useTheme();
  const { data } = useSnapshot(ModalStore.state);

  const onClose = () => {
    ModalStore.close();
  };

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      <ModalCloseButton onPress={onClose} style={styles.closeButton} />
      {data?.errorMessage ? (
        <Icon name="warningCircle" color="text-error" width={48} height={48} />
      ) : (
        <WalletConnectLoading size={120} />
      )}
      <Text center variant="h6-400" color="text-primary">
        {data?.loadingMessage || data?.errorMessage || 'Loading...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[5],
    paddingBottom: Spacing[11],
    borderTopLeftRadius: BorderRadius[8],
    borderTopRightRadius: BorderRadius[8],
    rowGap: Spacing[4],
  },
  closeButton: {
    marginRight: Spacing[1],
    marginTop: Spacing[1],
    marginBottom: Spacing[3],
    alignSelf: 'flex-end',
  },
});
