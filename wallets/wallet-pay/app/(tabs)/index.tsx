import { Button } from '@/components/primitives/button';
import { Text } from '@/components/primitives/text';
import { mockedProposal } from '@/constants/mocks';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const buttonBgColor = useThemeColor('bg-accent-primary');

  // const { walletKit, isInitialized } = useWalletKit();

  const onSessionProposal = async (uri: string) => {
    // await walletKit?.pair({ uri });
    router.push({
      pathname: '/session-proposal',
      params: { proposal: JSON.stringify(mockedProposal) },
    });
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing['spacing-4'],
      }}>
      <Button
        style={[styles.button, { backgroundColor: buttonBgColor }]}
        onPress={() => router.navigate('/scanner')}>
        <Text>Go to Camera</Text>
      </Button>
      <Button
        style={[styles.button, { backgroundColor: buttonBgColor }]}
        onPress={() => onSessionProposal('a')}>
        <Text>Proposal modal</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: Spacing['spacing-4'],
    borderRadius: BorderRadius['4'],
  },
});
