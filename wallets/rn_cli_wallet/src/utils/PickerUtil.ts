import { SignClientTypes } from '@walletconnect/types';
import { buildApprovedNamespaces } from '@walletconnect/utils';

import LogStore from '@/store/LogStore';
import SettingsStore from '@/store/SettingsStore';
import { walletKit } from '@/utils/WalletKitUtil';
import { eip155Addresses } from '@/utils/EIP155WalletUtil';
import { suiAddresses } from '@/utils/SuiWalletUtil';
import { getWallet, tonAddresses } from '@/utils/TonWalletUtil';
import { tronAddresses } from '@/utils/TronWalletUtil';
import { cantonAddresses } from '@/utils/CantonWalletUtil';
import { solanaAddresses } from '@/utils/SolanaWalletUtil';
import { bitcoinAddresses } from '@/utils/BitcoinWalletUtil';
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/constants/Eip155';
import { SUI_CHAINS, SUI_EVENTS, SUI_SIGNING_METHODS } from '@/constants/Sui';
import { TON_CHAINS, TON_SIGNING_METHODS } from '@/constants/Ton';
import { TRON_CHAINS, TRON_SIGNING_METHODS } from '@/constants/Tron';
import {
  CANTON_CHAINS,
  CANTON_SIGNING_METHODS,
  CANTON_EVENTS,
} from '@/constants/Canton';
import {
  SOLANA_CHAINS,
  SOLANA_EVENTS,
  SOLANA_SIGNING_METHODS,
} from '@/constants/Solana';
import {
  BIP122_CHAINS,
  BIP122_EVENTS,
  BIP122_SIGNING_METHODS,
} from '@/constants/Bitcoin';
import { ENV } from '@/utils/env';

/**
 * Dapp Picker POC (H2b): a curated Explore directory of fee-honoring dapps.
 * Every tile opens the Session Fees POC dapp in a webview with a different
 * default aggregator; the dapp hands back a WC pairing URI which we pair and
 * auto-approve (with wc_feeTerms attached) — the user lands connected.
 */

// Session-fees demo recipients (see web-examples SESSION-FEES-POC.md):
// - Solana: USDC ATA already initialized (Jupiter silently skips fees otherwise)
// - EVM: the address KyberSwap/Uniswap fees already accumulate on
const FEE_RECIPIENT_SOLANA =
  ENV.FEE_RECIPIENT_SOLANA || '9zYtGz2nuUMe8yb9EJNNWdh2MNgMjAoWFuNgzjDm2nua';
const FEE_RECIPIENT_EVM =
  ENV.FEE_RECIPIENT_EVM || '0x879d5d9f48391b07525453F00e6690F851048E46';
const FEE_BPS = Number(ENV.FEE_BPS || 50);

const PICKER_DAPP_BASE_URL =
  ENV.PICKER_DAPP_URL ||
  'https://react-dapp-v2-git-dapp-picker-poc-reown-com.vercel.app';

/**
 * Explore tile data — shaped like a future registry entry: a fee-honoring
 * dapp per aggregator. All four point at the same POC dapp with a different
 * default aggregator (the "picker illusion").
 */
export interface PickerDapp {
  id: string;
  name: string;
  chainLabel: string;
  description: string;
  color: string;
  glyph: string;
  aggregator: string;
}

export const PICKER_DAPPS: PickerDapp[] = [
  {
    id: 'jupiter',
    name: 'Jupiter',
    chainLabel: 'Solana',
    description: 'Swap SOL → USDC',
    color: '#14F195',
    glyph: '◎',
    aggregator: 'jupiter',
  },
  {
    id: 'oneinch',
    name: '1inch',
    chainLabel: 'Arbitrum',
    description: 'Swap ETH → USDC',
    color: '#627EEA',
    glyph: '🦄',
    aggregator: 'oneinch',
  },
  {
    id: 'kyberswap',
    name: 'KyberSwap',
    chainLabel: 'Arbitrum',
    description: 'Swap ETH → USDC',
    color: '#31CB9E',
    glyph: 'K',
    aggregator: 'kyberswap',
  },
  {
    id: 'uniswap',
    name: 'Uniswap',
    chainLabel: 'Arbitrum',
    description: 'Swap ETH → USDC',
    color: '#FC72FF',
    glyph: '🦄',
    aggregator: 'uniswap',
  },
];

export function buildPickerDappUrl(dapp: PickerDapp): string {
  const variant = SettingsStore.state.pickerHeadless ? 'headless' : 'provider';
  return `${PICKER_DAPP_BASE_URL}/?wc_auto=1&aggregator=${dapp.aggregator}&connect=${variant}`;
}

/**
 * Fee terms attached to every session this wallet approves — same shape the
 * Session Fees POC dapp already parses (helpers/feeTerms.ts).
 */
export function buildFeeTermsProperties(): Record<string, string> {
  return {
    wc_feeTerms: JSON.stringify({
      version: 1,
      feeRecipient: FEE_RECIPIENT_SOLANA,
      feeRecipientEip155: FEE_RECIPIENT_EVM,
      feeBps: FEE_BPS,
    }),
  };
}

