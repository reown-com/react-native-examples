import { SignClientTypes } from '@walletconnect/types';
import { parseUri } from '@walletconnect/utils';

import LogStore from '@/store/LogStore';
import { approveSessionProposal } from '@/utils/SessionProposalUtil';
import { WALLET_GUIDE_ID } from '@/utils/misc';

/**
 * Explore (H2b): a curated directory of apps that auto-connect when opened
 * inside the wallet. AppBrowser injects the walletConnectHost bridge, the
 * app hands back a pairing URI ({type:'wc_session_offer', uri}), and the
 * resulting proposal is auto-approved with this wallet's wallet_guide_id.
 */

/**
 * Explore tile data — shaped like a future registry entry. Tiles open their
 * URL as-is: the auto-connect signal is the injected
 * walletConnectHost.autoConnect bridge flag (see AppBrowser), not a URL
 * parameter.
 */
export interface ExploreApp {
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
// AppKit Lab -> https://appkit-lab.reown.com (WCP4-188),
// Stake WCT -> https://app.walletconnect.com/stake (walletconnect-apps#508).
export const EXPLORE_APPS: ExploreApp[] = [
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
    id: 'appkit-lab',
    name: 'AppKit Lab',
    chainLabel: 'Multichain',
    description: 'AppKit test app',
    color: '#202020',
    glyph: 'A',
    url: 'https://appkit-laboratory-git-wcp4-188-appkit-host-launch-reown-com.vercel.app/',
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

// -------- Explore-initiated pairing tracking --------
// Auto-approval applies ONLY to proposals arriving on pairings the Explore
// webview initiated; everything else keeps the normal consent modal.
const explorePairingTopics = new Set<string>();

export function registerExplorePairing(uri: string): void {
  const { topic } = parseUri(uri);
  if (topic) {
    explorePairingTopics.add(topic);
    LogStore.info('Explore pairing registered', 'ExploreUtil', 'register', {
      topic,
    });
  }
}

export function isExplorePairing(pairingTopic?: string): boolean {
  return !!pairingTopic && explorePairingTopics.has(pairingTopic);
}

/**
 * Auto-approves an Explore-initiated proposal with every supported chain, the
 * same namespaces the modal approves by default, plus wallet_guide_id so the
 * app's Universal Provider can load this wallet's fee config. Only this path
 * sets wallet_guide_id; QR / deep-link approvals (SessionProposalModal) never
 * do. Throws on failure; the caller falls back to the normal proposal modal.
 */
export async function autoApproveExploreProposal(
  proposal: SignClientTypes.EventArguments['session_proposal'],
  chainIds: string[],
): Promise<void> {
  await approveSessionProposal(proposal, chainIds, {
    wallet_guide_id: WALLET_GUIDE_ID,
  });
  LogStore.info('Explore session auto-approved', 'ExploreUtil', 'autoApprove', {
    proposalId: proposal.id,
    proposer: proposal.params.proposer?.metadata?.name,
  });
}
