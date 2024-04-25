import {TextProps, ViewProps, StyleSheet, Text} from 'react-native';

interface IW3WTextProps {
  children: TextProps['children'];
  weight?: 'medium' | 'thin';
  type?: string;
  color?: string;
  style?: ViewProps['style'];
}

/*
  3WText Component (Unfinished / not swapped out for all TEXT components)
*/

export default function W3WText({children, type, color, style}: IW3WTextProps) {
  let textStyle;

  // ToDo: QOL : Swap out for Cases returns
  if (type === 'body' && color === 'grey') {
    textStyle = [styles.greyMainText];
  } else {
    textStyle = [styles.headingText];
  }

  return <Text style={[textStyle, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  headingText: {
    fontSize: 34,
    lineHeight: 41,
    fontFamily: 'SFProRounded-Medium',
    color: '#141414',
    letterSpacing: 0.374,
  },
  greyMainText: {
    paddingVertical: 20,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 21,
    letterSpacing: 0.374,
    fontFamily: 'SFProRounded-Thin',
    color: '#798686',
  },
});
