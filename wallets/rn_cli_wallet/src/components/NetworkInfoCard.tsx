import { Image, StyleSheet } from 'react-native';

import { AccordionCard } from '@/components/AccordionCard';
import { Text } from '@/components/Text';
import { PresetsUtil } from '@/utils/PresetsUtil';

interface NetworkInfoCardProps {
  chainId?: string;
}

export function NetworkInfoCard({ chainId }: NetworkInfoCardProps) {
  const chainData = PresetsUtil.getChainDataById(chainId);
  const chainIcon = chainId ? PresetsUtil.getChainIconById(chainId) : undefined;

  if (!chainData) {
    return null;
  }

  return (
    <AccordionCard
      headerContent={
        <Text variant="lg-400" color="text-tertiary">
          Network
        </Text>
      }
      rightContent={
        chainIcon ? (
          <Image source={chainIcon} style={styles.chainIcon} />
        ) : undefined
      }
      isExpanded={false}
      onPress={() => {}}
      expandedHeight={0}
      hideExpand
    >
      <></>
    </AccordionCard>
  );
}

const styles = StyleSheet.create({
  chainIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
