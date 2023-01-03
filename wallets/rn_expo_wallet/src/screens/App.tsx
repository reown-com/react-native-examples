import {registerRootComponent} from 'expo';
import React, {useEffect, useState} from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import '@walletconnect/react-native-compat';
import SignClient from '@walletconnect/sign-client';

// @ts-expect-error - `@env` is a virtualised module via Babel config.
import {ENV_PROJECT_ID, ENV_RELAY_URL} from '@env';

export default function App() {
  const [signClient, setSignClient] = useState<SignClient>();

  async function createClient() {
    try {
      const client = await SignClient.init({
        projectId: ENV_PROJECT_ID,
        relayUrl: ENV_RELAY_URL,
      });
      setSignClient(client);
      await subscribeToEvents(client);
    } catch (e) {
      console.log(e);
    }
  }

  async function subscribeToEvents(client: SignClient) {
    if (!client) {
      throw Error('No events to subscribe to b/c the client does not exist');
    }

    try {
      client.on('session_delete', () => {
        console.log('user disconnected the session from their wallet');
      });
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {}, [signClient]);

  return (
    <View style={styles.container}>
      <Text>WalletConnect</Text>
      <Text>Sign V2 Expo Examples</Text>
      <Text>SignClient Initialized: {signClient ? 'true' : 'false'} </Text>
      <Button
        title={!signClient ? 'Initialize' : 'Initialized'}
        onPress={() => createClient()}
      />
    </View>
  );
}

registerRootComponent(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
