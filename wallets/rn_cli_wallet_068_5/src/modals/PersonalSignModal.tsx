import React from 'react';
import {Alert, Text, Button, View, StyleSheet, Image} from 'react-native';
import Modal from 'react-native-modal';

interface PersonalSignModalProps {
  proposal: any; //ToDo: fix.
  visible: boolean;
  open: (arg0: boolean) => void;
  setVisible: () => void;
}

export function PersonalSignModal({
  proposal,
  visible,
  open,
  setVisible,
  handleAccept,
}: PersonalSignModalProps) {
  // const description = proposal.params.proposer.metadata.description;
  // const name = proposal?.params?.proposer?.metadata?.name;
  // const methods = proposal?.params?.requiredNamespaces.eip155.methods;
  // const events = proposal?.params?.requiredNamespaces.eip155.events;
  // const chains = proposal?.params?.requiredNamespaces.eip155.chains;
  // const icon = proposal?.params.proposer.metadata.icons[0];

  console.log('PersonalSignModal VISIBLE', visible);

  return (
    <Modal
      onModalHide={() => {
        console.debug('helloOpning...');
      }}
      backdropColor={'transparent'}
      isVisible={visible}>
      <View style={styles.container}>
        <View style={styles.modalContainer}>
          <Text> Personal Sign Modal</Text>
          <Button onPress={() => setVisible(false)} title={'close'} />
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
    // backgroundColor: 'rgba(242, 242, 247, 0.8)',
    backgroundColor: 'white',
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
