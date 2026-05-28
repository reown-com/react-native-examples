import { DEFAULT_TOKEN_IDS, NetworkId } from "@/constants/networks";
import { create } from "zustand";

/**
 * Transient onboarding draft (in-memory). Populated across screens S2–S6, then
 * committed to useMerchantStore on "Finish setup". Reset on finish or restart.
 */
interface OnboardingStore {
  email: string;
  companyName: string;
  logoUri?: string;
  networks: NetworkId[];
  tokens: string[];
  /** True once onboarding has begun (used to resume the flow). */
  started: boolean;
  /** True once ownership has been verified by signing (next step is tokens). */
  verified: boolean;
  /** Namespaces that have already produced a valid signature in this onboarding. */
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
  setVerified: (verified: boolean) => void;
  markSigned: (namespace: NetworkId) => void;
  reset: () => void;
}

const initialState = {
  email: "",
  companyName: "",
  logoUri: undefined as string | undefined,
  networks: ["eip155", "solana"] as NetworkId[],
  tokens: DEFAULT_TOKEN_IDS,
  started: false,
  verified: false,
  signedNamespaces: [] as NetworkId[],
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,
  setBusinessDetails: ({ email, companyName, logoUri }) =>
    set({ email, companyName, logoUri, started: true }),
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
  setVerified: (verified) => set({ verified }),
  markSigned: (namespace) =>
    set((state) =>
      state.signedNamespaces.includes(namespace)
        ? state
        : { signedNamespaces: [...state.signedNamespaces, namespace] },
    ),
  reset: () => set({ ...initialState }),
}));
