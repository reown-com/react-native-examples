module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
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
          '@/data': './src/data',
          '@/hooks': './src/hooks',
          '@/navigation': './src/navigation',
          '@/icons': './src/icons',
          '@/screens': './src/screens',
          '@/modals': './src/modals',
          '@/utils': './src/utils',
          '@/provider': './src/provider',
          '@/store': './src/store',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
        verbose: false,
      },
    ],
  ],
};
