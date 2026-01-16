import { TextStyle, StyleProp } from 'react-native';
import { formatAmount } from './utils';
import { Text } from '@/components/Text';

interface AmountDisplayProps {
  /** Raw amount value as string (e.g., "1000000") */
  value: string;
  /** Number of decimal places in the raw value */
  decimals: number;
  /** Asset symbol to display (e.g., "USDC") */
  symbol?: string;
  /** Whether to show dollar sign prefix */
  showDollarSign?: boolean;
  /** Minimum decimal places to show (default: 2) */
  minDecimals?: number;
  /** Custom text style */
  style?: StyleProp<TextStyle>;
}

/**
 * Reusable component for displaying formatted payment amounts.
 * Handles decimal conversion and formatting consistently across the app.
 *
 * @example
 * // Display as "$10.00 USDC"
 * <AmountDisplay value="10000000" decimals={6} symbol="USDC" showDollarSign />
 *
 * @example
 * // Display as "10.00 ETH"
 * <AmountDisplay value="10000000000000000000" decimals={18} symbol="ETH" />
 */
export function AmountDisplay({
  value,
  decimals,
  symbol,
  showDollarSign = false,
  minDecimals = 2,
  style,
}: AmountDisplayProps) {
  const formattedAmount = formatAmount(value, decimals, minDecimals);
  const prefix = showDollarSign ? '$' : '';
  const suffix = symbol ? ` ${symbol}` : '';

  return (
    <Text variant="lg-400" color="text-primary" style={style}>
      {prefix}
      {formattedAmount}
      {suffix}
    </Text>
  );
}
