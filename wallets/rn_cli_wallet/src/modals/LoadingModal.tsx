import {StyleSheet, View} from 'react-native';
import {useSnapshot} from 'valtio';
import {Icon, Text, LoadingSpinner} from '@reown/appkit-ui-react-native';

import {useTheme} from '@/hooks/useTheme';
import ModalStore from '@/store/ModalStore';

export function LoadingModal() {
  const Theme = useTheme();
  const {data} = useSnapshot(ModalStore.state);

  return (
    <View style={[styles.container, {backgroundColor: Theme['bg-125']}]}>
      {data?.errorMessage ? (
        <Icon name="warningCircle" color="error-100" width={34} height={34} />
      ) : (
        <LoadingSpinner size="xl" color="fg-200" />
      )}
      <Text center variant="paragraph-400" color="fg-200">
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
    padding: 16,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    rowGap: 16,
  },
});
