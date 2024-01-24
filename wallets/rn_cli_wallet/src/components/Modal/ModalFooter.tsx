import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ActionButton} from '../ActionButton';

export interface ModalFooterProps {
  onApprove: () => void;
  onReject: () => void;
  approveLoader?: boolean;
  rejectLoader?: boolean;
}

export function ModalFooter({
  onApprove,
  onReject,
  approveLoader,
  rejectLoader,
}: ModalFooterProps) {
  return (
    <View style={styles.container}>
      <ActionButton
        loading={rejectLoader}
        disabled={approveLoader || rejectLoader}
        onPress={onReject}
        secondary>
        Reject
      </ActionButton>
      <ActionButton
        loading={approveLoader}
        disabled={approveLoader || rejectLoader}
        onPress={onApprove}>
        Approve
      </ActionButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
