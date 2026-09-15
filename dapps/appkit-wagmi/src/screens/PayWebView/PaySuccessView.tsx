import React from 'react';
import {StyleSheet, View} from 'react-native';
import LottieView from 'lottie-react-native';
import {Button, FlexView, Text} from '@reown/appkit-ui-react-native';
import {useTheme} from '@/hooks/useTheme';

// Mirrors the wallet sample's Pay ResultView (success case): the Success.json
// checkmark plays once, followed by the confirmation title and a Done button.
// The Success.json artwork has inner padding inside its 1080x1080 canvas, so
// the visible glyph is smaller than this container (same 200px size the wallet
// uses to keep the check centered).
const LOTTIE_ICON_SIZE = 200;

interface PaySuccessViewProps {
  // Optional summary from the Pay page; falls back to a generic confirmation.
  message?: string;
  onDone: () => void;
}

export function PaySuccessView({message, onDone}: PaySuccessViewProps) {
  const Theme = useTheme();

  return (
    <FlexView
      style={[styles.container, {backgroundColor: Theme['bg-100']}]}
      alignItems="center"
      justifyContent="center"
      padding="l">
      <View style={styles.iconArea} testID="pay-result-container">
        <View testID="pay-result-success-icon">
          <LottieView
            source={require('@/assets/lottie/Success.json')}
            autoPlay
            loop={false}
            style={styles.successAnimation}
          />
        </View>
      </View>
      <Text center variant="large-600" testID="pay-result-title">
        {message || 'Payment confirmed'}
      </Text>
      <FlexView style={styles.footer}>
        <Button testID="pay-button-result-action-success" onPress={onDone}>
          Done
        </Button>
      </FlexView>
    </FlexView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconArea: {
    height: LOTTIE_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successAnimation: {
    width: LOTTIE_ICON_SIZE,
    height: LOTTIE_ICON_SIZE,
  },
  footer: {
    marginTop: 32,
  },
});
