import React from 'react';
import {Modal, Alert, Text, Button, View} from 'react-native';

interface WalletConnectModalProps {
  visible: boolean;
  open: (arg0: boolean) => void;
}

export function WalletConnectModal({visible, open}: WalletConnectModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        open(!visible);
      }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            borderWidth: 1,
            borderRadius: 34,
            backgroundColor: 'rgba(242, 242, 247, 0.8)',
            width: '90%',
            height: '50%',
          }}>
          <Text>Hi</Text>
          <Text>Close</Text>
          <Button onPress={() => open(false)} title={'close'}></Button>
        </View>
      </View>
    </Modal>
  );
}
