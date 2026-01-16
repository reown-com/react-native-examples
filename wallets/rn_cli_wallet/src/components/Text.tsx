import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { ThemeKeys } from '@/utils/TypesUtil';
import { FontFamily } from '@/utils/ThemeUtil';

// Text variants matching Figma text styles
// Format: {size}-{weight} where weight is 400 (Regular) or 500 (Medium)
export type TextVariant =
  // Headings
  | 'h1-400'
  | 'h1-500'
  | 'h2-400'
  | 'h2-500'
  | 'h3-400'
  | 'h3-500'
  | 'h4-400'
  | 'h4-500'
  | 'h5-400'
  | 'h5-500'
  | 'h6-400'
  | 'h6-500'
  // Body sizes
  | 'xl-400'
  | 'xl-500'
  | 'lg-400'
  | 'lg-500'
  | 'md-400'
  | 'md-500'
  | 'sm-400'
  | 'sm-500'
  // Legacy variants (for backward compatibility)
  | 'large-600'
  | 'paragraph-400'
  | 'paragraph-600'
  | 'small-400'
  | 'small-600'
  | 'tiny-400'
  | 'tiny-600';

interface VariantStyle {
  fontSize: number;
  fontFamily: string;
  letterSpacing: number;
  lineHeight: number;
}

const variantStyles: Record<TextVariant, VariantStyle> = {
  // Heading 1: 50px, -2% letter spacing, line height 50
  'h1-400': {
    fontSize: 50,
    fontFamily: FontFamily.regular,
    letterSpacing: -1, // -2% of 50px
    lineHeight: 50,
  },
  'h1-500': {
    fontSize: 50,
    fontFamily: FontFamily.medium,
    letterSpacing: -1,
    lineHeight: 50,
  },

  // Heading 2: 44px, -2% letter spacing, line height 44
  'h2-400': {
    fontSize: 44,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.88, // -2% of 44px
    lineHeight: 44,
  },
  'h2-500': {
    fontSize: 44,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.88,
    lineHeight: 44,
  },

  // Heading 3: 38px, -2% letter spacing, line height 38
  'h3-400': {
    fontSize: 38,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.76, // -2% of 38px
    lineHeight: 38,
  },
  'h3-500': {
    fontSize: 38,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.76,
    lineHeight: 38,
  },

  // Heading 4: 32px, -1% letter spacing, line height 32
  'h4-400': {
    fontSize: 32,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.32, // -1% of 32px
    lineHeight: 32,
  },
  'h4-500': {
    fontSize: 32,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.32,
    lineHeight: 32,
  },

  // Heading 5: 28px, -1% letter spacing, line height 26
  'h5-400': {
    fontSize: 28,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.28, // -1% of 28px
    lineHeight: 26,
  },
  'h5-500': {
    fontSize: 28,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.28,
    lineHeight: 26,
  },

  // Heading 6: 20px, -3% letter spacing, line height 20
  'h6-400': {
    fontSize: 20,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.6, // -3% of 20px
    lineHeight: 20,
  },
  'h6-500': {
    fontSize: 20,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.6,
    lineHeight: 20,
  },

  // Extra Large: 18px, -1% letter spacing, line height 20
  'xl-400': {
    fontSize: 18,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.18, // -1% of 18px
    lineHeight: 20,
  },
  'xl-500': {
    fontSize: 18,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.18,
    lineHeight: 20,
  },

  // Large: 16px, -1% letter spacing, line height 18
  'lg-400': {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.16, // -1% of 16px
    lineHeight: 18,
  },
  'lg-500': {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.16,
    lineHeight: 18,
  },

  // Medium: 14px, -1% letter spacing, line height 16
  'md-400': {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.14, // -1% of 14px
    lineHeight: 16,
  },
  'md-500': {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.14,
    lineHeight: 16,
  },

  // Small: 12px, -1% letter spacing, line height 14
  'sm-400': {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.12, // -1% of 12px
    lineHeight: 14,
  },
  'sm-500': {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.12,
    lineHeight: 14,
  },

  // Legacy variants (mapped to new styles for backward compatibility)
  'large-600': {
    fontSize: 20,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.6,
    lineHeight: 20,
  },
  'paragraph-400': {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.16,
    lineHeight: 18,
  },
  'paragraph-600': {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.16,
    lineHeight: 18,
  },
  'small-400': {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.14,
    lineHeight: 16,
  },
  'small-600': {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.14,
    lineHeight: 16,
  },
  'tiny-400': {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    letterSpacing: -0.12,
    lineHeight: 14,
  },
  'tiny-600': {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    letterSpacing: -0.12,
    lineHeight: 14,
  },
};

export interface TextProps extends RNTextProps {
  /** Text variant defining size and weight */
  variant?: TextVariant;
  /** Theme color key for the text color */
  color?: ThemeKeys;
  /** Center align the text */
  center?: boolean;
  /** Children content */
  children?: React.ReactNode;
}

export function Text({
  variant = 'lg-400',
  color = 'text-primary',
  center,
  style,
  children,
  ...props
}: TextProps) {
  const Theme = useTheme();

  const variantStyle = variantStyles[variant];
  const textColor = Theme[color];

  return (
    <RNText
      style={[
        styles.base,
        {
          fontSize: variantStyle.fontSize,
          fontFamily: variantStyle.fontFamily,
          letterSpacing: variantStyle.letterSpacing,
          lineHeight: variantStyle.lineHeight,
          color: textColor,
        },
        center && styles.center,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    // Base text styles
  },
  center: {
    textAlign: 'center',
  },
});
