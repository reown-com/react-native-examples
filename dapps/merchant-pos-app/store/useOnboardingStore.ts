import { DEFAULT_TOKEN_IDS, NetworkId } from "@/constants/networks";
import { create } from "zustand";

/**
 * Transient onboarding state (in-memory): the draft collected across screens
 * S2–S6 (committed to useMerchantStore on "Finish setup") plus the verify
 * screen's per-namespace signing progress. The persisted "has this address
 * verified this session" truth lives in useMerchantStore.verifiedAddresses —
 * not here.
 */
interface OnboardingStore {
  email: string;
  companyName: string;
  logoUri?: string;
  networks: NetworkId[];
  tokens: string[];
  /** Namespaces that have produced a valid signature in the current verify attempt. */
  signedNamespaces: NetworkId[];

  setBusinessDetails: (details: {
    email: string;
    companyName: string;
    logoUri?: string;
  }) => void;
  setNetworks: (networks: NetworkId[]) => void;
  toggleNetwork: (network: NetworkId) => void;
  setTokens: (tokens: string[]) => void;
  toggleToken: (tokenId: string) => void;
  markSigned: (namespace: NetworkId) => void;
  /** Reset just the signing progress (on disconnect) — keeps the draft. */
  resetVerification: () => void;
  reset: () => void;
}

const initialState = {
  email: "",
  companyName: "",
  logoUri: undefined as string | undefined,
  networks: ["eip155", "solana"] as NetworkId[],
  tokens: DEFAULT_TOKEN_IDS,
  signedNamespaces: [] as NetworkId[],
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,
  setBusinessDetails: ({ email, companyName, logoUri }) =>
    set({ email, companyName, logoUri }),
  setNetworks: (networks) => set({ networks }),
  toggleNetwork: (network) => {
    const current = get().networks;
    const next = current.includes(network)
      ? current.filter((n) => n !== network)
      : [...current, network];
    // At least one network must remain selected.
    if (next.length === 0) return;
    set({ networks: next });
  },
  setTokens: (tokens) => set({ tokens }),
  toggleToken: (tokenId) => {
    const current = get().tokens;
    set({
      tokens: current.includes(tokenId)
        ? current.filter((t) => t !== tokenId)
        : [...current, tokenId],
    });
  },
  markSigned: (namespace) =>
    set((state) =>
      state.signedNamespaces.includes(namespace)
        ? state
        : { signedNamespaces: [...state.signedNamespaces, namespace] },
    ),
  resetVerification: () => set({ signedNamespaces: [] }),
  reset: () => set({ ...initialState }),
}));
