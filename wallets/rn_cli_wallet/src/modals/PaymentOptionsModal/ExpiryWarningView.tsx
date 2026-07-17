import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { Text } from '@/components/Text';
import WarningCircle from '@/assets/WarningCircle';
import { Spacing } from '@/utils/ThemeUtil';

interface ExpiryWarningViewProps {
  expiresAt: number;
  onComplete: () => void;
  onExpired: () => void;
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ExpiryWarningView({
  expiresAt,
  onComplete,
  onExpired,
}: ExpiryWarningViewProps) {
  const getRemainingSeconds = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, expiresAt - now);
  }, [expiresAt]);

  const [remaining, setRemaining] = useState(getRemainingSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      const secs = getRemainingSeconds();
      setRemaining(secs);
      if (secs <= 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getRemainingSeconds, onExpired]);

  const iconColor = '#0988F0';

  return (
    <>
      <View style={styles.contentContainer}>
        <WarningCircle width={40} height={40} fill={iconColor} />
        <Text variant="h6-400" color="text-primary" center style={styles.title}>
          Your payment expires in{' '}
          <Text variant="h6-400" color="text-accent-primary">
            {formatCountdown(remaining)}
          </Text>
        </Text>
        <Text
          variant="lg-400"
          color="text-tertiary"
          style={styles.message}
          center
        >
          Complete the payment before it expires.
        </Text>
      </View>
      <View style={styles.footerContainer}>
        <ActionButton onPress={onComplete} fullWidth>
          Complete payment
        </ActionButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
  },
  title: {
    marginTop: Spacing[4],
  },
  message: {
    marginTop: Spacing[1],
  },
  footerContainer: {
    paddingTop: Spacing[7],
    marginBottom: Spacing[2],
    alignItems: 'center',
  },
});
