// Buffer is polyfilled globally by '@walletconnect/react-native-compat' (loaded
// in index.js). We intentionally use the global (Node-typed) Buffer here rather
// than @craftzdog/react-native-buffer so the types line up with bitcoinjs-lib.
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
// tiny-secp256k1 (used by the web sample) is a WASM module and does not run
// under Hermes/React Native. @bitcoinerlab/secp256k1 is a pure-JS drop-in
// implementing the same interface (built on @noble), so bitcoinjs-lib, bip32
// and ecpair all accept it via their factories.
import * as ecc from '@bitcoinerlab/secp256k1';
import ECPairFactory from 'ecpair';
import BIP32Factory, { BIP32Interface } from 'bip32';
import bitcoinMessage from 'bitcoinjs-message';
import { schnorr, hashes as nobleHashes } from '@noble/secp256k1';
import { sha256 as nobleSha256 } from '@noble/hashes/sha256';
import { hmac as nobleHmac } from '@noble/hashes/hmac';

import LogStore from '@/store/LogStore';
import {
  BIP122_MAINNET_CAIP2,
  BIP122_MAINNET_COIN_TYPE,
  IBip122ChainId,
} from '@/constants/Bitcoin';

bitcoin.initEccLib(ecc);

// @noble/secp256k1 v3 leaves the synchronous hash functions unset; its sync API
// (schnorr.sign, used for the ordinals/taproot path) throws "hashes.sha256 not
// set" until we provide them. Wire them from @noble/hashes (pure-JS, Hermes-safe)
// so we don't depend on WebCrypto being available.
nobleHashes.sha256 = (message: Uint8Array) => nobleSha256(message);
nobleHashes.hmacSha256 = (key: Uint8Array, message: Uint8Array) =>
  nobleHmac(nobleSha256, key, message);

const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

// The RN wallet only exposes Bitcoin mainnet.
const NETWORK = bitcoin.networks.bitcoin;
// Number of receiving addresses to derive per chain.
const ADDRESS_COUNT = 20;

interface IInitArguments {
  mnemonic?: string;
}

interface IUTXO {
  txid: string;
  vout: number;
  value: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
}

interface ICreateTransaction {
  network: bitcoin.Network;
  recipientAddress: string;
  amount: number;
  changeAddress: string;
  memo?: string;
  utxos: IUTXO[];
  privateKeyWIF: string;
  feeRate: number;
}

interface IAddressData {
  address: string;
  path: string;
  publicKey: string;
}

interface IPsbtInput {
  address: string;
  index: number;
  sighashTypes: number[];
}

interface ISignPsbt {
  account: string;
  psbt: string;
  signInputs: IPsbtInput[];
  broadcast: boolean;
  chainId: IBip122ChainId;
}

const validator = (
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer,
): boolean => {
  return ECPair.fromPublicKey(pubkey).verify(msghash, signature);
};

/**
 * Library
 */
export default class BitcoinLib {
  private account: BIP32Interface;
  private mnemonic: string;
  private addresses = {} as Record<IBip122ChainId, Map<string, IAddressData>>;
  private ordinals = {} as Record<IBip122ChainId, Map<string, IAddressData>>;
  private keys = {} as Record<
    IBip122ChainId,
    Map<string, { wif: string; network: bitcoin.Network }>
  >;

  constructor({ mnemonic }: IInitArguments) {
    this.keys[BIP122_MAINNET_CAIP2] = new Map();
    this.addresses[BIP122_MAINNET_CAIP2] = new Map();
    this.ordinals[BIP122_MAINNET_CAIP2] = new Map();

    this.mnemonic = mnemonic ? mnemonic : bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(this.mnemonic);
    const root = bip32.fromSeed(seed);
    this.account = bip32.fromBase58(root.toBase58());
    this.loadAddresses();
    LogStore.info('Bitcoin wallet initialized', 'BitcoinLib', 'constructor', {
      address: this.getAddress(BIP122_MAINNET_CAIP2),
    });
  }

  static async init({ mnemonic }: IInitArguments) {
    return new BitcoinLib({ mnemonic });
  }

  public getAddress(chainId: IBip122ChainId) {
    return Array.from(this.addresses[chainId].values())[0].address;
  }

  public getOrdinalsAddress(chainId: IBip122ChainId) {
    return Array.from(this.ordinals[chainId].values())[0].address;
  }

  public getMnemonic() {
    return this.mnemonic;
  }

