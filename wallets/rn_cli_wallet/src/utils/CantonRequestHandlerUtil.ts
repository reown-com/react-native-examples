import { CANTON_SIGNING_METHODS } from '@/constants/Canton';
import { getWallet } from '@/utils/CantonWalletUtil';
import LogStore, { serializeError } from '@/store/LogStore';
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';

export async function approveCantonRequest(
  requestEvent: SignClientTypes.EventArguments['session_request'],
) {
  const { params, id } = requestEvent;
  const { request, chainId } = params;
  const networkId = chainId ?? 'canton:devnet';

  try {
    const wallet = getWallet();

    if (!wallet) {
      throw new Error('Canton wallet not initialized');
    }

    switch (request.method) {
      case CANTON_SIGNING_METHODS.LIST_ACCOUNTS:
        return formatJsonRpcResult(id, [
          {
            primary: true,
            partyId: wallet.getPartyId(),
            status: 'allocated',
            hint: 'operator',
            publicKey: wallet.getPublicKeyBase64(),
            namespace: wallet.getNamespace(),
            networkId,
            signingProviderId: 'participant',
            disabled: false,
          },
        ]);

      case CANTON_SIGNING_METHODS.GET_PRIMARY_ACCOUNT:
        return formatJsonRpcResult(id, {
          primary: true,
          partyId: wallet.getPartyId(),
          status: 'allocated',
          hint: 'operator',
          publicKey: wallet.getPublicKeyBase64(),
          namespace: wallet.getNamespace(),
          networkId,
          signingProviderId: 'participant',
        });

      case CANTON_SIGNING_METHODS.GET_ACTIVE_NETWORK:
        return formatJsonRpcResult(id, {
          networkId,
          ledgerApi: 'http://127.0.0.1:5003',
        });

      case CANTON_SIGNING_METHODS.STATUS:
        return formatJsonRpcResult(id, {
          provider: {
            id: 'remote-da',
            version: '3.4.0',
            providerType: 'remote',
          },
          connection: {
            isConnected: true,
            isNetworkConnected: true,
          },
          network: {
            networkId,
            ledgerApi: 'http://127.0.0.1:5003',
          },
        });

      case CANTON_SIGNING_METHODS.LEDGER_API: {
        const { resource } = request.params as {
          requestMethod: string;
          resource: string;
        };
        if (resource === '/v2/version') {
          return formatJsonRpcResult(id, {
            response: JSON.stringify({ version: '3.4.0', features: {} }),
          });
        }
        return formatJsonRpcResult(id, {
          response: JSON.stringify({ mock: true, resource }),
        });
      }

      case CANTON_SIGNING_METHODS.SIGN_MESSAGE: {
        const { message } = request.params as { message: string };
        const signature = wallet.signMessage(message);
        return formatJsonRpcResult(id, {
          signature,
          publicKey: wallet.getPublicKeyBase64(),
        });
      }

      case CANTON_SIGNING_METHODS.PREPARE_SIGN_EXECUTE: {
        const { commandId } = request.params as { commandId?: string };
        return formatJsonRpcResult(id, {
          status: 'executed',
          commandId: commandId || `mock-command-id-${Date.now()}`,
          payload: {
            updateId: 'mock-tx-update-id',
            completionOffset: 42,
          },
        });
      }

      default:
        throw new Error(getSdkError('INVALID_METHOD').message);
    }
  } catch (error) {
    LogStore.error(
      `Canton request approval failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      'CantonRequestHandler',
      'approveCantonRequest',
      { error: serializeError(error) },
    );
    throw new Error(
      `Failed to approve Canton request: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
}

export function rejectCantonRequest(
  request: SignClientTypes.EventArguments['session_request'],
) {
  const { id } = request;

  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
}
