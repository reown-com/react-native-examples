import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { CoreTypes } from '@walletconnect/types';

import { ModalHeader } from '@/components/Modal/ModalHeader';
import { ModalFooter } from '@/components/Modal/ModalFooter';
import { useTheme } from '@/hooks/useTheme';
import { useSnapshot } from 'valtio';
import SettingsStore from '@/store/SettingsStore';

export interface RequestModalProps {
  children: ReactNode;
  metadata?: CoreTypes.Metadata;
  onApprove: () => void;
  onReject: () => void;
  approveLoader?: boolean;
  rejectLoader?: boolean;
  intention?: string;
  isLinkMode?: boolean;
  approveLabel?: string;
  rejectLabel?: string;
  approveDisabled?: boolean;
}

export function RequestModal({
  children,
  metadata,
  onApprove,
  onReject,
  approveLoader,
  rejectLoader,
  intention,
  isLinkMode,
  approveLabel = 'Connect',
  rejectLabel = 'Cancel',
  approveDisabled,
}: RequestModalProps) {
  const Theme = useTheme();
  const { currentRequestVerifyContext } = useSnapshot(SettingsStore.state);

  const onClose = () => {
    onReject();
  };

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      <ModalHeader
        metadata={metadata}
        intention={intention}
        isLinkMode={isLinkMode}
        onClose={onClose}
      />
      {children}
      <ModalFooter
        onApprove={onApprove}
        onReject={onReject}
        approveLoader={approveLoader}
        rejectLoader={rejectLoader}
        verifyContext={currentRequestVerifyContext}
        approveLabel={approveLabel}
        rejectLabel={rejectLabel}
        disabled={approveDisabled}
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
    maxHeight: '80%',
  },
});
