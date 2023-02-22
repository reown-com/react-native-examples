import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View, useColorScheme, Dimensions} from 'react-native';
import Modal from 'react-native-modal';
import {InitialExplorerContent} from './InitialExplorerContent';
import {ViewAllExplorerContent} from './ViewAllExplorerContent';

//@ts-expect-error - `@env` is a virtualised module via Babel config.
import {fetchInitialWallets, fetchViewAllWallets} from '../utils/ExplorerUtils';
import {ExplorerModalHeader} from './ExplorerModalHeader';

const MODAL_HEIGHT = Dimensions.get('window').height * 0.7;
const DEVICE_WIDTH = Dimensions.get('window').width;

interface ExplorerModalProps {
  modalVisible: boolean;
  close: () => void;
}

// Populate with the data...
export function ExplorerModal({modalVisible, close}: ExplorerModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isViewAllLoading, setViewAllLoading] = useState(true);

  const [viewAllContentVisible, setViewAllContentVisible] = useState(false);
  const [explorerData, setExplorerData] = useState([]);
  const [viewAllExplorerData, setViewAllExplorerData] = useState([]);

  const isDarkMode = useColorScheme() === 'dark';

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

  useEffect(() => {
    if (!explorerData.length) {
      fetchWallets();
    }
  }, [explorerData, fetchWallets, isLoading, isViewAllLoading]);

  return (
    <Modal
      isVisible={modalVisible}
      onModalHide={() => setViewAllContentVisible(false)}
      useNativeDriver>
      <View style={styles.wcContainer}>
        <ExplorerModalHeader close={close} />
        <View
          style={
            isDarkMode
              ? styles.connectWalletContainer
              : styles.connectWalletContainerLight
          }>
          {!viewAllContentVisible ? (
            <InitialExplorerContent
              isLoading={isLoading}
              explorerData={explorerData}
              setViewAllContentVisible={setViewAllContentVisible}
            />
          ) : (
            <ViewAllExplorerContent
              explorerData={viewAllExplorerData}
              setViewAllContentVisible={setViewAllContentVisible}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wcContainer: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: DEVICE_WIDTH,
    backgroundColor: '#0D7DF2',
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
