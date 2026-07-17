// Web shim for react-native-quick-crypto (metro.config.js redirects it here on
// web, and the babel `crypto` alias points at it). quick-crypto is native JSI —
// importing it on web throws ("native QuickCrypto Module could not be found").
//
// The browser already provides Web Crypto (globalThis.crypto: getRandomValues +
// subtle), so here we only need a no-op install() and to pass through the
// browser crypto. The web3 stack on web uses pure-JS hashing (@noble, ethers)
// and globalThis.crypto for randomness, so it doesn't need Node's `crypto` API.
import {pbkdf2 as noblePbkdf2} from '@noble/hashes/pbkdf2';
import {sha256} from '@noble/hashes/sha256';
import {sha512} from '@noble/hashes/sha512';
import {sha1} from '@noble/hashes/sha1';

const webCrypto: Crypto | undefined =
  typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

export function install(): void {
  // no-op on web — Web Crypto is already available.
}

export function getRandomValues<T extends ArrayBufferView | null>(array: T): T {
  return webCrypto ? (webCrypto.getRandomValues(array as any) as T) : array;
}

export const subtle = webCrypto?.subtle;

// Node's `crypto.pbkdf2Sync`, implemented in pure JS via @noble/hashes. The
// `bip39` patch aliases its seed derivation (`mnemonicToSeedSync`) to
// `crypto.pbkdf2Sync` — the fast native path via quick-crypto on device; on web
// we provide it here so bip39-based mnemonic -> seed derivation (Solana, Sui,
// Ton) works instead of throwing "pbkdf2 is not a function". (ethers v6 derives
// its own seed via @noble/hashes and no longer routes through `crypto`.)
type Hashish = typeof sha512;
const HASHES: Record<string, Hashish> = {sha512, sha256, sha1};

function toBytes(input: any): Uint8Array {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (typeof input === 'string') {
    return new TextEncoder().encode(input);
  }
  // Buffer / ArrayBufferView
  if (input && input.buffer) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  return Uint8Array.from(input);
}

export function pbkdf2Sync(
  password: any,
  salt: any,
  iterations: number,
  keylen: number,
  digest: string = 'sha1',
): Uint8Array {
  const hash = HASHES[digest?.toLowerCase?.()];
  if (!hash) {
    throw new Error(`pbkdf2Sync: unsupported digest "${digest}"`);
  }
  const derived = noblePbkdf2(hash, toBytes(password), toBytes(salt), {
    c: iterations,
    dkLen: keylen,
  });
  // Return a Buffer when available (Node-compatible); ethers' arrayify accepts
  // either a Buffer or a plain Uint8Array.
  const B = (globalThis as any).Buffer;
  return B ? B.from(derived) : derived;
}

export function pbkdf2(
  password: any,
  salt: any,
  iterations: number,
  keylen: number,
  digest: string,
  callback: (err: Error | null, derivedKey?: Uint8Array) => void,
): void {
  try {
    const derivedKey = pbkdf2Sync(password, salt, iterations, keylen, digest);
    callback(null, derivedKey);
  } catch (err) {
    callback(err as Error);
  }
}

export default {
  install,
  getRandomValues,
  subtle,
  webcrypto: webCrypto,
  pbkdf2Sync,
  pbkdf2,
};
