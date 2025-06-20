import SuiLib from '../lib/SuiLib';
import AsyncStorage from '@react-native-async-storage/async-storage';

export let wallet1: SuiLib;
export let suiAddresses: string[];

/**
 * Utilities
 */
export async function createOrRestoreSuiWallet() {
  const mnemonic1 = await AsyncStorage.getItem('SUI_MNEMONIC_1');
  // const mnemonic1 =
  //   'popular miracle december plunge weekend more canvas lecture lawn enlist space found';
  if (mnemonic1) {
    wallet1 = await SuiLib.init({mnemonic: mnemonic1});
  } else {
    wallet1 = await SuiLib.init({});
    // Don't store private keys in local storage in a production project!
    await AsyncStorage.setItem('SUI_MNEMONIC_1', wallet1.getMnemonic());
    console.log('SUI_MNEMONIC_1', wallet1.getMnemonic());
  }

  suiAddresses = [wallet1.getAddress()];

  return {
    suiWallet: wallet1,
    suiAddresses,
  };
}

export const getWallet = async () => {
  return wallet1;
};
