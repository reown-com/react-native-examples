import { NetworkId } from "@/constants/networks";
import { ConnectionsController } from "@reown/appkit-core-react-native";

export type AddressByNamespace = Partial<Record<NetworkId, string>>;

export interface ConnectedAccount {
  namespace: NetworkId;
  /** Bare address (last CAIP segment). */
  address: string;
  /** Full CAIP-10 account id: `namespace:chainId:address`. */
  caip: string;
}

function isSupportedNamespace(ns: string): ns is NetworkId {
  return ns === "eip155" || ns === "solana";
}

/**
 * Returns one connected account per supported namespace, read from AppKit's
 * ConnectionsController.
 *
 * A single WalletConnect session can approve multiple chains, in which case the
 * approved CAIP accounts (e.g. `eip155:1:0x…` and `solana:…:…`) may all live in
 * one connection's `accounts` array rather than in separate per-namespace map
 * entries. So we scan every account across every connection and group by the
 * namespace parsed from each CAIP address.
 */
export function getConnectedAccounts(): ConnectedAccount[] {
  const accounts: ConnectedAccount[] = [];
  const seen = new Set<NetworkId>();
  try {
    ConnectionsController.state.connections.forEach((connection) => {
      for (const caip of connection.accounts ?? []) {
        const parts = caip.split(":");
        const ns = parts[0];
        const address = parts[parts.length - 1];
        if (isSupportedNamespace(ns) && address && !seen.has(ns)) {
          seen.add(ns);
          accounts.push({ namespace: ns, address, caip });
        }
      }
    });
  } catch {
    // Controller not ready / shape changed.
  }
  if (__DEV__) {
    console.log(
      "[merchant] connected accounts:",
      accounts.map((a) => `${a.namespace}:${a.address}`),
    );
  }
  return accounts;
}

/** Convenience: just the bare address per namespace. */
export function getConnectedAddresses(): AddressByNamespace {
  const result: AddressByNamespace = {};
  for (const account of getConnectedAccounts()) {
    result[account.namespace] = account.address;
  }
  return result;
}
