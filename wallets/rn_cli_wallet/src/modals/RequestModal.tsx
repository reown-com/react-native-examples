import {ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {CoreTypes} from '@walletconnect/types';

import {ModalHeader} from '@/components/Modal/ModalHeader';
import {ModalFooter} from '@/components/Modal/ModalFooter';
import {useTheme} from '@/hooks/useTheme';
import {useSnapshot} from 'valtio';
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
}: RequestModalProps) {
  const Theme = useTheme();
  const {currentRequestVerifyContext} = useSnapshot(SettingsStore.state);

  return (
    <View style={[styles.container, {backgroundColor: Theme['bg-125']}]}>
      <ModalHeader
        metadata={metadata}
        intention={intention}
        verifyContext={currentRequestVerifyContext}
        isLinkMode={isLinkMode}
      />
      {children}
      <ModalFooter
        onApprove={onApprove}
        onReject={onReject}
        approveLoader={approveLoader}
        rejectLoader={rejectLoader}
        verifyContext={currentRequestVerifyContext}
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
