import nacl from 'tweetnacl';
import { Buffer } from '@craftzdog/react-native-buffer';

interface IInitArgs {
  secretKey?: string; // 128 hex chars (64-byte Ed25519 secret key)
}

export default class CantonLib {
  private keyPair: nacl.SignKeyPair;

  constructor(keyPair: nacl.SignKeyPair) {
    this.keyPair = keyPair;
  }

  static init({ secretKey }: IInitArgs = {}) {
    const keyPair = secretKey
      ? nacl.sign.keyPair.fromSecretKey(
          new Uint8Array(Buffer.from(secretKey, 'hex')),
        )
      : nacl.sign.keyPair();

    return new CantonLib(keyPair);
  }

  getPublicKey(): string {
    return Buffer.from(this.keyPair.publicKey).toString('hex');
  }

  getPublicKeyBase64(): string {
    return Buffer.from(this.keyPair.publicKey).toString('base64');
  }

  getSecretKey(): string {
    return Buffer.from(this.keyPair.secretKey).toString('hex');
  }

  getPartyId(): string {
    return `operator::1220${this.getPublicKey()}`;
  }

  getEncodedPartyId(): string {
    return encodeURIComponent(this.getPartyId());
  }

  getNamespace(): string {
    return `1220${this.getPublicKey()}`;
  }

  signMessage(message: string): string {
    const msgBytes = new TextEncoder().encode(message);
    const signature = nacl.sign.detached(msgBytes, this.keyPair.secretKey);
    return Buffer.from(signature).toString('base64');
  }
}
