import { View, StyleSheet } from 'react-native';
import { Verify } from '@walletconnect/types';

import { ActionButton } from '@/components/ActionButton';
import { Spacing } from '@/utils/ThemeUtil';

export interface ModalFooterProps {
  onApprove: () => void;
  onReject: () => void;
  approveLoader?: boolean;
  rejectLoader?: boolean;
  verifyContext?: Verify.Context;
  approveLabel?: string;
  rejectLabel?: string;
  disabled?: boolean;
}

export function ModalFooter({
  onApprove,
  onReject,
  approveLoader,
  rejectLoader,
  approveLabel = 'Connect',
  rejectLabel = 'Cancel',
  disabled,
}: ModalFooterProps) {
  return (
    <View style={styles.container}>
      <ActionButton
        loading={rejectLoader}
        disabled={approveLoader || rejectLoader}
        style={styles.button}
        onPress={onReject}
        variant="secondary"
      >
        {rejectLabel}
      </ActionButton>
      <ActionButton
        loading={approveLoader}
        disabled={disabled || approveLoader || rejectLoader}
        style={styles.button}
        onPress={onApprove}
      >
        {approveLabel}
      </ActionButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[4],
    paddingBottom: Spacing[8],
    width: '100%',
    paddingHorizontal: Spacing[4],
  },
  button: {
    width: '48%'
  },
});
