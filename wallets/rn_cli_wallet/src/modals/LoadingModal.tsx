import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useSnapshot} from 'valtio';
import {Icon, Text} from '@web3modal/ui-react-native';

import {useTheme} from '@/hooks/useTheme';
import ModalStore from '@/store/ModalStore';

export function LoadingModal() {
  const Theme = useTheme();
  const {data} = useSnapshot(ModalStore.state);

  if (data?.errorMessage) {
    return (
      <View style={[styles.errorContainer, {backgroundColor: Theme['bg-125']}]}>
        <Icon name="warningCircle" color="error-100" width={60} height={60} />
        <Text center style={styles.errorText} variant="paragraph-400">
          {data.errorMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: Theme['bg-125']}]}>
      <ActivityIndicator size="large" color={Theme['accent-100']} />
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
  },
  errorContainer: {
    alignItems: 'center',
    width: '100%',
    padding: 32,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  errorText: {
    marginTop: 16,
  },
});
