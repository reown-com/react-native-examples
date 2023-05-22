import type {ethers} from 'ethers';

export interface FormattedRpcResponse {
  method: string;
  address: string;
  valid: boolean;
  result: string;
  error?: string;
}

export interface FormattedRpcError {
  method: string;
  error?: string;
}

export interface AccountAction {
  method: string;
  callback: (web3Provider?: ethers.providers.Web3Provider) => Promise<any>;
}

export interface RpcRequestParams {
  method: string;
  web3Provider: ethers.providers.Web3Provider;
}
