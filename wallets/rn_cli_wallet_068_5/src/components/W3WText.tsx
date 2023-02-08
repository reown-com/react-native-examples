import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {FONT_COLORS} from '../utils/Theming';

interface IW3WTextProps {
  value: string;
  type?: string;
  color?: string;
}

/*
  3WText Component (Unfinished / not swapped out for all TEXT components)
*/

export function W3WText({type, value, color}: IW3WTextProps) {
  let textStyle;

  // ToDo: QOL : Swap out for Cases returns
  if (type === 'body' && color === 'grey') {
    textStyle = styles.greyMainText;
  } else {
    textStyle = styles.headingText;
  }

  return <Text style={textStyle}>{value}</Text>;
}

const styles = StyleSheet.create({
  headingText: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    fontFamily: 'SF Pro Rounded Medium',
    color: FONT_COLORS.GREY8,
    letterSpacing: 0.374,
  },
  greyMainText: {
    paddingVertical: 20,
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 21,
    letterSpacing: 0.374,
    fontWeight: '500',
    fontFamily: 'SF Pro Rounded Thin',
    color: '#798686',
  },
  imageContainer: {
    width: 24,
    height: 24,
  },
});
