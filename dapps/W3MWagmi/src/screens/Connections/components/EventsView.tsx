import React, { useState } from 'react';
import { useAppKitEvents, useAppKitEventSubscription } from '@reown/appkit-react-native';
import { FlexView, Text } from '@reown/appkit-ui-react-native';
import { type ViewStyle, type StyleProp, StyleSheet } from 'react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export function EventsView({ style }: Props) {
  const { data } = useAppKitEvents();
  const [eventCount, setEventCount] = useState(0);

  useAppKitEventSubscription('MODAL_OPEN', () => {
    setEventCount(prev => prev + 1);
  });

  return data ? (
    <FlexView style={style} alignItems="center">
      <Text variant="small-600" style={styles.title}>
        Events
      </Text>
      <Text variant="small-400">Last event: {data?.event}</Text>
      <Text variant="small-400">Modal open count: {eventCount}</Text>
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 6,
  },
});
