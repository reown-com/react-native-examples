/**
 * Base interface that all blockchain wallet implementations must follow.
 * This enables a plugin-based architecture for multi-chain support.
 */
export interface IWallet {
  /**
   * Get the wallet's public address
   */
  getAddress(): string;

  /**
   * Sign a message with the wallet's private key
   */
  signMessage(message: string): Promise<string>;

  /**
   * Sign a transaction with the wallet's private key
   */
  signTransaction(tx: unknown): Promise<string>;
}

/**
 * Options for creating a wallet instance
 */
export interface WalletCreateOptions {
  /**
   * Optional mnemonic phrase to restore an existing wallet.
   * If not provided, a new wallet will be created.
   */
  mnemonic?: string;
}
