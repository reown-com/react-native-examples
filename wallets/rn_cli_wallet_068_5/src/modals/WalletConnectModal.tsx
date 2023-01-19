import React from 'react';
import {Text, Button, View, StyleSheet, Image} from 'react-native';
import Modal from 'react-native-modal';
import {AcceptRejectButton} from '../components/AcceptRejectButton';
import {Tag} from '../components/Tag';

interface WalletConnectModalProps {
  proposal: any; //ToDo: fix.
  visible: boolean;
  open: (arg0: boolean) => void;
  handleAccept: (arg0: any) => void;
}

export function WalletConnectModal({
  proposal,
  visible,
  open,
  handleAccept,
}: WalletConnectModalProps) {
  const name = proposal?.params?.proposer?.metadata?.name;
  const url = proposal?.params?.proposer?.metadata.url;
  const methods = proposal?.params?.requiredNamespaces.eip155.methods;
  const events = proposal?.params?.requiredNamespaces.eip155.events;
  const chains = proposal?.params?.requiredNamespaces.eip155.chains;
  const icon = proposal?.params.proposer.metadata.icons[0];

  return (
    <Modal isVisible={visible} backdropOpacity={0.6}>
      <View style={styles.container}>
        <View style={styles.modalContainer}>
          {/* <View
            style={{
              height: 60,
              width: '100%',
              borderWidth: 1,
              borderColor: 'grey',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}> */}
          {icon && (
            <Image
              source={{
                uri: 'https://avatars.githubusercontent.com/u/37784886',
              }}
              style={styles.imageContainer}
            />
          )}
          {/* {icon && (
            <Image
              source={{
                uri: 'https://avatars.githubusercontent.com/u/37784886',
              }}
              style={styles.imageContainer}
            />
          )} */}
          {/* </View> */}
          <Text style={styles.dappTitle}>{name}</Text>
          <Text style={styles.wouldLikeToConnectText}>
            would like to connect
          </Text>
          <Text style={styles.urlText}>{url?.slice(8)}</Text>

          <View style={styles.divider} />

          <Text style={styles.permissionsText}>REQUESTED PERMISSIONS:</Text>

          <View style={styles.chainContainer}>
            <Tag value={chains?.[0].toUpperCase()} grey={true} />

            <View style={styles.methodsContainer}>
              <Text style={styles.methodEventsTitle}>Methods</Text>
              <View style={styles.flexRowWrapped}>
                {methods?.map((method: string, index: number) => (
                  <Tag key={index} value={method} />
                ))}
              </View>
            </View>

            <View style={styles.methodsContainer}>
              <Text style={styles.methodEventsTitle}>Events</Text>
              <View style={styles.flexRowWrapped}>
                {events?.map((event: string, index: number) => (
                  <Tag key={index} value={event} />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.flexRow}>
            <AcceptRejectButton accept={false} onPress={handleAccept} />
            <AcceptRejectButton accept={true} onPress={handleAccept} />
            {/* <Button onPress={handleAccept} title={'Decline'} color="red" /> */}
            {/* <Button onPress={handleAccept} title={'Accept'} /> */}
          </View>
          {/* <Button onPress={() => open(false)} title={'close'} /> */}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flex: 1,
    flexDirection: 'row',
  },
  flexRowWrapped: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 34,
    backgroundColor: 'rgba(242, 242, 247, 0.8)',
    width: '100%',
    paddingVertical: 16,
    minHeight: '70%',
  },
  rejectButton: {
    color: 'red',
  },
  dappTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  wouldLikeToConnectText: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    opacity: 0.6,
  },
  urlText: {
    paddingTop: 8,
    color: 'rgba(60, 60, 67, 0.6)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(60, 60, 67, 0.36)',
    marginVertical: 16,
  },
  permissionsText: {
    // paddingTop: 8,
    color: 'rgba(60, 60, 67, 0.6)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    paddingBottom: 8,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginBottom: 8,
  },
  chainContainer: {
    width: '80%',
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(80, 80, 89, 0.1)',
  },
  methodsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodEventsTitle: {
    color: 'rgba(121, 134, 134, 1)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    paddingLeft: 6,
    paddingVertical: 4,
  },
});
