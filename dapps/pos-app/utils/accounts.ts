import { Account } from "@reown/appkit-react-native/lib/typescript/hooks/useAccount";
import { isAddress } from "viem";
import { getNetworkById } from "./networks";
import { Namespace } from "./types";

export const getAccounts = (accounts: Account[]) => {
  const seenChainIds = new Set<string>();

  return accounts
    .map((account) => ({
      address: account.address,
      namespace: account.namespace,
      chainId: account.chainId,
      network: getNetworkById(account.chainId),
    }))
    .filter((account) => {
      if (!account.network) return false;

      if (seenChainIds.has(account.chainId)) {
        return false;
      }

      seenChainIds.add(account.chainId);
      return true;
    });
};

export const isValidAddress = (namespace: Namespace, address: string) => {
  if (!address || typeof address !== "string") {
    return false;
  }

  switch (namespace) {
    case "eip155": {
      return isAddress(address);
    }
    case "solana": {
      const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      return base58Regex.test(address);
    }
    default:
      return false;
  }
};
