import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '@/hooks/useTheme';

interface ITagProps {
  value: string;
  grey?: boolean;
}

export function Tag({value, grey}: ITagProps) {
  const Theme = useTheme();
  const backgroundColor = grey ? Theme['bg-250'] : Theme['accent-glass-010'];
  const textColor = grey ? Theme['fg-200'] : Theme['accent-100'];
  return (
    <View style={[styles.container, {backgroundColor}]}>
      <Text style={[styles.text, {color: textColor}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 26,
    paddingHorizontal: 8,
    borderRadius: 28,
    marginRight: 4,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
