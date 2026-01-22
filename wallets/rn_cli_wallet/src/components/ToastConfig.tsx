import { View, StyleSheet, StatusBar } from 'react-native';
import { ToastConfigParams } from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing } from '@/utils/ThemeUtil';
import SvgXCircle from '@/assets/XCircle';
import SvgCheckCircle from '@/assets/CheckCircle';

type ToastProps = ToastConfigParams<unknown>;

function BaseToast({ text1, text2, type }: ToastProps) {
  const Theme = useTheme();
  const { top } = useSafeAreaInsets();
  const Icon = type === 'error' ? SvgXCircle : SvgCheckCircle;
  const iconColor = type === 'error' ? Theme['icon-error'] : Theme['icon-success'];

  return (
    <View style={[styles.container, { backgroundColor: Theme['foreground-primary'], borderColor: Theme['border-primary'], marginTop: top + (StatusBar.currentHeight ?? Spacing[2]) }]}>
      <Icon width={20} height={20} fill={iconColor} />
      <Text variant="lg-400" color="text-primary" numberOfLines={2} style={styles.text}>
        {text1}{text2 ? ` - ${text2}` : ''}
      </Text>
    </View>
  );
}

export function SuccessToast({ text1, text2, ...props }: ToastProps) {
  return <BaseToast text1={text1} text2={text2} {...props} />;
}

export function ErrorToast({ text1, text2, ...props }: ToastProps) {
  return <BaseToast text1={text1} text2={text2} {...props} />;
}

export function InfoToast({ text1, text2, ...props }: ToastProps) {
  return <BaseToast text1={text1} text2={text2} {...props} />;
}

export const toastConfig = {
  success: (props: ToastProps) => <SuccessToast {...props} />,
  error: (props: ToastProps) => <ErrorToast {...props} />,
  info: (props: ToastProps) => <InfoToast {...props} />,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    padding: Spacing[5],
    borderRadius: BorderRadius[3],
    marginHorizontal: Spacing[5],
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    flex: 1,
  },
});
