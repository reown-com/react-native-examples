import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

import { ActionButton } from '@/components/ActionButton';
import { Text } from '@/components/Text';
import CoinStack from '@/assets/CoinStack';
import WarningCircle from '@/assets/WarningCircle';
import { haptics } from '@/utils/haptics';
import { Spacing } from '@/utils/ThemeUtil';

import type { ErrorType, ResultIcon } from './utils';
import {
  arePayModalAnimationsEnabled,
  getResultContent,
  LOTTIE_ICON_SIZE,
  PAY_STATUS_LAYOUT,
} from './utils';

const ERROR_ICON_COLOR = '#0988F0';

const getResultButtonTestId = (
  isSuccess: boolean,
  errorType?: ErrorType | null,
) =>
  `pay-button-result-action-${isSuccess ? 'success' : errorType || 'generic'}`;

const renderIcon = (icon: ResultIcon, testID: string) => {
  switch (icon) {
    case 'success':
      return (
        <LottieView
          source={require('@/assets/lottie/Success.json')}
          autoPlay={arePayModalAnimationsEnabled}
          loop={false}
          progress={arePayModalAnimationsEnabled ? undefined : 1}
          style={styles.successAnimation}
          testID={testID}
        />
      );
    case 'coins':
      return (
        <CoinStack
          width={40}
          height={40}
          fill={ERROR_ICON_COLOR}
          testID={testID}
        />
      );
    case 'warning':
      return (
        <WarningCircle
          width={40}
          height={40}
          fill={ERROR_ICON_COLOR}
          testID={testID}
        />
      );
  }
};

interface ResultViewProps {
  status: 'success' | 'error';
  errorType?: ErrorType | null;
  message?: string;
  onClose: () => void;
  onScanQR?: () => void;
}

export function ResultView({
  status,
  errorType,
  message,
  onClose,
  onScanQR,
}: ResultViewProps) {
  useEffect(() => {
    if (status === 'success') {
      haptics.success();
    } else if (status === 'error') {
      haptics.error();
    }
  }, [status]);

  const isSuccess = status === 'success';
  const content = getResultContent(status, errorType ?? null, { message });
  const onPress =
    content.actionKind === 'scanQR' && onScanQR ? onScanQR : onClose;

  return (
    <>
      <View
        style={isSuccess ? styles.iconArea : styles.iconAreaCompact}
        testID="pay-result-container"
      >
        {renderIcon(content.icon, content.iconTestId)}
      </View>
      <View style={styles.textArea}>
        <Text
          variant="h6-400"
          color="text-primary"
          center
          numberOfLines={isSuccess ? 2 : undefined}
          testID="pay-result-title"
        >
          {content.title}
        </Text>
        {content.description && (
          <Text
            variant="lg-400"
            color="text-tertiary"
            style={styles.message}
            numberOfLines={3}
            center
          >
            {content.description}
          </Text>
        )}
      </View>
      <View style={styles.footerContainer}>
        <ActionButton
          onPress={onPress}
          fullWidth
          testID={getResultButtonTestId(isSuccess, errorType)}
        >
          {content.actionLabel}
        </ActionButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  iconArea: {
    height: PAY_STATUS_LAYOUT.iconAreaHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAreaCompact: {
    alignItems: 'center',
    justifyContent: 'center',
    // Static-icon results (errors) keep only top padding so the icon sits
    // 16px above the text — matching the Figma "Visual Asset + text" group
    // (gap-4). The textArea's own top padding supplies that 16px gap; a
    // bottom padding here would double it to 32px.
    paddingTop: Spacing[4],
  },
  successAnimation: {
    width: LOTTIE_ICON_SIZE,
    height: LOTTIE_ICON_SIZE,
  },
  textArea: {
    width: '100%',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  message: {
    // Title → body gap of 8px to match the Figma text group (gap-2).
    marginTop: Spacing[2],
  },
  footerContainer: {
    paddingTop: Spacing[2],
    paddingBottom: Spacing[2],
    alignItems: 'center',
  },
});
