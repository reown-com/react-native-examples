import React from 'react';
import {StyleSheet, Text, useColorScheme} from 'react-native';
import {FONT_COLORS} from '../utils/Theming';

interface IW3WTextProps {
  value: string;
  weight?: 'medium' | 'thin';
  type?: string;
  color?: string;
}

/*
  3WText Component (Unfinished / not swapped out for all TEXT components)
*/

export function W3WText({type, value, color}: IW3WTextProps) {
  const isDarkMode = useColorScheme() === 'dark';
  let textStyle;

  // ToDo: QOL : Swap out for Cases returns
  if (type === 'body' && color === 'grey') {
    textStyle = [styles.greyMainText, isDarkMode && styles.textDark];
  } else {
    textStyle = [styles.headingText, isDarkMode && styles.textDark];
  }

  return <Text style={textStyle}>{value}</Text>;
}

const styles = StyleSheet.create({
  headingText: {
    fontSize: 34,
    lineHeight: 41,
    fontFamily: 'SFProRounded-Medium',
    color: FONT_COLORS.GREY8,
    letterSpacing: 0.374,
  },
  textDark: {
    color: 'white'
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
