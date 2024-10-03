module.exports = {
  presets: ['babel-preset-expo'],
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
    'react-native-reanimated/plugin',
  ],
};