  public getPrivateKey() {
    return this.mnemonic;
  }

  public getAddresses(chainId: IBip122ChainId, intentions?: string[]) {
    if (intentions && intentions[0] === 'ordinal') {
      return this.ordinals[chainId];
    }
    return this.addresses[chainId];
  }

  public async signMessage({
    message,
    address,
    protocol,
    chainId,
  }: {
    message: string;
    address: string;
    protocol?: string;
    chainId: IBip122ChainId;
  }) {
    if (protocol && protocol !== 'ecdsa') {
      throw new Error(`Supported signing protocols: ecdsa, received: ${protocol}`);
    }
    const addressData = this.getAddressData(address, chainId);
    if (!addressData) {
      throw new Error(`Unknown address: ${address}`);
    }
    const keyData = this.keys[chainId].get(address)!;
    const keyPair = ECPair.fromWIF(keyData.wif);
    const privateKey = keyPair.privateKey!;

    let signature: Buffer;
    if (this.isOrdinal(address, chainId)) {
      const messageHash = bitcoin.crypto.sha256(Buffer.from(message));
      const sig = await schnorr.sign(messageHash, privateKey);
      signature = Buffer.from(sig);
    } else {
      signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed, {
        segwitType: 'p2wpkh',
      });
    }

    LogStore.log('Bitcoin message signed', 'BitcoinLib', 'signMessage');
    return {
      signature: signature.toString('hex').replace('0x', ''),
      address,
    };
  }

  public async sendTransfer(params: {
    account: string;
    recipientAddress: string;
    amount: string;
    changeAddress?: string;
    memo?: string;
    chainId: IBip122ChainId;
  }) {
    const { account, recipientAddress, amount, changeAddress, memo, chainId } =
      params;
    const satoshis = parseInt(amount, 10);

    const addressData = this.getAddressData(account, chainId);
    if (!addressData) {
      throw new Error(`Unknown address: ${account}`);
    }

    if (satoshis < 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    const utxos = (await this.getUTXOs(account)) as IUTXO[];
    if (!utxos || utxos.length === 0) {
      throw new Error(`No UTXOs found for address: ${account}`);
    }

    let utxosValue = 0;
    const utxosToSpend: IUTXO[] = [];
    utxos.forEach(utxo => {
      utxosValue += utxo.value;
      utxosToSpend.push(utxo);
      if (utxosValue >= satoshis) {
        return;
      }
    });

    const keyData = this.keys[chainId].get(account)!;
    const transaction = await this.createTransaction({
      network: keyData.network,
      recipientAddress,
      amount: satoshis,
      changeAddress: changeAddress || account,
      utxos: utxosToSpend,
      privateKeyWIF: keyData.wif,
      memo,
      feeRate: await this.getFeeRate(),
    });
    const txid = await this.broadcastTransaction(transaction);
    LogStore.log('Bitcoin transfer sent', 'BitcoinLib', 'sendTransfer', {
      txid,
    });
    return txid;
  }

  public async signPsbt({
    account,
    psbt,
    signInputs,
    broadcast = false,
    chainId,
  }: ISignPsbt) {
    const keyData = this.keys[chainId].get(account)!;
    const keyPair = ECPair.fromWIF(keyData.wif);
    const transaction = bitcoin.Psbt.fromBase64(psbt, {
      network: keyData.network,
    });
    signInputs.forEach(({ address, index, sighashTypes }) => {
      let keyPairToSignWith = keyPair;
      if (address !== account) {
        const inputKeyData = this.keys[chainId].get(address)!;
        keyPairToSignWith = ECPair.fromWIF(inputKeyData.wif);
      }
      transaction.signInput(index, keyPairToSignWith, sighashTypes);
    });
    transaction.validateSignaturesOfInput(0, validator);
    transaction.finalizeAllInputs();

    if (!broadcast) {
      LogStore.log('Bitcoin PSBT signed', 'BitcoinLib', 'signPsbt');
      return {
        psbt: transaction.toBase64(),
      };
    }

    const tx = transaction.extractTransaction();
    const txid = await this.broadcastTransaction(tx.toHex());
    LogStore.log('Bitcoin PSBT signed and broadcast', 'BitcoinLib', 'signPsbt', {
      txid,
    });
    return {
      psbt: transaction.toBase64(),
      txid,
    };
  }

  async getUTXOs(address: string): Promise<IUTXO[]> {
    return await (
      await fetch(`https://mempool.space/api/address/${address}/utxo`)
    ).json();
  }

  async broadcastTransaction(transaction: string) {
    const result = await fetch('https://mempool.space/api/tx', {
      method: 'POST',
      body: transaction,
    });

    if (result.ok) {
      return await result.text();
    }
    throw new Error('Error broadcasting transaction: ' + (await result.text()));
  }

  getAvailableBalance(utxos: IUTXO[]) {
    return utxos.reduce((acc, { value }) => acc + value, 0);
  }

  private async getFeeRate() {
    const defaultFeeRate = 2;
    try {
      const response = await fetch(
        'https://mempool.space/api/v1/fees/recommended',
      );
      if (response.ok) {
        const data = await response.json();
        return parseInt(data?.economyFee ?? defaultFeeRate, 10);
      }
    } catch (e) {
      LogStore.error(
        (e as Error).message,
        'BitcoinLib',
        'getFeeRate',
      );
    }
    return defaultFeeRate;
  }

  private generateAddress({
    index,
    coinType,
    chainId,
    change = false,
    taproot = false,
  }: {
    index: number;
    coinType: string;
    chainId: IBip122ChainId;
    change?: boolean;
    taproot?: boolean;
  }) {
    const path = `m/84'/${coinType}'/0'/${change ? 1 : 0}/${index}`;
    const child = this.account.derivePath(path);
    let address: string;
    if (taproot) {
      address = bitcoin.payments.p2tr({
        pubkey: child.publicKey.slice(1),
        network: NETWORK,
      }).address!;
    } else {
      address = bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: NETWORK,
      }).address!;
    }
    const wif = child.toWIF();
    this.keys[chainId].set(address, { wif, network: NETWORK });
    return { address, path, publicKey: child.publicKey.toString('hex') };
  }

  private loadAddresses() {
    const chainId: IBip122ChainId = BIP122_MAINNET_CAIP2;
    const coinType = BIP122_MAINNET_COIN_TYPE;

    for (let i = 0; i < ADDRESS_COUNT; i++) {
      const addressParams = { index: i, chainId, coinType };
      // payment addresses (P2WPKH)
      const addressData = this.generateAddress(addressParams);
      this.addresses[chainId].set(addressData.address, addressData);
      // ordinals / taproot addresses (P2TR)
      const taprootAddress = this.generateAddress({
        ...addressParams,
        taproot: true,
      });
      this.ordinals[chainId].set(taprootAddress.address, taprootAddress);
    }
  }

  private async createTransaction({
    network,
    recipientAddress,
    amount,
    changeAddress,
    memo,
    utxos,
    privateKeyWIF,
    feeRate,
  }: ICreateTransaction) {
    const psbt = new bitcoin.Psbt({ network });
    const keyPair = ECPair.fromWIF(privateKeyWIF);
    const payment = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network,
    });

    utxos.forEach(utxo => {
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: Buffer.from(payment.output?.toString('hex')!, 'hex'),
          value: utxo.value,
        },
      });
    });

    psbt.addOutput({
      address: recipientAddress,
      value: amount,
    });
    const change = this.calculateChange(utxos, amount, feeRate);

    if (change > 0) {
      psbt.addOutput({
        address: changeAddress,
        value: change,
      });
    }

    if (memo) {
      const data = Buffer.from(memo, 'utf8');
      const embed = bitcoin.payments.embed({ data: [data] });
      psbt.addOutput({
        script: embed.output!,
        value: 0,
      });
    }

    psbt.signAllInputs(keyPair);
    psbt.validateSignaturesOfInput(0, validator);
    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction();
    return tx.toHex();
  }

  // Helper function to calculate change
  private calculateChange(
    utxos: IUTXO[],
    amount: number,
    feeRate: number,
  ): number {
    const inputSum = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
    /**
     * 10 bytes: estimated fixed transaction overhead.
     * 148 bytes: average size of each input (UTXO).
     * 34 bytes: size of each output (x2 for recipient + change).
     */
    const estimatedSize = 10 + 148 * utxos.length + 34 * 2;
    const fee = estimatedSize * feeRate;
    const change = inputSum - amount - fee;
    return change;
  }

  private getAddressData(address: string, chainId: IBip122ChainId) {
    const addressData = this.addresses[chainId].get(address);
    if (addressData) {
      return addressData;
    }
    return this.ordinals[chainId].get(address);
  }

  private isOrdinal(address: string, chainId: IBip122ChainId) {
    return this.ordinals[chainId].has(address);
  }
}
