import { StyleSheet, View } from 'react-native';
import { useSnapshot } from 'valtio';

import { useTheme } from '@/hooks/useTheme';
import ModalStore from '@/store/ModalStore';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';

export function LoadingModal() {
  const Theme = useTheme();
  const { data } = useSnapshot(ModalStore.state);

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      {data?.errorMessage ? (
        <Icon name="warningCircle" color="text-error" width={34} height={34} />
      ) : (
        <LoadingSpinner size="xl" color="text-secondary" />
      )}
      <Text center variant="paragraph-400" color="text-secondary">
        {data?.loadingMessage || data?.errorMessage || 'Loading...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '30%',
    padding: Spacing[4],
    borderTopLeftRadius: BorderRadius[8],
    borderTopRightRadius: BorderRadius[8],
    rowGap: Spacing[4],
  },
});
