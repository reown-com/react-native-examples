import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type ThemeKeys =
  // Background
  | 'bg-primary'
  | 'bg-invert'
  | 'bg-accent-primary'
  | 'bg-accent-certified'
  | 'bg-success'
  | 'bg-error'
  | 'bg-warning'
  // Text
  | 'text-primary'
  | 'text-secondary'
  | 'text-tertiary'
  | 'text-invert'
  | 'text-accent-primary'
  | 'text-accent-secondary'
  | 'text-success'
  | 'text-error'
  | 'text-warning'
  // Border
  | 'border-primary'
  | 'border-secondary'
  | 'border-accent-primary'
  | 'border-accent-secondary'
  | 'border-success'
  | 'border-error'
  | 'border-warning'
  // Foreground
  | 'foreground-primary'
  | 'foreground-secondary'
  | 'foreground-tertiary'
  | 'foreground-accent-primary-10'
  | 'foreground-accent-primary-40'
  | 'foreground-accent-primary-60'
  | 'foreground-accent-secondary-10'
  | 'foreground-accent-secondary-40'
  | 'foreground-accent-secondary-60'
  // Icon
  | 'icon-default'
  | 'icon-invert'
  | 'icon-accent-primary'
  | 'icon-accent-secondary'
  | 'icon-success'
  | 'icon-error'
  | 'icon-warning'
  // Others
  | 'white';

// Navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Onboarding: undefined;
  Home: NavigatorScreenParams<HomeTabParamList>;
  Scan: undefined;
  Logs: undefined;
  SecretPhrase: undefined;
};

export type HomeTabParamList = {
  Wallets: undefined;
  Connections?: { uri: string };
  Settings: undefined;
};

// Define screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type HomeTabScreenProps<T extends keyof HomeTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<HomeTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type Chain = {
  chainId: string;
  name: string;
  namespace: string;
  rpcUrl: string;
};


// Payment Modal Flow
export type Step =
  | 'loading'
  | 'collectData'
  | 'confirm'
  | 'confirming'
  | 'result';