import {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {CoreTypes, Verify} from '@walletconnect/types';

import {ModalHeader} from '@/components/Modal/ModalHeader';
import {ModalFooter} from '@/components/Modal/ModalFooter';
import {useTheme} from '@/hooks/useTheme';

export interface RequestModalProps {
  children: ReactNode;
  metadata?: CoreTypes.Metadata;
  onApprove: () => void;
  onReject: () => void;
  approveLoader?: boolean;
  rejectLoader?: boolean;
  intention?: string;
  verifyContext?: Verify.Context;
}

export function RequestModal({
  children,
  metadata,
  onApprove,
  onReject,
  approveLoader,
  rejectLoader,
  intention,
  verifyContext,
}: RequestModalProps) {
  const Theme = useTheme();
  return (
    <View style={[styles.container, {backgroundColor: Theme['bg-125']}]}>
      <ModalHeader
        metadata={metadata}
        intention={intention}
        verifyContext={verifyContext}
      />
      {children}
      <ModalFooter
        onApprove={onApprove}
        onReject={onReject}
        approveLoader={approveLoader}
        rejectLoader={rejectLoader}
        verifyContext={verifyContext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    width: '100%',
  },
});
