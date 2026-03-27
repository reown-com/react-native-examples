import { ImageSourcePropType } from 'react-native';
import { TON_CHAINS, TON_NETWORKS_IMAGES } from '@/constants/Ton';
import { SUI_CHAINS, SUI_NETWORKS_IMAGES } from '@/constants/Sui';
import { EIP155_CHAINS, EIP155_NETWORK_IMAGES } from '@/constants/Eip155';
import { TRON_CHAINS, TRON_NETWORKS_IMAGES } from '@/constants/Tron';

const NetworkImages: Record<string, ImageSourcePropType> = {
  ...EIP155_NETWORK_IMAGES,
  ...SUI_NETWORKS_IMAGES,
  ...TON_NETWORKS_IMAGES,
  ...TRON_NETWORKS_IMAGES,
};

export const ALL_CHAINS = {
  ...EIP155_CHAINS,
  ...SUI_CHAINS,
  ...TON_CHAINS,
  ...TRON_CHAINS,
};

export const PresetsUtil = {
  getChainIconById: (chainId: string | number) => {
    const logo = NetworkImages[chainId];
    if (!logo) {
      return undefined;
    }
    return logo;
  },
  getIconLogoByName: (name?: string) => {
    if (!name) {
      return undefined;
    }

    const chainData = Object.values(ALL_CHAINS).find(
      chain => chain.name?.toLowerCase() === name.toLowerCase(),
    );

    const chainId = `${chainData?.namespace}:${chainData?.chainId}`;
    if (!chainId) {
      return undefined;
    }

    const logo = NetworkImages[chainId];
    if (!logo) {
      return undefined;
    }

    return logo;
  },
  getChainDataById: (chainId?: string) => {
    if (!chainId) return;
    const [namespace, reference] = chainId.toString().split(':');
    return Object.values(ALL_CHAINS).find(
      chain => chain.chainId === reference && chain.namespace === namespace,
    );
  },
};
