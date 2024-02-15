import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, Linking} from 'react-native';

import {web3wallet} from '@/utils/WalletConnectUtil';

import Sessions from '../components/HomeScreen/Sessions';
import ActionButtons from '../components/HomeScreen/ActionButtons';

import CustomText from '../components/Text';
import {CopyURIDialog} from '../components/CopyURIDialog';
import Modal from '../components/Modal';
import {HomeTabScreenProps} from '../utils/TypesUtil';
import ModalStore from '../store/ModalStore';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useInitialURL} from '@/hooks/useInitialUrl';

type Props = HomeTabScreenProps<'ConnectionsStack'>;

export default function ConnectionsScreen({route}: Props) {
  const {url: initialUrl, processing} = useInitialURL();
  const [copyDialogVisible, setCopyDialogVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const onDialogConnect = (uri: string) => {
    setCopyDialogVisible(false);
    setTimeout(() => {
      pair(uri);
    }, 1000);
  };

  const onDialogCancel = () => {
    setCopyDialogVisible(false);
  };

  async function pair(uri: string) {
    ModalStore.open('LoadingModal', {});
    await web3wallet.pair({uri});
    setCopyDialogVisible(false);
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
    <React.Fragment>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={[styles.container]}>
        <CopyURIDialog
          onConnect={onDialogConnect}
          onCancel={onDialogCancel}
          visible={copyDialogVisible}
        />
        <Sessions />
      </ScrollView>
      <Modal />
      <ActionButtons setCopyDialog={setCopyDialogVisible} />
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  mainScreenContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },
});
