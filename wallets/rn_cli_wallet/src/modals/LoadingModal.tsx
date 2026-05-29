import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSnapshot } from 'valtio';

import { useTheme } from '@/hooks/useTheme';
import ModalStore from '@/store/ModalStore';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { ModalCloseButton } from '@/components/ModalCloseButton';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { WalletConnectLoading } from '@/components/WalletConnectLoading';
import { haptics } from '@/utils/haptics';

export function LoadingModal() {
  const Theme = useTheme();
  const { data } = useSnapshot(ModalStore.state);

  useEffect(() => {
    if (data?.errorMessage || data?.errorTitle) {
      haptics.error();
    }
  }, [data?.errorMessage, data?.errorTitle]);

  const onClose = () => {
    ModalStore.close();
  };

  // When an errorTitle is set, it acts as the heading and errorMessage as the
  // supporting body. Otherwise fall back to the single-line legacy behavior.
  const title =
    data?.errorTitle ||
    data?.loadingMessage ||
    data?.errorMessage ||
    'Loading...';
  const body = data?.errorTitle ? data?.errorMessage : undefined;

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      <ModalCloseButton onPress={onClose} style={styles.closeButton} />
      {data?.errorMessage || data?.errorTitle ? (
        <Icon name="warningCircle" color="text-error" width={48} height={48} />
      ) : (
        <WalletConnectLoading size={120} />
      )}
      <View style={styles.textContainer}>
        <Text center variant="h6-400" color="text-primary">
          {title}
        </Text>
        {body ? (
          <Text center variant="md-400" color="text-secondary">
            {body}
          </Text>
        ) : null}
      </View>
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
  textContainer: {
    alignItems: 'center',
    rowGap: Spacing[2],
  },
  closeButton: {
    marginRight: Spacing[1],
    marginTop: Spacing[1],
    marginBottom: Spacing[3],
    alignSelf: 'flex-end',
  },
});
