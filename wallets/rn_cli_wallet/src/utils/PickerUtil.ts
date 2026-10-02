import { SignClientTypes } from '@walletconnect/types';
import { buildApprovedNamespaces } from '@walletconnect/utils';

import LogStore from '@/store/LogStore';
import SettingsStore from '@/store/SettingsStore';
import { walletKit } from '@/utils/WalletKitUtil';
import { getWallet } from '@/utils/TonWalletUtil';
import { getSupportedChains } from '@/utils/HelperUtil';
import { ensureWalletsForChainIds } from '@/utils/WalletInitializationUtil';
import {
  buildSupportedNamespaces,
  filterNamespacesByChains,
  getCurrentWalletAddresses,
} from '@/utils/SupportedNamespacesUtil';
import { WALLET_GUIDE_ID } from '@/utils/misc';

/**
 * Explore (H2b): a curated directory of apps that auto-connect when opened
 * inside the wallet. DappBrowser injects the walletConnectHost bridge, the
 * app hands back a pairing URI ({type:'wc_session_offer', uri}), and the
 * resulting proposal is auto-approved with this wallet's wallet_guide_id.
 */

/**
 * Explore tile data — shaped like a future registry entry. Tiles open their
 * URL as-is: the auto-connect signal is the injected
 * walletConnectHost.autoConnect bridge flag (see DappBrowser), not a URL
 * parameter.
 */
export interface PickerDapp {
  id: string;
  name: string;
  chainLabel: string;
  description: string;
  color: string;
  glyph: string;
  url: string;
}

// Draft-PR preview deploys, until the app-side auto-connect ships to
// production: React App -> https://react-app.walletconnect.com (WCP4-185),
// Stake WCT -> https://app.walletconnect.com/stake (walletconnect-apps#508).
export const PICKER_DAPPS: PickerDapp[] = [
  {
    id: 'react-app',
    name: 'React App',
    chainLabel: 'Multichain',
    description: 'WalletConnect test app',
    color: '#61DAFB',
    glyph: 'R',
    url: 'https://react-dapp-v2-git-wcp4-185-react-app-host-auto-45784c-reown-com.vercel.app/',
  },
  {
    id: 'wc-stake',
    name: 'WalletConnect',
    chainLabel: 'Optimism',
    description: 'Stake WCT',
    color: '#0988F0',
    glyph: 'W',
    url: 'https://portal-git-feat-h2b-stake-auto-connect-poc-walletconnect.vercel.app/stake?_vercel_share=esDVgpyqZ03Gg6obtfqgsY154bMY7zZh',
  },
];

/**
 * `scheme://host[:port]`, lowercased, default port dropped — the same shape as
 * `window.location.origin`. Parsed by hand because the React Native URL
 * implementation doesn't support `origin`.
 */
export function getOrigin(url: string): string | undefined {
  const match = url.match(/^(https?):\/\/([^/?#]+)/i);
  if (!match) {
    return undefined;
  }
  const scheme = match[1].toLowerCase();
  // Drop any userinfo: the host of `https://a.com@b.com` is b.com.
  const host = match[2]
    .slice(match[2].lastIndexOf('@') + 1)
    .toLowerCase()
    .replace(scheme === 'https' ? /:443$/ : /:80$/, '');
  return `${scheme}://${host}`;
}

export function isSameOrigin(url: string, expectedOrigin: string): boolean {
  const origin = getOrigin(url);
  return !!origin && origin === expectedOrigin;
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
 * Session properties for an Explore auto-approval: the TON props every
 * approval carries, plus wallet_guide_id so the app's Universal Provider can
 * load this wallet's fee config. Only this path sets wallet_guide_id —
 * QR / deep-link approvals (SessionProposalModal) never do.
 */
export async function buildPickerSessionProperties(namespaces: {
  ton?: unknown;
}): Promise<Record<string, string>> {
  const sessionProperties: Record<string, string> = {};
  if (namespaces.ton) {
    const tonWallet = await getWallet();
    sessionProperties.ton_getPublicKey = tonWallet.getPublicKey();
    sessionProperties.ton_getStateInit = tonWallet.getStateInit();
  }
  sessionProperties.wallet_guide_id = WALLET_GUIDE_ID;
  return sessionProperties;
}

/**
 * Auto-approves a picker-initiated proposal with the same namespaces the
 * modal would approve when every supported chain is selected. Throws on
 * failure — the caller falls back to the normal proposal modal.
 */
export async function autoApprovePickerProposal(
  proposal: SignClientTypes.EventArguments['session_proposal'],
): Promise<void> {
  const chainIds = getSupportedChains(
    proposal.params.requiredNamespaces,
    proposal.params.optionalNamespaces,
  ).map(chain => `${chain.namespace}:${chain.chainId}`);
  if (chainIds.length === 0) {
    throw new Error('No supported chains in proposal');
  }
  // Signers restore lazily; make sure the requested ones are ready before
  // advertising their accounts.
  await ensureWalletsForChainIds(chainIds);
  const namespaces = buildApprovedNamespaces({
    proposal: proposal.params,
    supportedNamespaces: filterNamespacesByChains(
      buildSupportedNamespaces(
        SettingsStore.state.testNets,
        getCurrentWalletAddresses(),
      ),
      chainIds,
    ),
  });
  const sessionProperties = await buildPickerSessionProperties(namespaces);
  await walletKit.approveSession({
    id: proposal.id,
    namespaces,
    sessionProperties,
  });
  SettingsStore.setSessions(Object.values(walletKit.getActiveSessions()));
  LogStore.info('Picker session auto-approved', 'PickerUtil', 'autoApprove', {
    proposalId: proposal.id,
    proposer: proposal.params.proposer?.metadata?.name,
    walletGuideId: sessionProperties.wallet_guide_id,
  });
}
