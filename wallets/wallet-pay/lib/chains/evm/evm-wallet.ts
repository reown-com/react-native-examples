import type { TypedData, TypedDataDomain, TransactionSerializable } from 'viem';
import { mnemonicToAccount, type HDAccount } from 'viem/accounts';
import { IWallet, WalletCreateOptions } from '../../base/wallet-base';
import { mnemonicUtils } from '@/utils/mnemonic';
/**
 * Result from wallet creation, includes mnemonic for initial storage.
 * The mnemonic should be saved to secure storage and NOT kept in memory.
 */
export interface EvmWalletCreateResult {
  wallet: EvmWallet;
  mnemonic: string;
}

/**
 * EVM-compatible wallet implementation using viem.
 * Implements the IWallet interface for the plugin-based architecture.
 *
 * Security: The mnemonic is NOT stored in memory. Only the derived
 * HDAccount (containing the private key) is kept for signing operations.
 * Retrieve mnemonic from secure storage when needed for backup/export.
 */
export class EvmWallet implements IWallet {
  private account: HDAccount;

  private constructor(account: HDAccount) {
    this.account = account;
  }

  /**
   * Create a new EVM wallet or restore from mnemonic.
   * Returns both the wallet and mnemonic - save mnemonic to secure storage immediately.
   * @throws Error if provided mnemonic is invalid
   */
  static create(options?: WalletCreateOptions): EvmWalletCreateResult {
    const mnemonic = options?.mnemonic ?? mnemonicUtils.generate();

    // Validate mnemonic if restoring from storage
    if (options?.mnemonic && !mnemonicUtils.validate(mnemonic)) {
      throw new Error('Invalid mnemonic provided');
    }

    const account = mnemonicToAccount(mnemonic);
    return {
      wallet: new EvmWallet(account),
      mnemonic,
    };
  }

  /**
   * Get the wallet's Ethereum address
   */
  getAddress(): string {
    return this.account.address;
  }

  /**
   * Sign a message using personal_sign
   */
  async signMessage(message: string): Promise<string> {
    return await this.account.signMessage({ message });
  }

  /**
   * Sign EIP-712 typed data
   */
  async signTypedData(params: {
    domain: TypedDataDomain;
    types: TypedData;
    primaryType: string;
    message: any;
  }): Promise<string> {
    return await this.account.signTypedData(params);
  }

  /**
   * Sign a transaction
   */
  async signTransaction(tx: TransactionSerializable): Promise<string> {
    return await this.account.signTransaction(tx);
  }

  /**
   * Get the underlying viem account for advanced operations
   */
  getAccount(): HDAccount {
    return this.account;
  }
}
