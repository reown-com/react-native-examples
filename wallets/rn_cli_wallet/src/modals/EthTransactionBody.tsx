import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AccordionCard } from '@/components/AccordionCard';
import { Shimmer } from '@/components/Shimmer';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { truncate } from '@/utils/HelperUtil';
import { BorderRadius, Spacing } from '@/utils/ThemeUtil';
import {
  EthTransactionParams,
  estimateFee,
  formatFee,
  formatNativeAmount,
  getFeeFromParams,
  getNativeSymbol,
  isContractInteraction,
  isRollupChain,
} from '@/utils/EIP155TransactionUtil';
import type { RequestBodyProps } from './requestConfig';

const DETAILS_EXPANDED_HEIGHT = 180;

type FeeState =
  | { status: 'loading' }
  | { status: 'ready'; wei: bigint }
  | { status: 'error' };

/**
 * Summary for eth_sendTransaction / eth_signTransaction: amount, recipient and
 * network fee, with the raw params in a collapsible Details card.
 */
export function EthTransactionBody({ request, chainId }: RequestBodyProps) {
  const Theme = useTheme();
  const tx: EthTransactionParams = request.params?.[0] ?? {};
  const symbol = getNativeSymbol(chainId);
  const isRollup = isRollupChain(chainId);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const [fee, setFee] = useState<FeeState>({ status: 'loading' });
  useEffect(() => {
    const feeFromParams = getFeeFromParams(tx);
    if (feeFromParams != null) {
      setFee({ status: 'ready', wei: feeFromParams });
      return;
    }
    let cancelled = false;
    setFee({ status: 'loading' });
    estimateFee(tx, chainId)
      .then(wei => !cancelled && setFee({ status: 'ready', wei }))
      .catch(() => !cancelled && setFee({ status: 'error' }));
    return () => {
      cancelled = true;
    };
    // `tx` is derived from `request`, which identifies the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, chainId]);

  const amount = formatNativeAmount(tx.value);

  return (
    <>
      <View
        style={[
          styles.summary,
          { backgroundColor: Theme['foreground-primary'] },
        ]}
      >
        <View style={styles.row}>
          <Text variant="lg-400" color="text-tertiary">
            Amount
          </Text>
          <Text variant="lg-400" color="text-primary">
            {amount != null ? `${amount} ${symbol}` : String(tx.value)}
          </Text>
        </View>
        <View>
          <View style={styles.row}>
            <Text variant="lg-400" color="text-tertiary">
              To
            </Text>
            <Text variant="lg-400" color="text-primary">
              {tx.to ? truncate(tx.to, 15) : 'New contract'}
            </Text>
          </View>
          {tx.to && isContractInteraction(tx.data) && (
            <Text variant="md-400" color="text-secondary">
              Contract interaction
            </Text>
          )}
        </View>
        <View style={styles.row}>
          <Text variant="lg-400" color="text-tertiary">
            Network fee
          </Text>
          {fee.status === 'loading' && (
            <Shimmer width={70} height={16} borderRadius={BorderRadius[1]} />
          )}
          {fee.status === 'error' && (
            <Text variant="lg-400" color="text-secondary">
              Unavailable
            </Text>
          )}
          {fee.status === 'ready' && (
            // Rollups add an L1 data fee we don't compute, so mark it as approximate.
            <Text variant="lg-400" color="text-primary">
              {`${isRollup ? '~' : ''}${formatFee(fee.wei)} ${symbol}`}
            </Text>
          )}
        </View>
      </View>
      <AccordionCard
        headerContent={
          <Text variant="lg-400" color="text-tertiary">
            Details
          </Text>
        }
        isExpanded={isDetailsExpanded}
        onPress={() => setIsDetailsExpanded(prev => !prev)}
        expandedHeight={DETAILS_EXPANDED_HEIGHT}
      >
        <ScrollView
          bounces={false}
          nestedScrollEnabled
          style={styles.details}
        >
          <Text variant="md-400" color="text-primary">
            {JSON.stringify(tx, null, 2)}
          </Text>
        </ScrollView>
      </AccordionCard>
    </>
  );
}

const styles = StyleSheet.create({
  summary: {
    borderRadius: BorderRadius[4],
    padding: Spacing[5],
    rowGap: Spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: Spacing[2],
  },
  details: {
    // AccordionCard's content adds Spacing[5] of bottom padding.
    height: DETAILS_EXPANDED_HEIGHT - Spacing[5],
  },
});
