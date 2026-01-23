import * as bip39 from 'bip39';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';
import { derivePath } from 'ed25519-hd-key';
import {
  SerialTransactionExecutor,
  Transaction,
} from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

import LogStore from '@/store/LogStore';

interface IInitArguments {
  mnemonic?: string;
}

interface ISignMessageArguments {
  message: string;
}

interface ISignTransactionArguments {
  transaction: string;
  chainId: string;
}

interface ISignAndExecuteTransactionArguments {
  transaction: string;
  chainId: string;
}

const SUI_PATH = "m/44'/784'/0'/0'/0'";

/**
 * Library
 */
export default class SuiLib {
  private keypair: Ed25519Keypair;
  private mnemonic: string;
  private address: string;
  private suiClients: Record<string, SuiClient> = {};

  constructor(mnemonic?: string) {
    this.mnemonic = mnemonic ? mnemonic : bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(this.mnemonic);
    const { key } = derivePath(SUI_PATH, seed.toString('hex'));

    this.keypair = Ed25519Keypair.fromSecretKey(new Uint8Array(key));
    this.address = this.keypair.getPublicKey().toSuiAddress();
    LogStore.info('Sui wallet initialized', 'SuiLib', 'constructor', { address: this.address });
  }

  static async init({ mnemonic }: IInitArguments) {
    return new SuiLib(mnemonic);
  }

  public getAddress() {
    return this.address;
  }

  public getMnemonic() {
    return this.mnemonic;
  }

  public async signMessage({ message }: ISignMessageArguments) {
    const messageToSign = new TextEncoder().encode(message);

    const signature = await this.keypair.signPersonalMessage(messageToSign);

    const verified = await verifyPersonalMessageSignature(
      messageToSign,
      signature.signature,
    );
    LogStore.log('Message signed', 'SuiLib', 'signMessage', {
      publicKey: this.keypair.getPublicKey().toBase64(),
      verified: verified.equals(this.keypair.getPublicKey()),
    });

    return {
      signature: signature.signature,
      publicKey: this.keypair.getPublicKey().toBase64(),
    };
  }

  public async signTransaction({
    transaction,
    chainId,
  }: ISignTransactionArguments) {
    const tx = Transaction.from(transaction);
    LogStore.log('Signing Sui transaction', 'SuiLib', 'signTransaction', { chainId });
    const client = this.getSuiClient(chainId);
    const signature = await tx.sign({ signer: this.keypair, client });
    const transactionBytes = Buffer.from(await tx.build({ client })).toString(
      'base64',
    );
    LogStore.log('Transaction signed', 'SuiLib', 'signTransaction');
    return {
      transactionBytes,
      signature: signature.signature,
    };
  }

  public async signAndExecuteTransaction({
    transaction,
    chainId,
  }: ISignAndExecuteTransactionArguments) {
    const tx = Transaction.from(transaction);
    const client = this.getSuiClient(chainId);
    const executor = new SerialTransactionExecutor({
      signer: this.keypair,
      client,
    });
    const result = await executor.executeTransaction(tx);
    LogStore.log('Transaction executed', 'SuiLib', 'signAndExecuteTransaction', {
      digest: result.digest,
    });
    return result;
  }

  private getSuiClient(chainId: string) {
    if (this.suiClients[chainId]) {
      return this.suiClients[chainId];
    }

    switch (chainId) {
      case 'sui:mainnet':
        this.suiClients[chainId] = new SuiClient({
          url: 'https://fullnode.mainnet.sui.io/',
        });
        break;
      case 'sui:testnet':
        this.suiClients[chainId] = new SuiClient({
          url: 'https://fullnode.testnet.sui.io/',
        });
        break;
      case 'sui:devnet':
        this.suiClients[chainId] = new SuiClient({
          url: 'https://fullnode.devnet.sui.io/',
        });
        break;
      default:
        throw new Error(`Unknown chainId: ${chainId}`);
    }
    return this.suiClients[chainId];
  }

  public async getJsonTransactionFromBase64(transaction: string) {
    try {
      const tx = Transaction.from(transaction);
      const jsonTx = await tx.toJSON();
      return jsonTx;
    } catch (e) {
      LogStore.error('Error decoding transaction', 'SuiLib', 'getJsonTransactionFromBase64', {
        error: String(e),
      });
      return undefined;
    }
  }
}
