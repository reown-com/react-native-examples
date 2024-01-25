import React from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../hooks/useTheme';

interface IChainProps {
  chains: {logo: string}[];
}

export function Chains({chains}: IChainProps) {
  const Theme = useTheme();
  return (
    <ScrollView
      bounces={false}
      style={[styles.container, {backgroundColor: Theme['bg-150']}]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, {color: Theme['fg-150']}]}>
        Blockchain(s)
      </Text>
      <View style={styles.row}>
        {chains?.map((chain, index: number) => (
          <Image
            key={index}
            source={{uri: chain?.logo}}
            style={styles.chainLogo}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 8,
    marginBottom: 8,
    maxHeight: 120,
    width: '100%',
  },
  content: {
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  chainLogo: {
    height: 25,
    width: 25,
    borderRadius: 100,
  },
  title: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    margin: 4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: 8,
    rowGap: 8,
    paddingHorizontal: 4,
  },
});
