// Expo config plugin: injects the wallet-detection <queries> block into the
// prebuild-generated android/app/src/main/AndroidManifest.xml.
//
// Android 11+ (targetSdk 30+) hides other installed apps unless they are
// declared in <queries>. AppKit needs to know which wallet apps are installed
// to show the "installed" badge / open them directly, so it calls
// PackageManager for each of these package names. Expo's app.json has no field
// for arbitrary <queries><package> entries, so we add them via withAndroidManifest.
// Mirrors the old bare-RN android/app/src/main/AndroidManifest.xml <queries>.
const { withAndroidManifest } = require('@expo/config-plugins');

const WALLET_PACKAGES = [
  'io.metamask',
  'com.wallet.crypto.trustapp',
  'io.gnosis.safe',
  'me.rainbow',
  'io.zerion.android',
  'im.token.app',
  'im.argent.contractwalletclient',
  'com.spot.spot',
  'fi.steakwallet.app',
  'com.defi.wallet',
  'vip.mytokenpocket',
  'com.frontierwallet',
  'piuk.blockchain.android',
  'io.safepal.wallet',
  'com.zengo.wallet',
  'io.oneinch.android',
  'exodusmovement.exodus',
  'com.ledger.live',
  'com.myetherwallet.mewwallet',
  'io.stormbird.wallet',
  'co.bacoor.keyring',
  'com.lobstr.client',
  'com.mathwallet.android',
  'com.unstoppabledomains.manager',
  'com.hashhalli.obvious',
  'com.fireblocks.client',
  'com.ambire.wallet',
  'com.mtpelerin.bridge',
  'com.internetmoneywallet.app',
  'com.bitcoin.mwallet',
  'coin98.crypto.finance.media',
  'io.myabcwallet.mpc',
  'finance.ottr.android',
  'co.arculus.wallet.android',
  'com.huddln',
  'com.permutize.haha',
  'com.modular',
  'com.carrieverse.cling.wallet',
  'com.broearn.browser',
  'com.ripio.android',
  'kh.com.sabay.sabaywallet',
  'com.tokoin.wallet',
  'org.toshi',
  'com.solflare.mobile',
  'app.phantom',
];

const withAndroidWalletQueries = config =>
  withAndroidManifest(config, cfg => {
    const manifest = cfg.modResults.manifest;

    // Ensure a single <queries> element exists.
    if (!Array.isArray(manifest.queries)) {
      manifest.queries = [];
    }
    if (manifest.queries.length === 0) {
      manifest.queries.push({ package: [] });
    }
    const queries = manifest.queries[0];
    if (!Array.isArray(queries.package)) {
      queries.package = [];
    }

    const existing = new Set(
      queries.package.map(p => p.$ && p.$['android:name']).filter(Boolean),
    );
    for (const name of WALLET_PACKAGES) {
      if (!existing.has(name)) {
        queries.package.push({ $: { 'android:name': name } });
        existing.add(name);
      }
    }

    return cfg;
  });

module.exports = withAndroidWalletQueries;
module.exports.WALLET_PACKAGES = WALLET_PACKAGES;
