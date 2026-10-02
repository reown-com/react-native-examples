// Web-only fetch patch. Imported early in index.web.js (before App).
//
// @reown/appkit-*-react-native's API client (ApiController._getApiHeaders) sets
// `User-Agent` and `origin` request headers manually, because React Native's
// fetch doesn't populate them. In the browser these are set automatically, and
// setting `User-Agent` via fetch() turns it into a non-safelisted header that
// triggers a CORS preflight the Reown API (api.web3modal.org) rejects — so the
// wallet directory fetch fails with "NetworkError when attempting to fetch
// resource" and the wallet list never loads.
//
// We strip only those two RN-specific headers so the request stays a simple
// cross-origin GET (the browser then sends the real Origin/User-Agent itself).
// All other headers are left untouched.
/* global globalThis, Headers */
const originalFetch = globalThis.fetch;

if (typeof originalFetch === 'function') {
  globalThis.fetch = function patchedFetch(input, init) {
    if (init && init.headers) {
      const headers = new Headers(init.headers);
      headers.delete('User-Agent');
      headers.delete('origin');
      return originalFetch.call(this, input, {...init, headers});
    }
    return originalFetch.call(this, input, init);
  };
}
