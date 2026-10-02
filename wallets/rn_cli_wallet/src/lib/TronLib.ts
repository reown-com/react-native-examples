import { TronWeb, utils } from 'tronweb';

/**
 * Types
 */
interface IInitArguments {
  privateKey: string;
}

/** A WalletConnect Pay `tron_signTransaction` action payload, as built by the gateway. */
export interface TronUnsignedTransaction {
  txID: string;
  raw_data_hex: string;
  raw_data?: Record<string, any>;
  visible?: boolean;
}

/**
 * What the wallet hands back at `confirm`: the exact bytes it signed plus exactly
 * one 65-byte recoverable signature. A type alias (not an interface) so it is
 * assignable to the Pay SDK's `Record<string, unknown>` `data` element.
 */
export type TronSignedTransaction = {
  raw_data_hex: string;
  signature: string[];
};

/**
 * Library
 */
export default class TronLib {
  privateKey: string;
  tronWeb: TronWeb;

  constructor(privateKey: string) {
    this.privateKey = privateKey;
    this.tronWeb = new TronWeb({
      // Nile TestNet, if you want to use in MainNet, change the fullHost to 'https://api.trongrid.io', or use tronWeb.setFullNode
      fullHost: 'https://nile.trongrid.io/',
      privateKey: privateKey,
    });
  }

  static async init({ privateKey }: IInitArguments) {
    if (!privateKey) {
      const account = utils.accounts.generateAccount();
      return new TronLib(account.privateKey);
    } else {
      return new TronLib(privateKey);
    }
  }

  public getAddress() {
    return this.tronWeb.defaultAddress.base58;
  }

  public createAccount() {
    return this.tronWeb.createAccount();
  }

  public setFullNode(node: string) {
    return this.tronWeb.setFullNode(node);
  }

  public async signMessage(message: string) {
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message: must be a non-empty string');
    }
    const signedtxn = await this.tronWeb.trx.signMessageV2(message);
    return signedtxn;
  }

  public async signTransaction(transaction: any) {
    // The transaction parameter is expected to be unwrapped already.
    const signedtxn = await this.tronWeb.trx.sign(transaction);
    return signedtxn;
  }

  public async sendTransaction(signedTransaction: any) {
    const result = await this.tronWeb.trx.sendRawTransaction(signedTransaction);
    return {
      result: result.result ?? false,
      txid: result.txid ?? signedTransaction.txID,
    };
  }

  /**
   * Signs a WalletConnect Pay `tron_signTransaction` action.
   *
   * Tron is a sign-only relay family: WC Pay built these bytes, has already
   * committed to `txID`, and broadcasts the result itself. `raw_data_hex` is
   * therefore opaque — refreshing the expiration, re-deriving the TAPOS ref
   * block, adjusting `fee_limit` or re-encoding `raw_data` all change the hash
   * and get the payment rejected with `tx_id_mismatch`. So this only verifies
   * what it was given and signs it verbatim; it deliberately does not go
   * through `trx.sign`, which re-serializes `raw_data` from JSON.
   */
  public signPaymentTransaction(
    transaction: TronUnsignedTransaction,
  ): TronSignedTransaction {
    const rawDataHex = transaction?.raw_data_hex;
    if (!rawDataHex) {
      throw new Error('Missing raw_data_hex in Tron payment transaction');
    }
    if (!transaction.txID) {
      throw new Error('Missing txID in Tron payment transaction');
    }

    // `txID` is sha256(raw_data). Checking it here surfaces a mismatch as a
    // readable wallet-side error instead of an opaque `tx_id_mismatch` at confirm.
    const digest = utils.crypto.SHA256(utils.code.hexStr2byteArray(rawDataHex));
    const computedTxID = utils.bytes.byteArray2hexStr(digest).toLowerCase();
    const expectedTxID = transaction.txID.replace(/^0x/, '').toLowerCase();
    if (computedTxID !== expectedTxID) {
      throw new Error(
        `Tron txID mismatch: sha256(raw_data_hex) is ${computedTxID} but the transaction declares ${expectedTxID}`,
      );
    }

    this.assertTransactionOwner(transaction);

    // 65-byte recoverable signature (r ‖ s ‖ v) as 130 hex characters.
    const signature = utils.crypto.ECKeySign(
      digest,
      utils.code.hexStr2byteArray(this.privateKey.replace(/^0x/, '')),
    );

    return { raw_data_hex: rawDataHex, signature: [signature] };
  }

  /**
   * Guards WC Pay's `owner_mismatch` rule: the transaction must spend from the
   * account the option was quoted against.
   */
  private assertTransactionOwner(transaction: TronUnsignedTransaction) {
    const owner =
      transaction.raw_data?.contract?.[0]?.parameter?.value?.owner_address;
    if (!owner) {
      return;
    }

    const address = this.getAddress() as string;
    if (TronWeb.address.toHex(owner) !== TronWeb.address.toHex(address)) {
      throw new Error(
        `Tron transaction owner ${TronWeb.address.fromHex(
          owner,
        )} does not match wallet ${address}`,
      );
    }
  }
}
