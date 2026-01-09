import '@walletconnect/react-native-compat';
import 'react-native-get-random-values';
import crypto from 'react-native-quick-crypto';

// Install quick-crypto
if (typeof (crypto as any).install === 'function') {
  (crypto as any).install();
}

// Polyfill crypto.subtle.digest for viem/WalletKit
const polyfillDigest = async (
  algorithm: string,
  data: BufferSource,
): Promise<ArrayBuffer> => {
  const algo = algorithm.replace('-', '').toLowerCase();
  const hash = crypto.createHash(algo);
  hash.update(Buffer.from(data as ArrayBuffer));
  return hash.digest();
};

if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = {};
}
if (typeof globalThis.crypto.subtle === 'undefined') {
  (globalThis as any).crypto.subtle = {};
}
(globalThis as any).crypto.subtle.digest = polyfillDigest;

export {};
