import { Account } from "@reown/appkit-react-native/lib/typescript/hooks/useAccount";
import { getNetworkById } from "./networks";

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
