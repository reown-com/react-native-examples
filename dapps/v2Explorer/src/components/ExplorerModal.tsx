import React, {useEffect, useState} from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ExplorerItem} from './ExplorerItem';

interface ExplorerModalProps {
  modalVisible: boolean;
  close: () => void;
}

// Populate with the data...
export function ExplorerModal({modalVisible, close}: ExplorerModalProps) {
  let [isLoading, setIsLoading] = useState(true);
  let [explorerData, setExplorerData] = useState([]);

  useEffect(() => {
    fetch(
      'https://explorer-api.walletconnect.com/v3/all?projectId=e899c82be21d4acca2c8aec45e893598&sdks=sign_v2&entries=8&page=1',
    )
      .then(res => res.json())
      .then(
        wallet => {
          const tempRes = [];
          Object.keys(wallet?.listings).forEach(function (key) {
            tempRes.push(wallet?.listings[key]);
          });
          setIsLoading(false);
          setExplorerData(tempRes);
        },
        error => {
          setIsLoading(false);
          console.log('error', error);
          // setError(error);
        },
      );
  }, [explorerData]);

  return (
    <Modal transparent={true} visible={modalVisible} animationType="slide">
      <View style={styles.wcContainer}>
        <View style={styles.flexRow}>
          <Image
            style={styles.wcLogo}
            source={require('../assets/WCLogo.png')}
          />
          <TouchableOpacity
            style={styles.closeContainer}
            onPress={() => close()}>
            <Image
              style={styles.closeImage}
              source={require('../assets/Close.png')}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.connectWalletContainer}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Connect your wallet</Text>
          </View>
          <ExplorerItem isLoading={isLoading} explorerData={explorerData} />
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
    height: 360,
    width: '100%',
    backgroundColor: '#0D7DF2',
    // borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
    height: '90%',
    display: 'flex',
    // flexDirection: 'column',
    paddingBottom: 60,
    width: '100%',
    backgroundColor: '#141414',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sectionTitleContainer: {
    display: 'flex',
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
  closeContainer: {
    height: 28,
    width: 28,
    backgroundColor: 'white',
    borderRadius: 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderStyle: 'solid',
  },
});
