import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import {
  authorizeEntry,
  hash,
  Keypair,
  Networks,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk/base';

import LogStore from '@/store/LogStore';
import { STELLAR_PUBNET_CAIP2, STELLAR_TESTNET_CAIP2 } from '@/constants/Stellar';

// Buffer is polyfilled globally by '@walletconnect/react-native-compat' (loaded
// in index.js). We intentionally use the global (Node-typed) Buffer here rather
// than @craftzdog/react-native-buffer so the types line up with
// @stellar/stellar-sdk (its XDR APIs expect a Node Buffer).

interface IInitArguments {
  /** BIP39 mnemonic; the primary Stellar account is derived from it. */
  mnemonic?: string;
  /** Strkey-encoded secret, e.g. `SB…` */
  secret?: string;
}

// SLIP-0010 / SEP-0005 derivation path for the primary Stellar account.
const STELLAR_PATH = "m/44'/148'/0'";

/**
 * CAIP-2 chain id -> Stellar network passphrase. The passphrase is always bound
 * from the session's chain id, never trusted from a request payload, as
 * required by the Stellar WalletConnect signing semantics.
 */
const STELLAR_NETWORK_PASSPHRASES: Record<string, string> = {
  [STELLAR_PUBNET_CAIP2]: Networks.PUBLIC,
  [STELLAR_TESTNET_CAIP2]: Networks.TESTNET,
};

/**
 * Library
 */
export default class StellarLib {
  private keypair: Keypair;
  private mnemonic: string;
  private address: string;

  constructor({ mnemonic, secret }: IInitArguments) {
    if (secret) {
      this.keypair = Keypair.fromSecret(secret);
      this.mnemonic = '';
    } else {
      this.mnemonic = mnemonic ? mnemonic : bip39.generateMnemonic();
      const seed = bip39.mnemonicToSeedSync(this.mnemonic);
      const { key } = derivePath(STELLAR_PATH, seed.toString('hex'));
      this.keypair = Keypair.fromRawEd25519Seed(Buffer.from(key));
    }
    this.address = this.keypair.publicKey();
    LogStore.info('Stellar wallet initialized', 'StellarLib', 'constructor', {
      address: this.address,
    });
  }

  static async init({ mnemonic, secret }: IInitArguments) {
    return new StellarLib({ mnemonic, secret });
  }

  public getAddress() {
    return this.address;
  }

  public getMnemonic() {
    return this.mnemonic;
  }

  public getSecret() {
    return this.keypair.secret();
  }

  private getNetworkPassphrase(chainId: string): string {
    const networkPassphrase = STELLAR_NETWORK_PASSPHRASES[chainId];
    if (!networkPassphrase) {
      throw new Error(`Unsupported Stellar chain: ${chainId}`);
    }
    return networkPassphrase;
  }

  /**
   * Signs a transaction envelope XDR (base64) and returns the fully signed
   * envelope XDR.
   */
  public signXDR(xdrValue: string, chainId: string): string {
    const networkPassphrase = this.getNetworkPassphrase(chainId);
    const transaction = TransactionBuilder.fromXDR(xdrValue, networkPassphrase);
    transaction.sign(this.keypair);
    LogStore.log('Stellar XDR signed', 'StellarLib', 'signXDR');
    return transaction.toXDR();
  }

  /**
   * Signs a transaction envelope and submits it to the chain's Horizon endpoint.
   */
  public async signAndSubmitXDR(
    xdrValue: string,
    chainId: string,
    rpcUrl: string,
    waitForInclusion = false,
  ): Promise<{ tx_hash: string; signedXDR: string; successful?: boolean }> {
    if (!rpcUrl) {
      throw new Error(`No Horizon RPC configured for chain: ${chainId}`);
    }

    const networkPassphrase = this.getNetworkPassphrase(chainId);
    const transaction = TransactionBuilder.fromXDR(xdrValue, networkPassphrase);
    transaction.sign(this.keypair);

    const signedXDR = transaction.toXDR();
    const txHash = transaction.hash().toString('hex');

    // React Native's fetch has no built-in timeout; without one an unreachable
    // or slow Horizon would hang the sign flow modal indefinitely with no way to
    // cancel. Abort after 30s so the request rejects and the modal can recover.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let response: Response;
    try {
      response = await fetch(`${rpcUrl.replace(/\/$/, '')}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ tx: signedXDR }).toString(),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    const result = await response.json();

    if (!response.ok) {
      const codes = result?.extras?.result_codes;
      throw new Error(
        codes
          ? JSON.stringify(codes)
          : result?.detail || 'Failed to submit Stellar transaction',
      );
    }

    LogStore.log('Stellar transaction submitted', 'StellarLib', 'signAndSubmitXDR', {
      txHash: result?.hash ?? txHash,
    });

    return {
      tx_hash: result?.hash ?? txHash,
      signedXDR,
      ...(waitForInclusion ? { successful: result?.successful ?? true } : {}),
    };
  }

  /**
   * Signs an arbitrary message under the account's Ed25519 key with the
   * domain-separating prefix required by the spec:
   *   sign(Ed25519, sha256("StellarMessage" || 0x00 || message))
   * @returns base64-encoded 64-byte Ed25519 signature
   */
  public signMessage(
    message: string,
    messageEncoding: 'utf-8' | 'base64' = 'utf-8',
  ): string {
    const messageBytes =
      messageEncoding === 'base64'
        ? Buffer.from(message, 'base64')
        : Buffer.from(message, 'utf-8');

    const payload = hash(
      Buffer.concat([
        Buffer.from('StellarMessage'),
        Buffer.from([0]),
        messageBytes,
      ]),
    );

    LogStore.log('Stellar message signed', 'StellarLib', 'signMessage');
    return this.keypair.sign(payload).toString('base64');
  }

  /**
   * Signs a Soroban `SorobanAuthorizationEntry` (address credentials),
   * populating its signature SCVal. The network id is bound from the session
   * chain.
   * @param authEntry base64-encoded unsigned SorobanAuthorizationEntry
   * @returns base64-encoded signed SorobanAuthorizationEntry
   */
  public async signAuthEntry(
    authEntry: string,
    chainId: string,
  ): Promise<string> {
    const networkPassphrase = this.getNetworkPassphrase(chainId);
    const entry = xdr.SorobanAuthorizationEntry.fromXDR(authEntry, 'base64');

    if (
      entry.credentials().switch() !==
      xdr.SorobanCredentialsType.sorobanCredentialsAddress()
    ) {
      throw new Error(
        'Only SOROBAN_CREDENTIALS_ADDRESS auth entries are signable',
      );
    }

    // Preserve the entry's existing expiration ledger so all fields but the
    // signature stay byte-identical to the input.
    const validUntilLedgerSeq = entry
      .credentials()
      .address()
      .signatureExpirationLedger();

    const signedEntry = await authorizeEntry(
      entry,
      this.keypair,
      validUntilLedgerSeq,
      networkPassphrase,
    );

    LogStore.log('Stellar auth entry signed', 'StellarLib', 'signAuthEntry');
    return signedEntry.toXDR('base64');
  }
}
