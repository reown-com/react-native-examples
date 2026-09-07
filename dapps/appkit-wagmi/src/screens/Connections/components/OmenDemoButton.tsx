import React from 'react';
import {Button} from '@reown/appkit-ui-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {RootStackParamList} from '@/utils/TypesUtil';

// Entry point for the Omen deposit demo: opens the mock funded-account screen, which in turn
// opens the WalletConnect Pay deposit flow in an in-app WebView. Always visible (unlike
// PasteUrlButton, which self-hides when connected) so the demo is reachable regardless of state.
export function OmenDemoButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Button testID="open-omen-demo-button" onPress={() => navigation.navigate('Omen')}>
      Open Omen deposit demo
    </Button>
  );
}
