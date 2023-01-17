import React from 'react';
import {Modal, Alert, Text, Button, View, StyleSheet} from 'react-native';
import {SessionTypes} from '@walletconnect/types';

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
          <Text>XXX would like to connect</Text>
          <Text>REQUESTED PERMISSIONS:</Text>
          <Text>Chains:</Text>
          <Text>Methods:</Text>
          <Text>Events:</Text>
          <View style={styles.flexRow}>
            <Button onPress={handleAccept} title={'REJECT'} color="red" />
            <Button onPress={handleAccept} title={'ACCEPT'} />
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
});
