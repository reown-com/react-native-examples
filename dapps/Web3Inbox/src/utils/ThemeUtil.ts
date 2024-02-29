import {ThemeKeys} from './TypesUtil';

// Current theming values. These should be could be replaced with the ones below.
export const Themes = {
  light: {
    primary: '#262626',
    secondary: '#525252',
    background: '#f5f5f5',
    backgroundSecondary: '#d4d4d4',
    backgroundActive: '#e5e5e5',
    border: '#e5e5e5',
  },
  dark: {
    primary: '#fafafa',
    secondary: '#a3a3a3',
    background: '#171717',
    backgroundSecondary: '#262626',
    backgroundActive: '#0f0f0f',
    border: '#404040',
  },
};

export const LightTheme: {[key in ThemeKeys]: string} = {
  'accent-100': '#089C96',
  'accent-glass-090': 'rgba(8, 156, 150, 0.9)',
  'accent-glass-080': 'rgba(8, 156, 150, 0.8)',
  'accent-glass-020': 'rgba(8, 156, 150, 0.2)',
  'accent-glass-015': 'rgba(8, 156, 150, 0.15)',
  'accent-glass-010': 'rgba(8, 156, 150, 0.1)',
  'accent-glass-005': 'rgba(8, 156, 150, 0.05)',
  'accent-glass-002': 'rgba(8, 156, 150, 0.02)',

  'fg-100': '#141414',
  'fg-125': '#2d3131',
  'fg-150': '#474d4d',
  'fg-175': '#636d6d',
  'fg-200': '#798686',
  'fg-225': '#828f8f',
  'fg-250': '#8b9797',
  'fg-275': '#95a0a0',
  'fg-300': '#9ea9a9',

  'bg-100': '#ffffff',
  'bg-125': '#ffffff',
  'bg-150': '#f3f8f8',
  'bg-175': '#eef4f4',
  'bg-200': '#eaf1f1',
  'bg-225': '#e5eded',
  'bg-250': '#e1e9e9',
  'bg-275': '#dce7e7',
  'bg-300': '#d8e3e3',

  'inverse-100': '#ffffff',
  'inverse-000': '#000000',

  'error-100': '#ED4747',

  'gray-glass-001': 'rgba(255, 255, 255, 0.01)',
  'gray-glass-002': 'rgba(0, 0, 0, 0.02)',
  'gray-glass-005': 'rgba(0, 0, 0, 0.05)',
  'gray-glass-010': 'rgba(0, 0, 0, 0.1)',
  'gray-glass-015': 'rgba(0, 0, 0, 0.15)',
  'gray-glass-020': 'rgba(0, 0, 0, 0.2)',
  'gray-glass-025': 'rgba(0, 0, 0, 0.25)',
  'gray-glass-030': 'rgba(0, 0, 0, 0.3)',
  'gray-glass-060': 'rgba(0, 0, 0, 0.6)',
  'gray-glass-080': 'rgba(0, 0, 0, 0.8)',
  'gray-glass-090': 'rgba(0, 0, 0, 0.9)',
};

// TODO: Add dark colors
export const DarkTheme: {[key in ThemeKeys]: string} = {
  'accent-100': '#089C96',
  'accent-glass-090': 'rgba(8, 156, 150, 0.9)',
  'accent-glass-080': 'rgba(8, 156, 150, 0.8)',
  'accent-glass-020': 'rgba(8, 156, 150, 0.2)',
  'accent-glass-015': 'rgba(8, 156, 150, 0.15)',
  'accent-glass-010': 'rgba(8, 156, 150, 0.1)',
  'accent-glass-005': 'rgba(8, 156, 150, 0.05)',
  'accent-glass-002': 'rgba(8, 156, 150, 0.02)',

  'fg-100': '#141414',
  'fg-125': '#2d3131',
  'fg-150': '#474d4d',
  'fg-175': '#636d6d',
  'fg-200': '#798686',
  'fg-225': '#828f8f',
  'fg-250': '#8b9797',
  'fg-275': '#95a0a0',
  'fg-300': '#9ea9a9',

  'bg-100': '#ffffff',
  'bg-125': '#ffffff',
  'bg-150': '#f3f8f8',
  'bg-175': '#eef4f4',
  'bg-200': '#eaf1f1',
  'bg-225': '#e5eded',
  'bg-250': '#e1e9e9',
  'bg-275': '#dce7e7',
  'bg-300': '#d8e3e3',

  'inverse-100': '#ffffff',
  'inverse-000': '#000000',

  'error-100': '#ED4747',

  'gray-glass-001': 'rgba(255, 255, 255, 0.01)',
  'gray-glass-002': 'rgba(0, 0, 0, 0.02)',
  'gray-glass-005': 'rgba(0, 0, 0, 0.05)',
  'gray-glass-010': 'rgba(0, 0, 0, 0.1)',
  'gray-glass-015': 'rgba(0, 0, 0, 0.15)',
  'gray-glass-020': 'rgba(0, 0, 0, 0.2)',
  'gray-glass-025': 'rgba(0, 0, 0, 0.25)',
  'gray-glass-030': 'rgba(0, 0, 0, 0.3)',
  'gray-glass-060': 'rgba(0, 0, 0, 0.6)',
  'gray-glass-080': 'rgba(0, 0, 0, 0.8)',
  'gray-glass-090': 'rgba(0, 0, 0, 0.9)',
};
