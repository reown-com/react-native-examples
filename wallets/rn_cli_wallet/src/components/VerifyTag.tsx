import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {SvgProps} from 'react-native-svg';

import AlertCircle from '@/assets/AlertCircle';
import Warning from '@/assets/Warning';
import WarningRisk from '@/assets/WarningRisk';
import {useTheme} from '@/hooks/useTheme';

interface Props {
  validation?: 'UNKNOWN' | 'VALID' | 'INVALID';
  isScam?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function VerifyTag({validation, isScam, style}: Props) {
  const Theme = useTheme();
  let text;
  let Icon: (props: SvgProps) => React.JSX.Element;
  let textColor;
  let bgColor;
  if (!isScam && validation === 'VALID') {
    return;
  }

  if (isScam) {
    text = 'Potential threat';
    Icon = WarningRisk;
    textColor = Theme['verify-invalid'];
    bgColor = Theme['bg-verify-invalid'];
  } else if (validation === 'INVALID') {
    text = 'Invalid domain';
    Icon = Warning;
    textColor = Theme['verify-invalid'];
    bgColor = Theme['bg-verify-invalid'];
  } else {
    text = 'Cannot verify';
    Icon = AlertCircle;
    textColor = Theme['verify-unknown'];
    bgColor = Theme['bg-verify-unknown'];
  }

  return (
    <View style={[styles.verifyTag, {backgroundColor: bgColor}, style]}>
      <Icon height={16} width={16} />
      <Text style={[styles.verifyTagText, {color: textColor}]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: {
    height: 14,
    width: 14,
  },
  verifyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 4,
    borderRadius: 6,
    padding: 5,
  },
  verifyTagText: {
    fontSize: 12,
  },
});
