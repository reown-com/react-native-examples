import { Verify } from '@walletconnect/types';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/primitives/text';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';

interface VerifyBadgeProps {
  verifyContext?: Verify.Context;
}

export function VerifyBadge({ verifyContext }: VerifyBadgeProps) {
  const successBg = useThemeColor('icon-success');
  const warningBg = useThemeColor('bg-warning');
  const warningText = useThemeColor('text-warning');
  const errorBg = useThemeColor('bg-error');
  const errorText = useThemeColor('text-error');

  const validation = verifyContext?.verified.validation;
  const isScam = verifyContext?.verified.isScam;

  // Determine badge style based on validation status
  let backgroundColor: string;
  let textColor: string;
  let text: string;

  if (isScam) {
    backgroundColor = errorBg;
    textColor = errorText;
    text = 'Potential threat';
  } else if (validation === 'INVALID') {
    backgroundColor = errorBg;
    textColor = errorText;
    text = 'Invalid domain';
  } else if (validation === 'VALID') {
    backgroundColor = successBg;
    textColor = '#FFFFFF';
    text = 'Verified';
  } else {
    // UNKNOWN or undefined
    backgroundColor = warningBg;
    textColor = warningText;
    text = 'Cannot verify';
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text fontSize={14} style={{ color: textColor, fontWeight: '500' }}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['spacing-1'],
    borderRadius: BorderRadius['2'],
    paddingHorizontal: Spacing['spacing-2'],
    paddingVertical: Spacing['spacing-1'],
  },
});
