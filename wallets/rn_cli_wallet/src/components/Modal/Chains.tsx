import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Chain } from '@/utils/TypesUtil';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface Props {
  chains?: Chain[];
}

export function Chains({ chains }: Props) {
  const Theme = useTheme();

  return (
    <ScrollView
      bounces={false}
      style={[
        styles.container,
        { backgroundColor: Theme['foreground-primary'] },
      ]}
      contentContainerStyle={styles.content}
    >
      <Text variant="sm-500" color="text-secondary" style={styles.title}>
        Blockchain(s)
      </Text>
      <View style={styles.row}>
        {chains?.map(chain => {
          const logo = PresetsUtil.getChainIconById(
            `${chain.namespace}:${chain.chainId}`,
          );
          return (
            <View
              key={chain.name}
              style={[
                styles.chain,
                { borderColor: Theme['foreground-tertiary'] },
              ]}
            >
              <Image
                source={logo}
                style={[
                  styles.chainLogo,
                  { backgroundColor: Theme['foreground-tertiary'] },
                ]}
              />
              <Text variant="sm-500" color="text-secondary">
                {chain.name}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius[5],
    maxHeight: 120,
  },
  content: {
    padding: Spacing[2],
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  chainLogo: {
    height: 18,
    width: 18,
    borderRadius: BorderRadius.full,
  },
  title: {
    margin: Spacing[1],
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    columnGap: Spacing[3],
    rowGap: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
  chain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing[1],
    paddingLeft: Spacing[1],
    paddingRight: Spacing[3],
  },
});
