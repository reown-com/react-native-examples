module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv'],
    [
      'module-resolver',
      {
        alias: {
          crypto: 'react-native-quick-crypto',
          stream: 'stream-browserify',
          buffer: '@craftzdog/react-native-buffer',
          '@/components': './src/components',
          '@/constants': './src/constants',
          '@/context': './src/context',
          '@/controllers': './src/controllers',
          '@/data': './src/data',
          '@/hooks': './src/hooks',
          '@/navigators': './src/navigators',
          '@/icons': './src/icons',
          '@/screens': './src/screens',
          '@/modals': './src/modals',
          '@/utils': './src/utils',
          '@/provider': './src/provider',
          '@/store': './src/store',
        },
      },
    ],
  ],
};
