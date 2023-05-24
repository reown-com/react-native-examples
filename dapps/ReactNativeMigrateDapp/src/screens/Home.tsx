import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../types/navigationTypes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function Home({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text>
        This example is meant to help you migrate from react-native-dapp to
        @web3modal/react-native
      </Text>
      <Text style={styles.importantText}>
        WalletConnect v1 will be deprecated the 28th June
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('DappConnect')}>
        <Text style={styles.buttonText}>Go to connect screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#3396FF',
    borderRadius: 25,
    width: 200,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  importantText: {
    marginVertical: 16,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Home;
