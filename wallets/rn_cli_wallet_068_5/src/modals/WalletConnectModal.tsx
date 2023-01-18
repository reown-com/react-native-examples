import React from 'react';
import {
  Modal,
  Alert,
  Text,
  Button,
  View,
  StyleSheet,
  Image,
} from 'react-native';

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
  console.log('Modal proposal', proposal);

  // const description = proposal.params.proposer.metadata.description;
  const name = proposal?.params?.proposer?.metadata?.name;
  const nameSpaces = proposal?.params?.requiredNamespaces;
  const methods = proposal?.params?.requiredNamespaces.eip155.methods;
  const events = proposal?.params?.requiredNamespaces.eip155.events;
  const chains = proposal?.params?.requiredNamespaces.eip155.chains;
  // const name = proposal?.params?.proposer?.requiredNamespaces;
  // const url = proposal.params.proposer.metadata.url;
  const icon = proposal?.params.proposer.metadata.icons[0];

  if (proposal) {
    const {params} = proposal;
    console.log('Modal proposal NSS:', params?.requiredNamespaces);

    console.log('Modal methods2', params?.requiredNamespaces.eip155.chains);
    console.log('Modal methods2', icon);
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        open(!visible);
      }}>
      <View style={styles.container}>
        <View style={styles.modalContainer}>
          {icon && (
            <Image
              source={{uri: 'https://avatars.githubusercontent.com/u/37784886'}}
              style={styles.imageContainer}
            />
          )}

          <Text style={styles.dappTitle}>{name}</Text>
          <Text>would like to connect</Text>
          <Text style={{marginTop: 24}}>REQUESTED PERMISSIONS:</Text>
          <Text>Chains: {chains[0]}</Text>

          <Text style={{marginTop: 24}}>Methods:</Text>
          <View style={styles.flexRowWrapped}>
            {methods?.map((method: string) => (
              <Text>{method}</Text>
            ))}
          </View>
          <Text style={{marginTop: 24}}>Events:</Text>
          <View style={styles.flexRowWrapped}>
            {events?.map((event: string) => (
              <Text>{event}</Text>
            ))}
          </View>
          <View style={styles.flexRow}>
            <Button onPress={handleAccept} title={'Decline'} color="red" />
            <Button onPress={handleAccept} title={'Accept'} />
          </View>
          <Button onPress={() => open(false)} title={'close'} />
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
    display: 'flex',
    flexDirection: 'row',
  },
  flexRowWrapped: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 34,
    backgroundColor: 'rgba(242, 242, 247, 0.8)',
    width: '90%',
    height: '50%',
  },
  rejectButton: {
    color: 'red',
  },
  dappTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  imageContainer: {
    width: 48,
    height: 48,
  },
});
