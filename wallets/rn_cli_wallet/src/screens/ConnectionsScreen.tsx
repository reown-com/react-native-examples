import {useCallback, useEffect, useState} from 'react';
import {Linking} from 'react-native';

import {web3wallet} from '@/utils/WalletConnectUtil';
import Sessions from '@/components/HomeScreen/Sessions';
import ActionButtons from '@/components/HomeScreen/ActionButtons';
import {CopyURIDialog} from '@/components/CopyURIDialog';
import {ConnectionsStackScreenProps} from '@/utils/TypesUtil';
import ModalStore from '@/store/ModalStore';
import {useInitialURL} from '@/hooks/useInitialUrl';

type Props = ConnectionsStackScreenProps<'ConnectionsScreen'>;

export default function ConnectionsScreen({route}: Props) {
  const {url: initialUrl, processing} = useInitialURL();
  const [copyDialogVisible, setCopyDialogVisible] = useState(false);

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

  useEffect(() => {
    // Uri received from QR code scanner
    if (route.params?.uri) {
      pair(route.params.uri);
    }
  }, [route.params?.uri]);

  return (
    <>
      <Sessions />
      <CopyURIDialog
        onConnect={onDialogConnect}
        onCancel={onDialogCancel}
        visible={copyDialogVisible}
      />
      <ActionButtons setCopyDialog={setCopyDialogVisible} />
    </>
  );
}
