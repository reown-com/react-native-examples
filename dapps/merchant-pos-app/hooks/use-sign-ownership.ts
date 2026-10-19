import { ConnectedAccount } from "@/utils/wallet-accounts";
import { ConnectionsController } from "@reown/appkit-core-react-native";

/** Human-readable ownership message the merchant signs, per address. */
export function buildOwnershipMessage(address: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  return [
    `I am the owner of`,
    address,
    ``,
    `Merchant POS`,
    `Merchant Onboarding`,
    `Timestamp: ${timestamp}`,
  ].join("\n");
}

type SigningAdapter = {
  signMessage?: (
    address: string,
    message: string,
    chainId?: string,
  ) => Promise<string | undefined>;
};

/**
 * Signs the ownership message for a connected account by calling that
 * namespace's adapter directly.
 *
 * We deliberately do NOT switch the active namespace (e.g. via
 * setActiveNamespace): doing so re-runs the WalletConnect connector's
 * setDefaultChain, which fires onChainChanged and churns connection state
 * (and can reset navigation). Signing through the per-namespace adapter routes
 * to the right chain (EVM, Solana, …) without touching the active namespace.
 */
export async function signOwnership(
  account: ConnectedAccount,
): Promise<string> {
  const connection = ConnectionsController.state.connections.get(
    account.namespace,
  );
  const adapter = connection?.adapter as SigningAdapter | undefined;
  if (!adapter?.signMessage) {
    throw new Error(`No connector available for ${account.namespace}`);
  }

  const [, chainId, plainAddress] = account.caip.split(":");
  const message = buildOwnershipMessage(account.address);
  const signature = await adapter.signMessage(
    plainAddress ?? account.address,
    message,
    chainId,
  );
  if (!signature) {
    throw new Error("Signature was rejected");
  }
  return signature;
}
