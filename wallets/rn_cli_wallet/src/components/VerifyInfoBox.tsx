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

export default function VerifyInfoBox({validation, isScam, style}: Props) {
  const Theme = useTheme();
  let text;
  let title;
  let Icon: (props: SvgProps) => React.JSX.Element;
  let textColor;
  let bgColor;
  if (!isScam && validation === 'VALID') {
    return;
  }

  if (isScam) {
    title = 'Known security risk';
    text =
      'This domain is flagged as unsafe by multiple security reports. Leave immediately to protect your assets.';
    Icon = WarningRisk;
    textColor = Theme['verify-invalid'];
    bgColor = Theme['bg-verify-invalid'];
  } else if (validation === 'INVALID') {
    title = 'Domain mismatch';
    text =
      'This website has a domain that does not match the sender of this request. Approving may lead to loss of funds.';
    Icon = Warning;
    textColor = Theme['verify-invalid'];
    bgColor = Theme['bg-verify-invalid'];
  } else {
    title = 'Unknown domain';
    text =
      'This domain cannot be verified. Please check the request carefully before approving.';
    Icon = AlertCircle;
    textColor = Theme['verify-unknown'];
    bgColor = Theme['bg-verify-unknown'];
  }

  return (
    <View style={[styles.container, {backgroundColor: bgColor}, style]}>
      <Icon height={24} width={24} />
      <View style={styles.textContainer}>
        <Text style={[styles.title, {color: textColor}]}>{title}</Text>
        <Text style={[styles.description, {color: Theme['fg-100']}]}>
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
    columnGap: 8,
    borderRadius: 16,
    padding: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 12,
  },
});
