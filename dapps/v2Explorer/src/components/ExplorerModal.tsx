import React, {useEffect, useState} from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {InitialExplorerContent} from './InitialExplorerContent';
import {ViewAllExplorerContent} from './ViewAllExplorerContent';

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {fetchInitialWallets, fetchViewAllWallets} from '../utils/ExplorerUtils';

interface ExplorerModalProps {
  modalVisible: boolean;
  // viewAllContentVisible: boolean;
  // setViewAllContentVisible: (value: boolean) => void;
  close: () => void;
}

// Populate with the data...
export function ExplorerModal({
  modalVisible,
  close,
}: // setViewAllContentVisible,
// viewAllContentVisible,
ExplorerModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  const [viewAllContentVisible, setViewAllContentVisible] = useState(false);
  const [explorerData, setExplorerData] = useState([]);
  const [viewAllExplorerData, setViewAllExplorerData] = useState([]);

  const isDarkMode = useColorScheme() === 'dark';

  const fetchWallets = async () => {
    Promise.all([
      fetchInitialWallets(setIsLoading, setExplorerData),
      fetchViewAllWallets(setIsLoading, setViewAllExplorerData),
    ]);
  };

  useEffect(() => {
    fetchWallets();
  }, [explorerData]);

  const openViewAllContent = () => {
    setViewAllContentVisible(true);
  };

  return (
    <Modal transparent={true} visible={modalVisible} animationType="slide">
      <View style={styles.wcContainer}>
        <View style={styles.flexRow}>
          <Image
            style={styles.wcLogo}
            source={require('../assets/WCLogo.png')}
          />
          <TouchableOpacity
            style={
              isDarkMode ? styles.closeContainer : styles.closeContainerLight
            }
            onPress={() => close()}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
            <Image
              style={styles.closeImage}
              source={
                isDarkMode
                  ? require('../assets/CloseWhite.png')
                  : require('../assets/Close.png')
              }
            />
          </TouchableOpacity>
        </View>
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
              openViewAllContent={openViewAllContent}
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
    display: 'flex',
    position: 'absolute',
    bottom: 0,
    maxHeight: 600,
    width: '100%',
    backgroundColor: '#0D7DF2',
    // borderWidth: 1,
    // borderColor: 'rgba(0, 0, 0, 0.1)',
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
    height: '100%',
    display: 'flex',
    paddingBottom: 24,
    width: '100%',
    backgroundColor: '#141414',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  connectWalletContainerLight: {
    height: '100%',
    display: 'flex',
    paddingBottom: 24,
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
  wcLogo: {
    width: 181,
    height: 28,
  },
  closeImage: {
    width: 12,
    height: 12,
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
function initialWallets() {
  throw new Error('Function not implemented.');
}
