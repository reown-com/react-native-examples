import {
  HDNodeWallet,
  JsonRpcProvider,
  TransactionRequest,
  Wallet,
} from 'ethers';

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
  wallet: Wallet | HDNodeWallet;

  constructor(wallet: Wallet | HDNodeWallet) {
    this.wallet = wallet;
  }

  static init({ mnemonic, privateKey }: IInitArgs) {
    let wallet: Wallet | HDNodeWallet;

    if (privateKey) {
      wallet = new Wallet(privateKey);
    } else if (mnemonic) {
      wallet = HDNodeWallet.fromPhrase(mnemonic);
    } else {
      wallet = Wallet.createRandom();
    }

    return new EIP155Lib(wallet);
  }

  getMnemonic() {
    return 'mnemonic' in this.wallet ? this.wallet.mnemonic?.phrase ?? '' : '';
  }

  getPrivateKey() {
    return this.wallet.privateKey;
  }

  hasMnemonic() {
    return 'mnemonic' in this.wallet && !!this.wallet.mnemonic?.phrase;
  }

  getAddress() {
    return this.wallet.address;
  }

  signMessage(message: string) {
    return this.wallet.signMessage(message);
  }

  _signTypedData(domain: any, types: any, data: any) {
    return this.wallet.signTypedData(domain, types, data);
  }

  connect(provider: JsonRpcProvider) {
    return this.wallet.connect(provider);
  }

  signTransaction(transaction: TransactionRequest) {
    return this.wallet.signTransaction(transaction);
  }
}
