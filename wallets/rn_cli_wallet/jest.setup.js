/* eslint-env jest */
// Mock react-native-keyboard-controller's native bindings for Jest.
jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest'),
);
