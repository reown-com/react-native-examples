import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';

import AlertCircle from '@/assets/AlertCircle';
import Warning from '@/assets/Warning';
import WarningRisk from '@/assets/WarningRisk';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { ThemeKeys } from '@/utils/TypesUtil';

interface Props {
  validation?: 'UNKNOWN' | 'VALID' | 'INVALID';
  isScam?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function VerifyInfoBox({ validation, isScam, style }: Props) {
  const Theme = useTheme();
  let text: string;
  let title: string;
  let Icon: (props: SvgProps) => React.JSX.Element;
  let textColorKey: ThemeKeys;
  let bgColor: string;

  if (!isScam && validation === 'VALID') {
    return null;
  }

  if (isScam) {
    title = 'Known security risk';
    text =
      'This domain is flagged as unsafe by multiple security reports. Leave immediately to protect your assets.';
    Icon = WarningRisk;
    textColorKey = 'text-error';
    bgColor = Theme['bg-error'];
  } else if (validation === 'INVALID') {
    title = 'Domain mismatch';
    text =
      'This website has a domain that does not match the sender of this request. Approving may lead to loss of funds.';
    Icon = Warning;
    textColorKey = 'text-error';
    bgColor = Theme['bg-error'];
  } else {
    title = 'Unknown domain';
    text =
      'This domain cannot be verified. Please check the request carefully before approving.';
    Icon = AlertCircle;
    textColorKey = 'text-warning';
    bgColor = Theme['bg-warning'];
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }, style]}>
      <Icon height={24} width={24} />
      <View style={styles.textContainer}>
        <Text variant="sm-500" color={textColorKey}>
          {title}
        </Text>
        <Text variant="sm-400" color="text-primary">
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: Spacing[2],
    borderRadius: BorderRadius[4],
    padding: Spacing[4],
  },
  textContainer: {
    flex: 1,
  },
});
