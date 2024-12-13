import {providers, Wallet} from 'ethers';

/**
 * Types
 */
interface IInitArgs {
  mnemonic?: string;
  privateKey?: string;
}

/**
 * Library
 */
export default class EIP155Lib {
  wallet: Wallet;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }

  static init({mnemonic, privateKey}: IInitArgs) {
    let wallet;
    if (privateKey) {
      wallet = new Wallet(privateKey);
    } else if (mnemonic) {
      wallet = Wallet.fromMnemonic(mnemonic);
    } else {
      wallet = Wallet.createRandom();
    }

    return new EIP155Lib(wallet);
  }

  getMnemonic() {
    return this.wallet.mnemonic?.phrase || this.wallet.privateKey;
  }

  getAddress() {
    return this.wallet.address;
  }

  signMessage(message: string) {
    return this.wallet.signMessage(message);
  }

  _signTypedData(domain: any, types: any, data: any) {
    return this.wallet._signTypedData(domain, types, data);
  }

  connect(provider: providers.JsonRpcProvider) {
    return this.wallet.connect(provider);
  }

  signTransaction(transaction: providers.TransactionRequest) {
    return this.wallet.signTransaction(transaction);
  }
}
