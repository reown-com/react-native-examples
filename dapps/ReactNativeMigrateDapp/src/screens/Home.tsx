import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../types/navigationTypes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function Home({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text>
        This example is meant to help you migrate from react-native-dapp to
        @walletconnect/modal-react-native
      </Text>
      <Text style={styles.text}>
        {'WalletConnect v1 will stop working on the \n'}
        <Text style={styles.red}>28th of June</Text>
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('DappConnect')}>
        <Text style={styles.buttonText}>Go to connection screen</Text>
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
    backgroundColor: 'white',
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
  text: {
    fontWeight: 'bold',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  red: {
    color: 'red',
  },
});

export default Home;