// -------- picker-initiated pairing tracking --------
// Auto-approval applies ONLY to proposals arriving on pairings the Explore
// webview initiated; everything else keeps the normal consent modal.
const pickerPairingTopics = new Set<string>();

export function parsePairingTopic(uri: string): string | undefined {
  const match = uri.match(/^wc:([0-9a-fA-F]+)@/);
  return match?.[1];
}

export function registerPickerPairing(uri: string): void {
  const topic = parsePairingTopic(uri);
  if (topic) {
    pickerPairingTopics.add(topic);
    LogStore.info('Picker pairing registered', 'PickerUtil', 'register', {
      topic,
    });
  }
}

export function isPickerPairing(pairingTopic?: string): boolean {
  return !!pairingTopic && pickerPairingTopics.has(pairingTopic);
}

/**
 * The wallet's full supported-namespaces map — extracted from
 * SessionProposalModal so the picker auto-approve path approves exactly what
 * the modal would.
 */
export function buildSupportedNamespaces() {
  return {
    eip155: {
      chains: Object.keys(EIP155_CHAINS),
      methods: Object.values(EIP155_SIGNING_METHODS),
      events: ['accountsChanged', 'chainChanged'],
      accounts: Object.keys(EIP155_CHAINS).map(
        chain => `${chain}:${eip155Addresses[0]}`,
      ),
    },
    sui: {
      chains: Object.keys(SUI_CHAINS),
      methods: Object.values(SUI_SIGNING_METHODS),
      events: Object.values(SUI_EVENTS),
      accounts: Object.keys(SUI_CHAINS).map(
        chain => `${chain}:${suiAddresses[0]}`,
      ),
    },
    ton: {
      chains: Object.keys(TON_CHAINS),
      methods: Object.values(TON_SIGNING_METHODS),
      events: [] as string[],
      accounts: Object.keys(TON_CHAINS).map(
        chain => `${chain}:${tonAddresses[0]}`,
      ),
    },
    tron: {
      chains: Object.keys(TRON_CHAINS),
      methods: Object.values(TRON_SIGNING_METHODS),
      events: [] as string[],
      accounts: Object.keys(TRON_CHAINS).map(
        chain => `${chain}:${tronAddresses[0]}`,
      ),
    },
    canton: {
      chains: Object.keys(CANTON_CHAINS),
      methods: Object.values(CANTON_SIGNING_METHODS),
      events: Object.values(CANTON_EVENTS),
      accounts: Object.keys(CANTON_CHAINS).map(
        chain => `${chain}:${cantonAddresses[0]}`,
      ),
    },
    solana: {
      chains: Object.keys(SOLANA_CHAINS),
      methods: Object.values(SOLANA_SIGNING_METHODS),
      events: Object.values(SOLANA_EVENTS),
      accounts: solanaAddresses?.[0]
        ? Object.keys(SOLANA_CHAINS).map(
            chain => `${chain}:${solanaAddresses[0]}`,
          )
        : [],
    },
    bip122: {
      chains: Object.keys(BIP122_CHAINS),
      methods: Object.values(BIP122_SIGNING_METHODS),
      events: Object.values(BIP122_EVENTS),
      accounts: bitcoinAddresses?.[0]
        ? Object.keys(BIP122_CHAINS).flatMap(chain =>
            bitcoinAddresses.map(address => `${chain}:${address}`),
          )
        : [],
    },
  };
}

/**
 * Builds the sessionProperties every approval carries: TON props (existing
 * behavior) + wc_feeTerms (Session Fees / Dapp Picker POC).
 */
export async function buildSessionProperties(namespaces: {
  ton?: unknown;
}): Promise<Record<string, string>> {
  const sessionProperties: Record<string, string> = {
    ...buildFeeTermsProperties(),
  };
  if (namespaces.ton) {
    const tonWallet = await getWallet();
    sessionProperties.ton_getPublicKey = tonWallet.getPublicKey();
    sessionProperties.ton_getStateInit = tonWallet.getStateInit();
  }
  return sessionProperties;
}

/**
 * Auto-approves a picker-initiated proposal with the wallet's full supported
 * namespaces + fee terms. Throws on failure — the caller falls back to the
 * normal proposal modal.
 */
export async function autoApprovePickerProposal(
  proposal: SignClientTypes.EventArguments['session_proposal'],
): Promise<void> {
  const namespaces = buildApprovedNamespaces({
    proposal: proposal.params,
    supportedNamespaces: buildSupportedNamespaces(),
  });
  const sessionProperties = await buildSessionProperties(namespaces);
  await walletKit.approveSession({
    id: proposal.id,
    namespaces,
    sessionProperties,
  });
  SettingsStore.setSessions(Object.values(walletKit.getActiveSessions()));
  LogStore.info('Picker session auto-approved', 'PickerUtil', 'autoApprove', {
    proposalId: proposal.id,
    proposer: proposal.params.proposer?.metadata?.name,
  });
}
