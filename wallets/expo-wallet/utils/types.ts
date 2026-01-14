import { ImageSourcePropType } from 'react-native';

export type Chain = {
  chainId: string;
  name: string;
  namespace: string;
  rpcUrl: string;
  icon: ImageSourcePropType;
};
