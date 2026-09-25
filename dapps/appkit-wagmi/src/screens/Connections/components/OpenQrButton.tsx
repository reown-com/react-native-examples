import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppKit } from '@reown/appkit-react-native';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';

// Polygon mainnet — the second chain the relay switch-chain tests target.
const POLYGON_CHAIN_ID = 137;

// TEST-ONLY (EXPO_PUBLIC_TEST_MODE) dapp buttons for the relay E2E. On web the
// AppKit modal's controls aren't matchable by testID (Safari webview) and some
// are icon-only, so we expose plain, text-matchable buttons:
//   - "Open QR (E2E)"    -> open({ view: 'WalletConnect' }) jumps to the QR view.
//   - "Disconnect (E2E)" -> wagmi disconnect (the AppKit account button shows the
//     address/balance, which isn't reliably text-matchable on web).
// No-op in normal builds.
const TEST_MODE = process.env.EXPO_PUBLIC_TEST_MODE === 'true';

export function OpenQrButton() {
  const { open } = useAppKit();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  if (!TEST_MODE) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        testID="open-qr"
        style={styles.button}
        onPress={() => open({ view: 'WalletConnect' })}>
        <Text style={styles.text}>Open QR (E2E)</Text>
      </Pressable>
      {isConnected ? (
        <>
          <Pressable
            testID="switch-polygon-e2e"
            style={styles.button}
            onPress={() => switchChain({ chainId: POLYGON_CHAIN_ID })}>
            <Text style={styles.text}>Switch to Polygon (E2E)</Text>
          </Pressable>
          <Pressable
            testID="disconnect-e2e"
            style={styles.button}
            onPress={() => disconnect()}>
            <Text style={styles.text}>Disconnect (E2E)</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, gap: 8, alignItems: 'center' },
  button: {
    backgroundColor: '#8c8c8c',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: { color: 'white', fontWeight: '600' },
});
