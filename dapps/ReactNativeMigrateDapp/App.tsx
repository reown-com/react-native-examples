/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// If you have react native < 0.70, you need to polyfill BigInt. Run `yarn add big-integer` and uncomment the line below
// if (typeof BigInt === 'undefined') global.BigInt = require('big-integer')

import React from 'react';

import Navigator from './src/navigation';

function App(): JSX.Element {
  return <Navigator />;
}

export default App;
