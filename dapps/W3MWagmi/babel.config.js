module.exports = {
  presets: ['babel-preset-expo'],
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
          '@/hooks': './src/hooks',
          '@/navigators': './src/navigators',
          '@/icons': './src/icons',
          '@/screens': './src/screens',
          '@/types': './src/types',
          '@/utils': './src/utils',
        },
      },
    ],
  ],
};
