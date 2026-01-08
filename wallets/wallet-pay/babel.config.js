module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            crypto: 'react-native-quick-crypto',
            stream: 'stream-browserify',
            buffer: '@craftzdog/react-native-buffer',
            '@/lib': './lib',
            '@/stores': './stores',
            '@/hooks': './hooks',
            '@/utils': './utils',
            '@/constants': './constants',
            '@/components': './components',
            '@/assets': './assets',
          },
        },
      ],
    ],
  };
};
