import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';

interface ExplorerModalProps {
  onPress: () => void;
}

// Populate with the data...
export function ExplorerModal({onPress}: ExplorerModalProps) {
  let [isLoading, setIsLoading] = useState(true);
  let [explorerData, setExplorerData] = useState([]);

  useEffect(() => {
    fetch(
      'https://explorer-api.walletconnect.com/v3/all?projectId=e899c82be21d4acca2c8aec45e893598&sdks=sign_v2&entries=12&page=1',
    )
      .then(res => res.json())
      .then(
        wallet => {
          const tempRes = [];
          Object.keys(wallet?.listings).forEach(function (key, value) {
            // myObject[key] *= 2;
            // console.log('Key name', wallet?.listings[key].name);
            tempRes.push(wallet?.listings[key]);
          });
          // console.log('result', wallet?.listings);
          // setIsLoading(false);
          // setResponse(result);
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

  const ExplorerItems = () => {
    if (isLoading) {
      return <ActivityIndicator color="#FFFFFF" />;
    }

    return (
      <TouchableOpacity
        onPress={() => onPress()}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {explorerData.map((item, index) => {
          return (
            <View
              key={index}
              style={{
                width: '33%',
                height: 80,

                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                style={{height: 32, width: 32, borderRadius: 4}}
                source={{uri: item.image_url.md}}
              />
              <View style={{height: 32, marginTop: 4}}>
                <Text style={{color: 'white'}} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            </View>
          );
        })}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wcContainer}>
      <View style={styles.flexRow}>
        <Text style={styles.wcContainerText}>[LOGO] WalletConnect</Text>
        <Text style={styles.wcContainerText}>X</Text>
      </View>
      <View style={styles.connectWalletContainer}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Connect Wallet</Text>
        </View>
        {ExplorerItems()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wcContainer: {
    display: 'flex',
    position: 'absolute',
    bottom: 60,
    height: 380,
    width: '100%',
    backgroundColor: '#5F9FF8',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wcContainerText: {
    fontWeight: '600',
    color: 'white',
    fontSize: 20,
    lineHeight: 24,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  connectWalletContainer: {
    marginTop: 24,
    height: '100%',
    display: 'flex',
    paddingBottom: 48,
    // position: 'absolute',
    // bottom: 0,
    // height: 300,
    width: '100%',
    backgroundColor: '#141414',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sectionTitleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    // height: 50,
    paddingTop: 8,
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
});
