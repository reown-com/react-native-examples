import ecc from '@bitcoinerlab/secp256k1';
import * as bitcoin from 'bitcoinjs-lib';

// @ts-ignore
import * as bitcoinPSBTUtils from 'bitcoinjs-lib/src/cjs/psbt/psbtutils';

import type {CaipNetworkId} from '@reown/appkit-common-react-native';
import { bitcoinTestnet as bitcoinTestnetNetwork } from '@reown/appkit-react-native';

bitcoin.initEccLib(ecc);

export type SignPSBTResponse = {
  /**
   * The signed PSBT, string base64 encoded
   */
  psbt: string;
  /**
   * The `string` transaction id of the broadcasted transaction or `undefined` if not broadcasted
   */
  txid?: string;
};

type SignPSBTParams = {
  /**
   * The PSBT to be signed, string base64 encoded
   */
  psbt: string;
  signInputs: {
    /**
     * The address whose private key to use for signing.
     */
    address: string;
    /**
     * Specifies which input to sign
     */
    index: number;
    /**
     * Specifies which part(s) of the transaction the signature commits to
     */
    sighashTypes: number[];
  }[];
  /**
   * If `true`, the PSBT will be broadcasted after signing. Default is `false`.
   */
  broadcast?: boolean;
};

export const BitcoinUtil = {
  createSignPSBTParams(params: BitcoinUtil.CreateSignPSBTParams): SignPSBTParams {
    const network = this.getBitcoinNetwork(params.caipNetworkId);
    const payment = this.getPaymentByAddress(params.senderAddress, network);
    const psbt = new bitcoin.Psbt({ network });

    if (!payment.output) {
      throw new Error('Invalid payment output');
    }

    const change = this.calculateChange(params.utxos, params.amount, params.feeRate);

    if (change < 0) {
      throw new Error('Insufficient funds');
    } else if (change > 0) {
      psbt.addOutput({
        address: params.senderAddress,
        value: BigInt(change),
      });
    }

    for (const utxo of params.utxos) {
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: payment.output,
          value: BigInt(utxo.value),
        },
      });
    }

    psbt.addOutput({
      address: params.recipientAddress,
      value: BigInt(params.amount),
    });

    if (params.memo) {
      const data = Buffer.from(params.memo, 'utf8');
      const embed = bitcoin.payments.embed({ data: [data] });

      if (!embed.output) {
        throw new Error('Invalid embed output');
      }

      psbt.addOutput({
        script: embed.output,
        value: BigInt(0),
      });
    }

    return {
      psbt: psbt.toBase64(),
      signInputs: [],
      broadcast: false,
    };
  },

  async getUTXOs(address: string, networkId: CaipNetworkId): Promise<BitcoinUtil.UTXO[]> {
    const isTestnet = this.isTestnet(networkId);
    // Make chain dynamic

    const response = await fetch(
      `https://mempool.space${isTestnet ? '/testnet' : ''}/api/address/${address}/utxo`
    );

    return await response.json();
  },

  async getFeeRate() {
    const defaultFeeRate = 2;
    try {
      const response = await fetch('https://mempool.space/api/v1/fees/recommended');
      if (response.ok) {
        const data = await response.json();

        if (data?.fastestFee) {
          return parseInt(data.fastestFee, 10);
        }
      }
    } catch (e) {

      console.error('Error fetching fee rate', e);
    }

    return defaultFeeRate;
  },

  calculateChange(utxos: BitcoinUtil.UTXO[], amount: number, feeRate: number): number {
    const inputSum = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
    /**
     * 10 bytes: This is an estimated fixed overhead for the transaction.
     * 148 bytes: This is the average size of each input (UTXO).
     * 34 bytes: This is the size of each output.
     * The multiplication by 2 indicates that there are usually two outputs in a typical transaction (one for the recipient and one for change)
     */
    const estimatedSize = 10 + 148 * utxos.length + 34 * 2;
    const fee = estimatedSize * feeRate;
    const change = inputSum - amount - fee;

    return change;
  },

  isTestnet(networkId: CaipNetworkId): boolean {
    return networkId === bitcoinTestnetNetwork.caipNetworkId;
  },

  getBitcoinNetwork(networkId: CaipNetworkId): bitcoin.Network {
    return this.isTestnet(networkId) ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
  },

  getPaymentByAddress(
    address: string,
    network: bitcoin.networks.Network
  ): bitcoin.payments.Payment {
    const output = bitcoin.address.toOutputScript(address, network);

    if (bitcoinPSBTUtils.isP2MS(output)) {
      return bitcoin.payments.p2ms({ output, network });
    } else if (bitcoinPSBTUtils.isP2PK(output)) {
      return bitcoin.payments.p2pk({ output, network });
    } else if (bitcoinPSBTUtils.isP2PKH(output)) {
      return bitcoin.payments.p2pkh({ output, network });
    } else if (bitcoinPSBTUtils.isP2WPKH(output)) {
      return bitcoin.payments.p2wpkh({ output, network });
    } else if (bitcoinPSBTUtils.isP2WSHScript(output)) {
      return bitcoin.payments.p2wsh({ output, network });
    } else if (bitcoinPSBTUtils.isP2SHScript(output)) {
      return bitcoin.payments.p2sh({ output, network });
    } else if (bitcoinPSBTUtils.isP2TR(output)) {
      return bitcoin.payments.p2tr({ output, network });
    }

    throw new Error('Unsupported payment type');
  },

  normalizeSignature(signature: string): { hex: string; base64: string } {
    let raw: Buffer;

    try {
      // Try hex first
      raw = Buffer.from(signature, 'hex');
      if (raw.length > 0 && /^[0-9a-fA-F]+$/.test(signature)) {
        return {
          hex: signature,
          base64: raw.toString('base64'),
        };
      }
    } catch {
      // ignore and try base64
    }

    try {
      // Fallback: assume base64
      raw = Buffer.from(signature, 'base64');
      if (raw.length > 0) {
        return {
          hex: raw.toString('hex'),
          base64: signature,
        };
      }
    } catch {
      // ignore
    }

    throw new Error('Unsupported signature format: expected hex or base64');
  },
};

export namespace BitcoinUtil {
  export type CreateSignPSBTParams = {
    senderAddress: string;
    recipientAddress: string;
    caipNetworkId: CaipNetworkId;
    amount: number;
    utxos: UTXO[];
    feeRate: number;
    memo?: string;
  };

  export type UTXO = {
    txid: string;
    vout: number;
    value: number;
    status: {
      confirmed: boolean;
      block_height: number;
      block_hash: string;
      block_time: number;
    };
  };
}
