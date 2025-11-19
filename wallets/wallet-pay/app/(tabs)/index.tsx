import { Button } from '@/components/primitives/button';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useWalletKit } from '@/hooks/use-walletkit';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

export default function HomeScreen() {
  const [proposalUri, setProposalUri] = useState('');
  const { walletKit } = useWalletKit();

  const onSessionProposal = async () => {
    await walletKit?.pair({ uri: proposalUri });
    // router.push({
    //   pathname: '/session-proposal',
    //   params: { proposal: JSON.stringify(mockedProposal) },
    // });
  };

  return (
    <View style={styles.container}>
      <Button
        style={styles.button}
        type="primary"
        onPress={() => router.navigate('/scanner')}
        text="Go to Camera"
      />
      <Button
        style={styles.button}
        type="primary"
        onPress={() => onSessionProposal()}
        text="Proposal modal"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter proposal URI"
        value={proposalUri}
        onChangeText={setProposalUri}
      />
      <Button
        style={styles.button}
        onPress={() => onSessionProposal()}
        text="Connect"
        type="primary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['spacing-4'],
    paddingHorizontal: Spacing['spacing-4'],
  },
  button: {
    padding: Spacing['spacing-4'],
    borderRadius: BorderRadius['4'],
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: BorderRadius['4'],
    padding: Spacing['spacing-4'],
  },
});
