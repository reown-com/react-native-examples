import { NetworkId } from "@/constants/networks";
import { appkit } from "@/services/appkit-instance";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

/**
 * AppKit builds its WC proposal namespaces from `config.networks` once, in the
 * constructor (see node_modules/@reown/appkit-react-native/src/AppKit.ts —
 * `this.namespaces = WcHelpersUtil.createNamespaces(this.networks, …)`), and
 * uses that object on every `connect()`. There's no public API to update it,
 * so to scope a connect proposal to a subset of namespaces we filter the
 * private `namespaces` field directly. We cache the original on first use so
 * subsequent calls (e.g. "switch back to both") restore correctly.
 */
const appkitMut = appkit as unknown as { namespaces: AnyRecord };

let originalNamespaces: AnyRecord | null = null;

export function scopeNetworksToNamespaces(namespaces: NetworkId[]) {
  if (!appkitMut.namespaces || typeof appkitMut.namespaces !== "object") return;

  if (!originalNamespaces) {
    originalNamespaces = { ...appkitMut.namespaces };
  }

  const wanted = new Set<string>(namespaces);
  const filtered: AnyRecord = {};
  for (const key of Object.keys(originalNamespaces)) {
    if (wanted.has(key)) filtered[key] = originalNamespaces[key];
  }

  if (Object.keys(filtered).length === 0) {
    // Don't ship an empty proposal — fall back to the full set.
    if (__DEV__) {
      console.warn("[appkit] empty namespace scope, leaving full set");
    }
    appkitMut.namespaces = { ...originalNamespaces };
    return;
  }

  if (__DEV__) {
    console.log(
      `[appkit] scoping namespaces to: ${Object.keys(filtered).join(",")}`,
    );
  }
  appkitMut.namespaces = filtered;
}

/** Restore the full set of namespaces (call before opening a Log in flow). */
export function restoreFullNamespaceScope() {
  if (!originalNamespaces) return;
  if (__DEV__) console.log("[appkit] restoring full namespace scope");
  appkitMut.namespaces = { ...originalNamespaces };
}
