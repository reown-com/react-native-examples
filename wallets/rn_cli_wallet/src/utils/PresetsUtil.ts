import {ImageSourcePropType} from 'react-native';
import { TON_CHAINS, TON_NETWORKS_IMAGES } from '@/constants/Ton';
import { SUI_CHAINS, SUI_NETWORKS_IMAGES } from '@/constants/Sui';
import { EIP155_CHAINS, EIP155_NETWORK_IMAGES } from '@/constants/Eip155';


const NetworkImages: Record<string, ImageSourcePropType> = {
  ...EIP155_NETWORK_IMAGES,
  ...SUI_NETWORKS_IMAGES,
  ...TON_NETWORKS_IMAGES,
};


export const ALL_CHAINS = {
  ...EIP155_CHAINS,
  ...SUI_CHAINS,
  ...TON_CHAINS,
};

export const PresetsUtil = {
  getChainLogo: (chainId: string | number) => {
    const logo = NetworkImages[chainId];
    if (!logo) {
      return undefined;
    }
    return logo;
  },
  getChainData: (chainId?: string) => {
    if (!chainId) return
    const [namespace, reference] = chainId.toString().split(':')
    return Object.values(ALL_CHAINS).find(
      chain => chain.chainId === reference && chain.namespace === namespace
    )
  }
};
