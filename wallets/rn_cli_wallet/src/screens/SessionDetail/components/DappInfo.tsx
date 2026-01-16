import React from 'react';
import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface Props {
  session?: any;
}

export function DappInfo({ session }: Props) {
  const metadata = session?.peer?.metadata;

  return (
    <>
      {metadata.redirect?.native && (
        <>
          <Text variant="md-500" color="text-primary">
            Deep link:
          </Text>
          <Text variant="md-400" color="text-secondary">
            {metadata.redirect?.native}
          </Text>
        </>
      )}
      {metadata.redirect?.universal && (
        <>
          <Text variant="md-500" color="text-primary" style={styles.subtitle}>
            Universal link:
          </Text>
          <Text variant="md-400" color="text-secondary">
            {metadata.redirect?.universal}
          </Text>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 25,
    width: 25,
    marginRight: Spacing[1],
    borderRadius: BorderRadius.full,
  },
  dappContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing[1],
    marginBottom: Spacing[2],
  },
  subtitle: {
    marginTop: Spacing[2],
  },
});
