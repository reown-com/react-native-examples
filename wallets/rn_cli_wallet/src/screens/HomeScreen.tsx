import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';

import {web3wallet} from '../utils/WalletConnectUtil';

import Sessions from '../components/HomeScreen/Sessions';
import ActionButtons from '../components/HomeScreen/ActionButtons';
import {useNavigation} from '@react-navigation/native';

import Text from '../components/Text';
import {CopyURIDialog} from '../components/CopyURIDialog';
import Modal from '../components/Modal';
import {useInitialURL} from '../hooks/useInitialUrl';

export default function HomeScreen() {
  const navigation = useNavigation();
  const {url: initialUrl, processing} = useInitialURL();
  const [copyDialog, setCopyDialog] = useState(false);

  const handleCancel = () => {
    setCopyDialog(false);
  };

  async function pair(uri: string) {
    await web3wallet.pair({uri});
    setCopyDialog(false);
  }

  const deeplinkCallback = useCallback((event: any) => {
    const {url} = event;
    const uri = url.split('wc?uri=')[1];

    if (uri) {
      pair(uri);
    }
  }, []);

  // Handle deep link if app was closed
  useEffect(() => {
    if (initialUrl && !processing) {
      const uri = initialUrl.split('wc?uri=')[1];
      if (uri) {
        pair(uri);
      }
    }
  }, [initialUrl, processing]);

  useEffect(() => {
    // Handle deep link if app was in background
    Linking.addEventListener('url', deeplinkCallback);
  }, [deeplinkCallback]);

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <CopyURIDialog
        pair={pair}
        setVisible={handleCancel}
        visible={copyDialog}
      />

      <View style={styles.mainScreenContainer}>
        <View style={styles.flexRow}>
          <Text>Apps</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Image
              source={require('../assets/SettingsIcon.png')}
              style={styles.imageContainer}
            />
          </TouchableOpacity>
        </View>
        <Sessions />
        <ActionButtons setCopyDialog={setCopyDialog} />
      </View>
      <Modal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundStyle: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  mainScreenContainer: {
    padding: 20,
    flex: 1,
  },
  imageContainer: {
    height: 24,
    width: 24,
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
