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

export default function VerifyTag({ validation, isScam, style }: Props) {
  const Theme = useTheme();
  let text: string;
  let Icon: (props: SvgProps) => React.JSX.Element;
  let textColorKey: ThemeKeys;
  let bgColor: string;

  if (!isScam && validation === 'VALID') {
    return null;
  }

  if (isScam) {
    text = 'Potential threat';
    Icon = WarningRisk;
    textColorKey = 'text-error';
    bgColor = Theme['bg-error'];
  } else if (validation === 'INVALID') {
    text = 'Invalid domain';
    Icon = Warning;
    textColorKey = 'text-error';
    bgColor = Theme['bg-error'];
  } else {
    text = 'Cannot verify';
    Icon = AlertCircle;
    textColorKey = 'text-warning';
    bgColor = Theme['bg-warning'];
  }

  return (
    <View style={[styles.verifyTag, { backgroundColor: bgColor }, style]}>
      <Icon height={16} width={16} />
      <Text variant="sm-400" color={textColorKey}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  verifyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: Spacing[1],
    borderRadius: BorderRadius[2],
    padding: Spacing[1],
  },
});
