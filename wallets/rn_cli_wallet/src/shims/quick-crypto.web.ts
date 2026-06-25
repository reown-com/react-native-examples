// Web shim for react-native-quick-crypto (metro.config.js redirects it here on
// web, and the babel `crypto` alias points at it). quick-crypto is native JSI —
// importing it on web throws ("native QuickCrypto Module could not be found").
//
// The browser already provides Web Crypto (globalThis.crypto: getRandomValues +
// subtle), so here we only need a no-op install() and to pass through the
// browser crypto. The web3 stack on web uses pure-JS hashing (@noble, ethers)
// and globalThis.crypto for randomness, so it doesn't need Node's `crypto` API.
/* eslint-disable no-undef */
const webCrypto: Crypto | undefined =
  typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

export function install(): void {
  // no-op on web — Web Crypto is already available.
}

export function getRandomValues<T extends ArrayBufferView | null>(array: T): T {
  return webCrypto ? (webCrypto.getRandomValues(array as any) as T) : array;
}

export const subtle = webCrypto?.subtle;

export default {
  install,
  getRandomValues,
  subtle,
  webcrypto: webCrypto,
};
