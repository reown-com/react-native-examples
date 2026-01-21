import { View, StyleSheet, StatusBar } from 'react-native';
import { ToastConfigParams } from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing } from '@/utils/ThemeUtil';

type ToastProps = ToastConfigParams<unknown>;

function SuccessToast({ text1, text2 }: ToastProps) {
  const Theme = useTheme();
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Theme['bg-success'],
          marginTop: top + (StatusBar.currentHeight ?? Spacing[2]),
        },
      ]}
    >
      <Text variant="md-500" color="text-success">
        {text1}
      </Text>
      {text2 && (
        <Text variant="sm-400" color="text-success">
          {text2}
        </Text>
      )}
    </View>
  );
}

function ErrorToast({ text1, text2 }: ToastProps) {
  const Theme = useTheme();
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Theme['bg-error'],
          marginTop: top + (StatusBar.currentHeight ?? Spacing[2]),
        },
      ]}
    >
      <Text variant="md-500" color="text-error">
        {text1}
      </Text>
      {text2 && (
        <Text variant="sm-400" color="text-error">
          {text2}
        </Text>
      )}
    </View>
  );
}

function InfoToast({ text1, text2 }: ToastProps) {
  const Theme = useTheme();
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Theme['foreground-primary'],
          marginTop: top + (StatusBar.currentHeight ?? Spacing[2]),
        },
      ]}
    >
      <Text variant="md-500" color="text-primary">
        {text1}
      </Text>
      {text2 && (
        <Text variant="sm-400" color="text-secondary">
          {text2}
        </Text>
      )}
    </View>
  );
}

export const toastConfig = {
  success: (props: ToastProps) => <SuccessToast {...props} />,
  error: (props: ToastProps) => <ErrorToast {...props} />,
  info: (props: ToastProps) => <InfoToast {...props} />,
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius[3],
    marginHorizontal: Spacing[4],
    minWidth: 200,
    maxWidth: '90%',
    alignItems: 'center',
  },
});
