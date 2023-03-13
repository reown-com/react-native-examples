import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View, useColorScheme, ImageBackground} from 'react-native';
import Modal from 'react-native-modal';
import {InitialExplorerContent} from './InitialExplorerContent';
import {ViewAllExplorerContent} from './ViewAllExplorerContent';

import {fetchInitialWallets, fetchViewAllWallets} from '../utils/ExplorerUtils';
import {ExplorerModalHeader} from './ExplorerModalHeader';
import Background from '../assets/Background.png';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/Platform';
import QRView from './QRView';
import {Routes} from '../constants/Routes';

const MODAL_HEIGHT = DEVICE_HEIGHT * 0.7;
const INITIAL_ROUTE = 'INIT_WALLETS';

interface ExplorerModalProps {
  modalVisible: boolean;
  close: () => void;
  currentWCURI: string;
}

// Populate with the data...
export function ExplorerModal({
  modalVisible,
  close,
  currentWCURI,
}: ExplorerModalProps) {
  // TODO: change loading names to more clearer ones.
  const [isLoading, setIsLoading] = useState(true);
  const [isViewAllLoading, setViewAllLoading] = useState(true);

  // TODO: change explorerData to more clearer names.
  const [explorerData, setExplorerData] = useState([]);
  const [viewAllExplorerData, setViewAllExplorerData] = useState([]);

  // TODO: move to utils
  const isDarkMode = useColorScheme() === 'dark';

  const [viewStack, setViewStack] = useState<Routes[]>([INITIAL_ROUTE]);

  // TODO: could be cleaner
  const fetchWallets = useCallback(() => {
    fetchInitialWallets().then(wallets => {
      setIsLoading(false);
      setExplorerData(wallets);
    });

    fetchViewAllWallets().then(wallets => {
      setViewAllLoading(false);
      setViewAllExplorerData(wallets);
    });
  }, []);

  const onNavigate = useCallback(
    (route: Routes) => {
      setViewStack([...viewStack, route]);
    },
    [viewStack],
  );

  const onBackPress = useCallback(() => {
    if (viewStack.length > 1) {
      setViewStack(viewStack.slice(0, -1));
    }
  }, [viewStack]);

  const SCREENS = useMemo(() => {
    return {
      ['INIT_WALLETS']: (
        <InitialExplorerContent
          isLoading={isLoading}
          explorerData={explorerData}
          onViewAllPress={() => onNavigate('ALL_WALLETS')}
          currentWCURI={currentWCURI}
          onQRPress={() => onNavigate('QR_CODE')}
        />
      ),
      ['ALL_WALLETS']: (
        <ViewAllExplorerContent
          isLoading={isViewAllLoading}
          explorerData={viewAllExplorerData}
          onBackPress={onBackPress}
          currentWCURI={currentWCURI}
        />
      ),
      ['QR_CODE']: <QRView uri={currentWCURI} onBackPress={onBackPress} />,
    };
  }, [
    currentWCURI,
    explorerData,
    isLoading,
    isViewAllLoading,
    onBackPress,
    onNavigate,
    viewAllExplorerData,
  ]);

  useEffect(() => {
    if (!explorerData.length) {
      fetchWallets();
    }
  }, [explorerData, fetchWallets, isLoading, isViewAllLoading]);

  return (
    <Modal
      isVisible={modalVisible}
      style={styles.modal}
      hideModalContentWhileAnimating
      onModalHide={() => {
        setViewStack([INITIAL_ROUTE]);
      }}
      useNativeDriver>
      <ImageBackground
        style={styles.wcContainer}
        source={Background}
        imageStyle={styles.wcImage}>
        <ExplorerModalHeader close={close} />
        <View
          style={
            isDarkMode
              ? styles.connectWalletContainer
              : styles.connectWalletContainerLight
          }>
          {SCREENS[viewStack.at(-1) || INITIAL_ROUTE]}
        </View>
      </ImageBackground>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    width: DEVICE_WIDTH,
  },
  wcContainer: {
    position: 'absolute',
    bottom: -20,
  },
  wcImage: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  flexRow: {
    paddingVertical: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  wcContainerText: {
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 24,
  },
  connectWalletContainer: {
    maxHeight: MODAL_HEIGHT,
    display: 'flex',
    backgroundColor: '#141414',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  connectWalletContainerLight: {
    height: '100%',
    display: 'flex',
    maxHeight: MODAL_HEIGHT,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sectionTitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: 'white',
    fontSize: 20,
    lineHeight: 24,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },

  chevronImage: {
    width: 8,
    height: 18,
  },
  closeContainer: {
    height: 28,
    width: 28,
    backgroundColor: '#141414',
    borderRadius: 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeContainerLight: {
    height: 28,
    width: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
