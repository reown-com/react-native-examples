import { View, StyleSheet } from 'react-native';
import { Verify } from '@walletconnect/types';

import { ActionButton } from '@/components/ActionButton';
import VerifyInfoBox from '@/components/VerifyInfoBox';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';

export interface ModalFooterProps {
  onApprove: () => void;
  onReject: () => void;
  approveLoader?: boolean;
  rejectLoader?: boolean;
  verifyContext?: Verify.Context;
}

export function ModalFooter({
  onApprove,
  onReject,
  approveLoader,
  rejectLoader,
  verifyContext,
}: ModalFooterProps) {
  const Theme = useTheme();
  const validation = verifyContext?.verified.validation;
  const isScam = verifyContext?.verified.isScam;

  const bgColor =
    isScam || validation === 'INVALID'
      ? Theme['text-error']
      : validation === 'VALID'
      ? Theme['bg-accent-primary']
      : Theme['text-warning'];

  return (
    <View style={styles.container}>
      <VerifyInfoBox isScam={isScam} validation={validation} />
      <View style={styles.buttonContainer}>
        <ActionButton
          loading={rejectLoader}
          disabled={approveLoader || rejectLoader}
          style={styles.button}
          textStyle={styles.rejectText}
          onPress={onReject}
          secondary
        >
          Reject
        </ActionButton>
        <ActionButton
          loading={approveLoader}
          disabled={approveLoader || rejectLoader}
          style={[styles.button, { backgroundColor: bgColor }]}
          textStyle={styles.approveText}
          onPress={onApprove}
        >
          Approve
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
  },
  buttonContainer: {
    marginTop: Spacing[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    width: '48%',
    height: Spacing[11],
    borderRadius: BorderRadius.full,
  },
  rejectText: {
    fontWeight: '500',
    fontSize: 16,
  },
  approveText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
