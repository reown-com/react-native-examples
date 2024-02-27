import React, {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {CoreTypes} from '@walletconnect/types';
import {ModalHeader} from '../components/Modal/ModalHeader';
import {ModalFooter} from '../components/Modal/ModalFooter';
import {useTheme} from '@/hooks/useTheme';

export interface RequestModalProps {
  children: ReactNode;
  metadata?: CoreTypes.Metadata;
  onApprove: () => void;
  onReject: () => void;
  approveLoader?: boolean;
  rejectLoader?: boolean;
  intention?: string;
}

export function RequestModal({
  children,
  metadata,
  onApprove,
  onReject,
  approveLoader,
  rejectLoader,
  intention,
}: RequestModalProps) {
  const Theme = useTheme();
  return (
    <View style={[styles.container, {backgroundColor: Theme['bg-125']}]}>
      <ModalHeader metadata={metadata} intention={intention} />
      {children}
      <ModalFooter
        onApprove={onApprove}
        onReject={onReject}
        approveLoader={approveLoader}
        rejectLoader={rejectLoader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 34,
    width: '100%',
    padding: 16,
  },
});
