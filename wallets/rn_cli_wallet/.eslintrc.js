module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      // Host-side tooling: plain Node scripts, not React Native code, so they
      // need Node globals (Buffer, process). dev-agent-daemon.js also speaks
      // the WebSocket framing protocol by hand, which is bitwise by nature.
      files: ['scripts/**/*.js'],
      env: { node: true },
      rules: {
        'no-bitwise': 'off',
      },
    },
  ],
};
