import React from 'react';
import {StyleSheet, Text} from 'react-native';

interface Props {
  session?: any;
}

export function DappInfo({session}: Props) {
  const metadata = session?.peer?.metadata;

  return (
    <>
      {metadata.redirect?.native && (
        <>
          <Text style={[styles.boldText]}>Deep link:</Text>
          <Text>{metadata.redirect?.native}</Text>
        </>
      )}
      {metadata.redirect?.universal && (
        <>
          <Text style={[styles.boldText, styles.subtitle]}>
            Universal link:
          </Text>
          <Text>{metadata.redirect?.universal}</Text>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 25,
    width: 25,
    marginRight: 4,
    borderRadius: 100,
  },
  dappContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '500',
  },
  subtitle: {
    marginTop: 8,
  },
});
