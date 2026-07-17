module.exports = {
  presets: [['babel-preset-expo', {unstable_transformImportMeta: true}]],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          crypto: 'react-native-quick-crypto',
          stream: 'stream-browserify',
          buffer: '@craftzdog/react-native-buffer',
          '@/assets': './src/assets',
          '@/components': './src/components',
          '@/constants': './src/constants',
          '@/context': './src/context',
          '@/hooks': './src/hooks',
          '@/navigators': './src/navigators',
          '@/icons': './src/icons',
          '@/screens': './src/screens',
          '@/modals': './src/modals',
          '@/utils': './src/utils',
          '@/provider': './src/provider',
          '@/store': './src/store',
          '@/lib': './src/lib',
          '@/services': './src/services',
        },
      },
    ],
    'react-native-worklets/plugin',
  ],
};
