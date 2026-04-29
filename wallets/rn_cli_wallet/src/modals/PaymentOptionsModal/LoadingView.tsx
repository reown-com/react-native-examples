import { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';

import { WalletConnectLoading } from '@/components/WalletConnectLoading';
import { Spacing } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface LoadingViewProps {
  message?: string;
  note?: string;
  size?: number;
}

const enteringKeyframe = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 14 }, { scale: 0.92 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
}).duration(260);

const exitingKeyframe = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
  100: { opacity: 0, transform: [{ translateY: -14 }, { scale: 0.92 }] },
}).duration(220);

export function LoadingView({ message, note, size = 120 }: LoadingViewProps) {
  const hasMountedRef = useRef(false);
  const entering = hasMountedRef.current ? enteringKeyframe : undefined;
  hasMountedRef.current = true;

  const messageKey = message || 'default';

  return (
    <View style={styles.loadingContainer}>
      <WalletConnectLoading size={size} />
      <View
        style={[styles.messageContainer, note && styles.messageContainerWithNote]}
      >
        <Animated.View
          key={messageKey}
          entering={entering}
          exiting={exitingKeyframe}
          style={styles.messageSlot}
        >
          <Text
            variant="h6-400"
            color="text-primary"
            style={styles.loadingText}
            testID="pay-loading-message"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {message || 'Loading...'}
          </Text>
          {note && (
            <Text
              variant="lg-400"
              color="text-secondary"
              center
              style={styles.loadingNote}
            >
              {note}
            </Text>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: Spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    marginTop: Spacing[4],
    minHeight: 64,
    width: '100%',
    overflow: 'hidden',
  },
  messageContainerWithNote: {
    minHeight: 110,
  },
  messageSlot: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[2],
  },
  loadingText: {
    textAlign: 'center',
  },
  loadingNote: {
    marginTop: Spacing[2],
  },
});
