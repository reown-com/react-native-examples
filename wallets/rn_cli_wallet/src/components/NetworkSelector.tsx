import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Chain } from '@/utils/TypesUtil';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import Checkmark from '@/assets/Checkmark';

interface NetworkSelectorProps {
  availableChains: Chain[];
  selectedChainIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function NetworkSelector({
  availableChains,
  selectedChainIds,
  onSelectionChange,
}: NetworkSelectorProps) {
  const Theme = useTheme();

  const toggleChain = (chainId: string) => {
    if (selectedChainIds.includes(chainId)) {
      onSelectionChange(selectedChainIds.filter(id => id !== chainId));
    } else {
      onSelectionChange([...selectedChainIds, chainId]);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.listContent}>
        {availableChains.map(chain => {
          const chainId = `${chain.namespace}:${chain.chainId}`;
          const isSelected = selectedChainIds.includes(chainId);
          const logo = PresetsUtil.getChainIconById(chainId);

          return (
            <TouchableOpacity
              key={chainId}
              style={styles.row}
              onPress={() => toggleChain(chainId)}
            >
              <View style={styles.chainInfo}>
                <Image
                  source={logo}
                  style={[
                    styles.chainLogo,
                    { backgroundColor: Theme['foreground-tertiary'] },
                  ]}
                />
                <Text variant="md-400" color="text-primary">
                  {chain.name}
                </Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  isSelected
                    ? {
                        backgroundColor: Theme['bg-accent-primary'],
                        borderColor: Theme['bg-accent-primary'],
                      }
                    : { borderColor: Theme['border-secondary'] },
                ]}
              >
                {isSelected && <Checkmark width={12} height={9} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: Spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[2],
  },
  chainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  chainLogo: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius[2],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
