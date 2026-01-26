import React from 'react';
import { View } from 'react-native';
import { SvgProps } from 'react-native-svg';

import { useTheme } from '@/hooks/useTheme';
import { ThemeKeys } from '@/utils/TypesUtil';
import LogStore from '@/store/LogStore';

// Import SVG icons
import SvgChevronRight from '@/assets/ChevronRight';
import SvgWarningCircle from '@/assets/WarningCircle';
import SvgCheckCircle from '@/assets/CheckCircle';

// Icon name to component mapping
const iconComponents = {
  chevronRight: SvgChevronRight,
  warningCircle: SvgWarningCircle,
  checkCircle: SvgCheckCircle,
} as const;

export type IconName = keyof typeof iconComponents;

// Size presets
const sizePresets = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

type SizePreset = keyof typeof sizePresets;

export interface IconProps extends Omit<SvgProps, 'width' | 'height'> {
  /** Icon name to render */
  name: IconName;
  /** Size preset or custom size will use width/height props */
  size?: SizePreset;
  /** Custom width (overrides size preset) */
  width?: number;
  /** Custom height (overrides size preset) */
  height?: number;
  /** Theme color key for the icon fill */
  color?: ThemeKeys;
}

export function Icon({
  name,
  size = 'md',
  width,
  height,
  color = 'icon-default',
  ...props
}: IconProps) {
  const Theme = useTheme();

  const IconComponent = iconComponents[name];
  const resolvedWidth = width ?? sizePresets[size];
  const resolvedHeight = height ?? sizePresets[size];

  if (!IconComponent) {
    LogStore.warn(`Icon "${name}" not found`, 'Icon', 'Icon');
    return <View style={{ width: resolvedWidth, height: resolvedHeight }} />;
  }
  const fillColor = Theme[color];

  return (
    <IconComponent
      width={resolvedWidth}
      height={resolvedHeight}
      fill={fillColor}
      {...props}
    />
  );
}
