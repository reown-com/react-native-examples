import { storage } from "@/utils/storage";
import { PaymentLink } from "@/utils/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PaymentLinksStore {
  links: PaymentLink[];
  addLink: (link: PaymentLink) => void;
  updateLink: (id: string, patch: Partial<PaymentLink>) => void;
  removeLink: (id: string) => void;
  clear: () => void;
}

export const usePaymentLinksStore = create<PaymentLinksStore>()(
  persist(
    (set) => ({
      links: [],
      addLink: (link) => set((state) => ({ links: [link, ...state.links] })),
      updateLink: (id, patch) =>
        set((state) => ({
          links: state.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),
      removeLink: (id) =>
        set((state) => ({ links: state.links.filter((l) => l.id !== id) })),
      clear: () => set({ links: [] }),
    }),
    {
      name: "payment-links",
      version: 1,
      storage,
    },
  ),
);

/** A link is active until its 10-day window elapses. */
export function isLinkActive(link: PaymentLink): boolean {
  return Date.now() < link.expiresAt;
}

/** Only the links belonging to a given merchant (wallet). */
export function linksForMerchant(
  links: PaymentLink[],
  merchantAddress: string | null,
): PaymentLink[] {
  if (!merchantAddress) return [];
  return links.filter((l) => l.merchantAddress === merchantAddress);
}
