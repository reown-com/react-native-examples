module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@/assets': './src/assets',
          '@/components': './src/components',
          '@/hooks': './src/hooks',
          '@/navigators': './src/navigators',
          '@/icons': './src/icons',
          '@/screens': './src/screens',
          '@/types': './src/types',
          '@/utils': './src/utils',
          '@/stores': './src/stores',
        },
      },
    ],
    'react-native-worklets/plugin',
  ],
};
