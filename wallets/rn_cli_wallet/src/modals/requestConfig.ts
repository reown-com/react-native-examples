import { SignClientTypes } from '@walletconnect/types';
import bs58 from 'bs58';

import { getSignParamsMessage } from '@/utils/HelperUtil';
import {
  approveEIP155Request,
  rejectEIP155Request,
} from '@/utils/EIP155RequestHandlerUtil';
import {
  approveSolanaRequest,
  rejectSolanaRequest,
} from '@/utils/SolanaRequestHandlerUtil';
import {
  approveSuiRequest,
  rejectSuiRequest,
} from '@/utils/SuiRequestHandlerUtil';
import { getWallet as getSuiWallet } from '@/utils/SuiWalletUtil';
import {
  approveBitcoinRequest,
  rejectBitcoinRequest,
} from '@/utils/BitcoinRequestHandlerUtil';
import { bitcoinAddresses } from '@/utils/BitcoinWalletUtil';
import {
  approveTronRequest,
  rejectTronRequest,
} from '@/utils/TronRequestHandlerUtil';
import {
  approveCantonRequest,
  rejectCantonRequest,
} from '@/utils/CantonRequestHandlerUtil';
import { EIP155_SIGNING_METHODS } from '@/constants/Eip155';
import { SOLANA_SIGNING_METHODS } from '@/constants/Solana';
import { SUI_SIGNING_METHODS } from '@/constants/Sui';
import { BIP122_SIGNING_METHODS } from '@/constants/Bitcoin';
import { TRON_SIGNING_METHODS } from '@/constants/Tron';
import { CANTON_SIGNING_METHODS } from '@/constants/Canton';

/**
 * PoC — single source of truth for "simple" approve/reject session requests.
 *
 * Every method whose modal is just {header + AppInfoCard + NetworkInfoCard +
 * payload + approve/reject} is described here as data instead of a bespoke
 * ~150-line modal file. `SessionRequestModal` renders any of them.
 *
 * Adding a new method = one entry here + one case in its chain's
 * RequestHandlerUtil. No new modal file, no ModalStore union edit, no Modal.tsx
 * switch case.
 */

type RequestEvent = SignClientTypes.EventArguments['session_request'];
type WcRequest = RequestEvent['params']['request'];

// Handlers return a formatted JSON-RPC response (sync or async).
type HandlerFn = (event: RequestEvent) => Promise<any> | any;

// Defaults applied by SessionRequestModal when a config omits these fields, so
// entries only spell out what deviates from the common case.
export const DEFAULT_APPROVE_LABEL = 'Sign';
export const DEFAULT_APPROVE_ERROR_TITLE = 'Couldn’t complete request';
export const DEFAULT_REJECT_REDIRECT_ERROR = 'User rejected request';

export interface RequestConfig {
  /** Chain handler that signs/executes and returns the JSON-RPC response. */
  approve: HandlerFn;
  /** Chain handler that returns the USER_REJECTED JSON-RPC error. */
  reject: HandlerFn;
  /**
   * Header intention, e.g. "Sign a message for". String or method-derived.
   * Required (no default) on purpose: it's the most visible string in the
   * modal header, and most methods aren't message signing — forcing it keeps
   * a transaction from silently reading "Sign a message".
   */
  intention: string | ((request: WcRequest) => string);
  /** Primary button label. Defaults to "Sign". */
  approveLabel?: string;
  /**
   * Turns request params into the string shown in <Message />. Provide this
   * for synchronous payloads. For payloads that require async work (e.g.
   * decoding a BCS transaction via the wallet), use `resolvePayload` instead.
   */
  renderPayload?: (request: WcRequest) => string;
  /** Async variant of `renderPayload`; takes precedence when present. */
  resolvePayload?: (request: WcRequest) => Promise<string>;
  /**
   * Toast title shown if approve throws or the response carries an error.
   * Defaults to "Couldn’t complete request"; set a specific one for better UX.
   */
  approveErrorTitle?: string;
  /**
   * Error text passed to handleRedirect on reject. Defaults to
   * "User rejected request".
   */
  rejectRedirectError?: string;
  /**
   * When approve throws, also send the reject response so the dapp doesn't
   * hang waiting for a reply (Canton relies on this).
   */
  respondErrorOnApproveFailure?: boolean;
  /** Scope label used for LogStore entries. */
  logScope: string;
}

