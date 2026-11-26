// Polyfills required by WalletConnect / AppKit and crypto libraries.
// Must be imported before any wallet/crypto code runs (see app/_layout.tsx).
import "text-encoding";
import "react-native-get-random-values";
import "@walletconnect/react-native-compat";
