import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, Linking} from 'react-native';

import {web3wallet} from '../utils/WalletConnectUtil';

import Sessions from '../components/HomeScreen/Sessions';
import ActionButtons from '../components/HomeScreen/ActionButtons';

import CustomText from '../components/Text';
import {CopyURIDialog} from '../components/CopyURIDialog';
import Modal from '../components/Modal';
import {useInitialURL} from '../hooks/useInitialUrl';
import {HomeTabScreenProps} from '../utils/TypesUtil';
import ModalStore from '../store/ModalStore';

type Props = HomeTabScreenProps<'Connections'>;

export default function ConnectionsView({route}: Props) {
  const {url: initialUrl, processing} = useInitialURL();
  const [copyDialog, setCopyDialog] = useState(false);

  const handleCancel = () => {
    setCopyDialog(false);
  };

  async function pair(uri: string) {
    ModalStore.open('LoadingModal', {});
    await web3wallet.pair({uri});
    setCopyDialog(false);
  }

  const deeplinkCallback = useCallback((event: any) => {
    const {url} = event;
    const uri = url.split('wc?uri=')[1];

    if (uri) {
      pair(decodeURIComponent(uri));
    }
  }, []);

  // Handle deep link if app was closed
  useEffect(() => {
    if (initialUrl && !processing) {
      const uri = initialUrl.split('wc?uri=')[1];
      if (uri) {
        pair(decodeURIComponent(uri));
      }
    }
  }, [initialUrl, processing]);

  useEffect(() => {
    // Handle deep link if app was in background
    Linking.addEventListener('url', deeplinkCallback);
  }, [deeplinkCallback]);

  React.useEffect(() => {
    // Uri received from QR code scanner
    if (route.params?.uri) {
      pair(route.params.uri);
    }
  }, [route.params?.uri]);

  return (
    <View style={styles.container}>
      <CopyURIDialog
        pair={pair}
        setVisible={handleCancel}
        visible={copyDialog}
      />
      <CustomText>Connections</CustomText>
      <View style={styles.mainScreenContainer}>
        <Sessions />
        <ActionButtons setCopyDialog={setCopyDialog} />
      </View>
      <Modal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  mainScreenContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },
});
