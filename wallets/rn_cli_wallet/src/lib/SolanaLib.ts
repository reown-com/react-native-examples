import * as bip39 from 'bip39';
import { Buffer } from 'buffer';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { derivePath } from 'ed25519-hd-key';
import {
  Connection,
  Keypair,
  SendOptions,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';

import LogStore from '@/store/LogStore';
import { SOLANA_MAINNET_CAIP2, SOLANA_MAINNET_RPC } from '@/constants/Solana';

interface IInitArguments {
  mnemonic?: string;
  secretKey?: Uint8Array;
}

interface ISignMessageArguments {
  message: string;
}

interface ISignTransactionArguments {
  transaction: string;
}

interface ISignAllTransactionsArguments {
  transactions: string[];
}

interface ISignAndSendTransactionArguments {
  transaction: string;
  options?: SendOptions;
  chainId: string;
}

const SOLANA_PATH = "m/44'/501'/0'/0'";

const BASE64_REGEX = /^[A-Za-z0-9+/]+={0,2}$/;

function decodeTransactionBytes(transaction: string): Uint8Array {
  // Buffer.from(_, 'base64') never throws — it silently mis-decodes non-base64
  // input. Detect the encoding explicitly so bs58-encoded transactions don't
  // fall through to a confusing downstream deserialization error.
  if (BASE64_REGEX.test(transaction)) {
    return new Uint8Array(Buffer.from(transaction, 'base64'));
  }
  return bs58.decode(transaction);
}

function deserializeTransaction(
  bytes: Uint8Array,
): VersionedTransaction | Transaction {
  try {
    return VersionedTransaction.deserialize(bytes);
  } catch {
    return Transaction.from(bytes);
  }
}

function signLocalTransaction(
  tx: VersionedTransaction | Transaction,
  keypair: Keypair,
): { signature: string; serialized: Uint8Array } {
  if (tx instanceof VersionedTransaction) {
    tx.sign([keypair]);
    const signatureBytes = tx.signatures[0];
    return {
      signature: bs58.encode(signatureBytes),
      serialized: tx.serialize(),
    };
  }

  tx.partialSign(keypair);
  const signatureBytes = tx.signatures.find(s =>
    s.publicKey.equals(keypair.publicKey),
  )?.signature;
  if (!signatureBytes) {
    throw new Error('Failed to extract signature from legacy transaction');
  }
  return {
    signature: bs58.encode(signatureBytes),
    serialized: new Uint8Array(tx.serialize()),
  };
}

/**
 * Library
 */
export default class SolanaLib {
  private keypair: Keypair;
  private mnemonic: string;
  private address: string;
  private connections: Record<string, Connection> = {};

  constructor({ mnemonic, secretKey }: IInitArguments) {
    if (secretKey) {
      this.keypair = Keypair.fromSecretKey(secretKey);
      this.mnemonic = '';
    } else {
      this.mnemonic = mnemonic ? mnemonic : bip39.generateMnemonic();
      const seed = bip39.mnemonicToSeedSync(this.mnemonic);
      const { key } = derivePath(SOLANA_PATH, seed.toString('hex'));
      this.keypair = Keypair.fromSeed(new Uint8Array(key));
    }
    this.address = this.keypair.publicKey.toBase58();
    LogStore.info('Solana wallet initialized', 'SolanaLib', 'constructor', {
      address: this.address,
    });
  }

  static async init({ mnemonic, secretKey }: IInitArguments) {
    return new SolanaLib({ mnemonic, secretKey });
  }

  public getAddress() {
    return this.address;
  }

  public getMnemonic() {
    return this.mnemonic;
  }

  public getSecretKey() {
    return bs58.encode(this.keypair.secretKey);
  }

  public async signMessage({ message }: ISignMessageArguments) {
    const messageBytes = bs58.decode(message);
    const signatureBytes = nacl.sign.detached(
      messageBytes,
      this.keypair.secretKey,
    );
    LogStore.log('Solana message signed', 'SolanaLib', 'signMessage');
    return {
      signature: bs58.encode(signatureBytes),
    };
  }

  public async signTransaction({ transaction }: ISignTransactionArguments) {
    const bytes = decodeTransactionBytes(transaction);
    const tx = deserializeTransaction(bytes);
    const { signature, serialized } = signLocalTransaction(tx, this.keypair);
    LogStore.log('Solana transaction signed', 'SolanaLib', 'signTransaction');
    return {
      transaction: Buffer.from(serialized).toString('base64'),
      signature,
    };
  }

  public async signAllTransactions({
    transactions,
  }: ISignAllTransactionsArguments) {
    const signed = await Promise.all(
      transactions.map(async transaction => {
        const result = await this.signTransaction({ transaction });
        return result.transaction;
      }),
    );
    LogStore.log(
      'Solana transactions signed',
      'SolanaLib',
      'signAllTransactions',
      { count: signed.length },
    );
    return { transactions: signed };
  }

  public async signAndSendTransaction({
    transaction,
    options,
    chainId,
  }: ISignAndSendTransactionArguments) {
    const bytes = decodeTransactionBytes(transaction);
    const tx = deserializeTransaction(bytes);
    const { signature, serialized } = signLocalTransaction(tx, this.keypair);
    const connection = this.getConnection(chainId);
    const txid = await connection.sendRawTransaction(serialized, {
      maxRetries: 3,
      preflightCommitment: 'confirmed',
      ...options,
    });
    LogStore.log(
      'Solana transaction sent',
      'SolanaLib',
      'signAndSendTransaction',
      { txid, signature },
    );
    return { signature: txid };
  }

  private getConnection(chainId: string) {
    if (this.connections[chainId]) {
      return this.connections[chainId];
    }
    switch (chainId) {
      case SOLANA_MAINNET_CAIP2:
        this.connections[chainId] = new Connection(SOLANA_MAINNET_RPC, {
          commitment: 'confirmed',
        });
        break;
      default:
        throw new Error(`Unknown Solana chainId: ${chainId}`);
    }
    return this.connections[chainId];
  }
}
