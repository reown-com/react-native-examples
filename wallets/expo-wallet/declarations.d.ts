declare module '*.webp';

// Module declarations for polyfilled crypto modules
declare module 'react-native-quick-crypto' {
  export function createHash(algorithm: string): {
    update(data: Buffer | Uint8Array | string): void;
    digest(): Buffer;
  };
  export function pbkdf2Sync(
    password: Buffer | Uint8Array,
    salt: Buffer | Uint8Array,
    iterations: number,
    keylen: number,
    digest: string
  ): Buffer;
  export function pbkdf2(
    password: Buffer | Uint8Array,
    salt: Buffer | Uint8Array,
    iterations: number,
    keylen: number,
    digest: string,
    callback: (err: Error | null, derivedKey: Buffer) => void
  ): void;
  export function install(): void;
  const crypto: any;
  export default crypto;
}
