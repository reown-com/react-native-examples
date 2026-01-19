import { View, StyleSheet } from 'react-native';
import { Verify } from '@walletconnect/types';

import { ActionButton } from '@/components/ActionButton';
import VerifyInfoBox from '@/components/VerifyInfoBox';
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
  verifyContext,
  approveLabel = 'Connect',
  rejectLabel = 'Cancel',
  disabled,
}: ModalFooterProps) {
  const validation = verifyContext?.verified.validation;
  const isScam = verifyContext?.verified.isScam;

  return (
    <View style={styles.container}>
      <VerifyInfoBox isScam={isScam} validation={validation} />
      <View style={styles.buttonContainer}>
        <ActionButton
          loading={rejectLoader}
          disabled={approveLoader || rejectLoader}
          style={styles.button}
          onPress={onReject}
          secondary
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: Spacing[4],
    paddingBottom: Spacing[8],
    width: '100%',
    paddingHorizontal: Spacing[4],
  },
  buttonContainer: {
    marginTop: Spacing[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    width: '48%'
  },
});