function decodeBase58Message(value: string): string {
  try {
    return Buffer.from(bs58.decode(value)).toString('utf8');
  } catch {
    return value;
  }
}

// Sui transactions arrive as a base64-encoded BCS blob; decode to JSON for
// display via the wallet helper.
async function resolveSuiTransaction(request: WcRequest): Promise<string> {
  const wallet = await getSuiWallet();
  const jsonTx = await wallet.getJsonTransactionFromBase64(
    request.params.transaction,
  );
  return jsonTx?.toString() ?? '';
}

// Bitcoin getAccountAddresses shows the payment (or ordinal) address the
// wallet is about to share, mirroring the old dedicated modal.
function renderBitcoinAddresses(request: WcRequest): string {
  const intentions = request.params?.intentions as string[] | undefined;
  const isOrdinal = intentions && intentions[0] === 'ordinal';
  const list = bitcoinAddresses
    ? isOrdinal
      ? [bitcoinAddresses[1]]
      : [bitcoinAddresses[0]]
    : [];
  return list.join('\n');
}

export const REQUEST_CONFIG: Record<string, RequestConfig> = {
  // ── EIP155 ────────────────────────────────────────────────────────────────
  [EIP155_SIGNING_METHODS.PERSONAL_SIGN]: {
    approve: approveEIP155Request,
    reject: rejectEIP155Request,
    intention: 'Sign a message for',
    renderPayload: request => getSignParamsMessage(request.params),
    approveErrorTitle: 'Couldn’t sign message',
    rejectRedirectError: 'User rejected signature request',
    logScope: 'SessionRequestModal:personal_sign',
  },
  [EIP155_SIGNING_METHODS.ETH_SIGN]: {
    approve: approveEIP155Request,
    reject: rejectEIP155Request,
    intention: 'Sign a message for',
    renderPayload: request => getSignParamsMessage(request.params),
    approveErrorTitle: 'Couldn’t sign message',
    rejectRedirectError: 'User rejected signature request',
    logScope: 'SessionRequestModal:eth_sign',
  },
  [EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA]: {
    approve: approveEIP155Request,
    reject: rejectEIP155Request,
    intention: 'Sign typed data for',
    renderPayload: request =>
      JSON.stringify(getSignParamsMessage(request.params), null, 2),
    approveErrorTitle: 'Couldn’t sign typed data',
    logScope: 'SessionRequestModal:eth_signTypedData',
  },
  [EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3]: {
    approve: approveEIP155Request,
    reject: rejectEIP155Request,
    intention: 'Sign typed data for',
    renderPayload: request =>
      JSON.stringify(getSignParamsMessage(request.params), null, 2),
    approveErrorTitle: 'Couldn’t sign typed data',
    logScope: 'SessionRequestModal:eth_signTypedData_v3',
  },
  [EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4]: {
    approve: approveEIP155Request,
    reject: rejectEIP155Request,
    intention: 'Sign typed data for',
    renderPayload: request =>
      JSON.stringify(getSignParamsMessage(request.params), null, 2),
    approveErrorTitle: 'Couldn’t sign typed data',
    logScope: 'SessionRequestModal:eth_signTypedData_v4',
  },
  [EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION]: {
    approve: approveEIP155Request,
    reject: rejectEIP155Request,
    intention: 'Send a transaction for',
    approveLabel: 'Send',
    renderPayload: request => JSON.stringify(request.params[0], null, 2),
    approveErrorTitle: 'Couldn’t send transaction',
    logScope: 'SessionRequestModal:eth_sendTransaction',
  },
  [EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION]: {
    approve: approveEIP155Request,
    reject: rejectEIP155Request,
    intention: 'Send a transaction for',
    approveLabel: 'Send',
    renderPayload: request => JSON.stringify(request.params[0], null, 2),
    approveErrorTitle: 'Couldn’t send transaction',
    logScope: 'SessionRequestModal:eth_signTransaction',
  },

  // ── Solana ──────────────────────────────────────────────────────────────
  [SOLANA_SIGNING_METHODS.SOLANA_SIGN_MESSAGE]: {
    approve: approveSolanaRequest,
    reject: rejectSolanaRequest,
    intention: 'Sign a message for',
    renderPayload: request => decodeBase58Message(request.params?.message || ''),
    approveErrorTitle: 'Couldn’t sign message',
    rejectRedirectError: 'User rejected Solana message request',
    logScope: 'SessionRequestModal:solana_signMessage',
  },
  [SOLANA_SIGNING_METHODS.SOLANA_SIGN_TRANSACTION]: {
    approve: approveSolanaRequest,
    reject: rejectSolanaRequest,
    intention: 'Sign a transaction for',
    renderPayload: request => JSON.stringify(request.params, null, 2),
    approveErrorTitle: 'Couldn’t sign transaction',
    rejectRedirectError: 'User rejected Solana transaction request',
    logScope: 'SessionRequestModal:solana_signTransaction',
  },
  [SOLANA_SIGNING_METHODS.SOLANA_SIGN_ALL_TRANSACTIONS]: {
    approve: approveSolanaRequest,
    reject: rejectSolanaRequest,
    intention: 'Sign a transaction for',
    renderPayload: request => JSON.stringify(request.params, null, 2),
    approveErrorTitle: 'Couldn’t sign transaction',
    rejectRedirectError: 'User rejected Solana transaction request',
    logScope: 'SessionRequestModal:solana_signAllTransactions',
  },
  [SOLANA_SIGNING_METHODS.SOLANA_SIGN_AND_SEND_TRANSACTION]: {
    approve: approveSolanaRequest,
    reject: rejectSolanaRequest,
    intention: 'Sign & send a transaction for',
    renderPayload: request => JSON.stringify(request.params, null, 2),
    approveErrorTitle: 'Couldn’t sign transaction',
    rejectRedirectError: 'User rejected Solana transaction request',
    logScope: 'SessionRequestModal:solana_signAndSendTransaction',
  },

  // ── Sui ─────────────────────────────────────────────────────────────────
  [SUI_SIGNING_METHODS.SUI_SIGN_PERSONAL_MESSAGE]: {
    approve: approveSuiRequest,
    reject: rejectSuiRequest,
    intention: 'Sign a message for',
    renderPayload: request => request.params?.message || '',
    approveErrorTitle: 'Couldn’t sign message',
    rejectRedirectError: 'User rejected personal message request',
    logScope: 'SessionRequestModal:sui_signPersonalMessage',
  },
  [SUI_SIGNING_METHODS.SUI_SIGN_TRANSACTION]: {
    approve: approveSuiRequest,
    reject: rejectSuiRequest,
    intention: 'Sign a transaction for',
    resolvePayload: resolveSuiTransaction,
    approveErrorTitle: 'Couldn’t sign transaction',
    rejectRedirectError: 'User rejected transaction request',
    logScope: 'SessionRequestModal:sui_signTransaction',
  },
  [SUI_SIGNING_METHODS.SUI_SIGN_AND_EXECUTE_TRANSACTION]: {
    approve: approveSuiRequest,
    reject: rejectSuiRequest,
    intention: 'Sign & execute a transaction for',
    resolvePayload: resolveSuiTransaction,
    approveErrorTitle: 'Couldn’t execute transaction',
    rejectRedirectError: 'User rejected transaction request',
    logScope: 'SessionRequestModal:sui_signAndExecuteTransaction',
  },

  // ── Bitcoin (BIP122) ──────────────────────────────────────────────────────
  [BIP122_SIGNING_METHODS.BIP122_SIGN_MESSAGE]: {
    approve: approveBitcoinRequest,
    reject: rejectBitcoinRequest,
    intention: 'Sign a message for',
    renderPayload: request => request.params?.message || '',
    approveErrorTitle: 'Couldn’t sign message',
    rejectRedirectError: 'User rejected Bitcoin message request',
    logScope: 'SessionRequestModal:bip122_signMessage',
  },
  [BIP122_SIGNING_METHODS.BIP122_SEND_TRANSACTION]: {
    approve: approveBitcoinRequest,
    reject: rejectBitcoinRequest,
    intention: 'Sign & send a transaction for',
    renderPayload: request => JSON.stringify(request.params, null, 2),
    approveErrorTitle: 'Couldn’t sign transaction',
    rejectRedirectError: 'User rejected Bitcoin transaction request',
    logScope: 'SessionRequestModal:bip122_sendTransfer',
  },
  [BIP122_SIGNING_METHODS.BIP122_SIGN_PSBT]: {
    approve: approveBitcoinRequest,
    reject: rejectBitcoinRequest,
    intention: 'Sign a transaction for',
    renderPayload: request => JSON.stringify(request.params, null, 2),
    approveErrorTitle: 'Couldn’t sign transaction',
    rejectRedirectError: 'User rejected Bitcoin transaction request',
    logScope: 'SessionRequestModal:bip122_signPsbt',
  },
  [BIP122_SIGNING_METHODS.BIP122_GET_ACCOUNT_ADDRESSES]: {
    approve: approveBitcoinRequest,
    reject: rejectBitcoinRequest,
    intention: 'Share your addresses with',
    approveLabel: 'Share',
    renderPayload: renderBitcoinAddresses,
    approveErrorTitle: 'Couldn’t share addresses',
    rejectRedirectError: 'User rejected Bitcoin addresses request',
    logScope: 'SessionRequestModal:bip122_getAccountAddresses',
  },

  // ── Tron ──────────────────────────────────────────────────────────────────
  // Note: the original single Tron modal used the "Sign a message for"
  // intention for all three methods; preserved here to avoid a copy change.
  [TRON_SIGNING_METHODS.TRON_SIGN_MESSAGE]: {
    approve: approveTronRequest,
    reject: rejectTronRequest,
    intention: 'Sign a message for',
    renderPayload: request => JSON.stringify(request.params, null, 2),
    logScope: 'SessionRequestModal:tron_signMessage',
  },
  [TRON_SIGNING_METHODS.TRON_SIGN_TRANSACTION]: {
    approve: approveTronRequest,
    reject: rejectTronRequest,
    intention: 'Sign a message for',
    renderPayload: request => JSON.stringify(request.params, null, 2),
    logScope: 'SessionRequestModal:tron_signTransaction',
  },
  [TRON_SIGNING_METHODS.TRON_SEND_TRANSACTION]: {
    approve: approveTronRequest,
    reject: rejectTronRequest,
    intention: 'Sign a message for',
    renderPayload: request => JSON.stringify(request.params, null, 2),
    logScope: 'SessionRequestModal:tron_sendTransaction',
  },

  // ── Canton (sensitive methods; read-only ones auto-approve in the event
  //    manager and are intentionally NOT listed here) ─────────────────────────
  [CANTON_SIGNING_METHODS.SIGN_MESSAGE]: {
    approve: approveCantonRequest,
    reject: rejectCantonRequest,
    intention: 'Handle a Canton request for',
    renderPayload: request => JSON.stringify(request.params, null, 2),
    respondErrorOnApproveFailure: true,
    logScope: 'SessionRequestModal:canton_signMessage',
  },
  [CANTON_SIGNING_METHODS.PREPARE_SIGN_EXECUTE]: {
    approve: approveCantonRequest,
    reject: rejectCantonRequest,
    intention: 'Handle a Canton request for',
    renderPayload: request => JSON.stringify(request.params, null, 2),
    respondErrorOnApproveFailure: true,
    logScope: 'SessionRequestModal:canton_prepareSignExecute',
  },
};

export function getRequestConfig(method?: string): RequestConfig | undefined {
  return method ? REQUEST_CONFIG[method] : undefined;
}
