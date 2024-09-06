import {NavigatorScreenParams} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {CompositeScreenProps} from '@react-navigation/native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

export type ThemeKeys =
  | 'accent-100'
  | 'accent-090'
  | 'accent-020'
  | 'accent-glass-090'
  | 'accent-glass-080'
  | 'accent-glass-020'
  | 'accent-glass-015'
  | 'accent-glass-010'
  | 'accent-glass-005'
  | 'accent-glass-002'
  | 'fg-100'
  | 'fg-125'
  | 'fg-150'
  | 'fg-175'
  | 'fg-200'
  | 'fg-225'
  | 'fg-250'
  | 'fg-275'
  | 'fg-300'
  | 'bg-100'
  | 'bg-125'
  | 'bg-150'
  | 'bg-175'
  | 'bg-200'
  | 'bg-225'
  | 'bg-250'
  | 'bg-275'
  | 'bg-300'
  | 'inverse-100'
  | 'inverse-000'
  | 'success-100'
  | 'error-100'
  | 'gray-glass-001'
  | 'gray-glass-002'
  | 'gray-glass-005'
  | 'gray-glass-010'
  | 'gray-glass-015'
  | 'gray-glass-020'
  | 'gray-glass-025'
  | 'gray-glass-030'
  | 'gray-glass-060'
  | 'gray-glass-080'
  | 'gray-glass-090'
  | 'verify-unknown'
  | 'verify-invalid'
  | 'bg-verify-unknown'
  | 'bg-verify-invalid';

// Navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Onboarding: undefined;
  Home: NavigatorScreenParams<HomeTabParamList>; // Nested Navigator
  SessionDetail: {topic: string};
  Scan: undefined;
  Logs: undefined;
};

export type HomeTabParamList = {
  ConnectionsStack: NavigatorScreenParams<ConnectionsStackParamList>;
  SettingsStack: NavigatorScreenParams<SettingsStackParamList>;
};

export type ConnectionsStackParamList = {
  Connections?: {uri: string};
};

export type SettingsStackParamList = {
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

export type ConnectionsStackScreenProps<
  T extends keyof ConnectionsStackParamList,
> = CompositeScreenProps<
  StackScreenProps<ConnectionsStackParamList, T>,
  HomeTabScreenProps<keyof HomeTabParamList>
>;

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    StackScreenProps<SettingsStackParamList, T>,
    HomeTabScreenProps<keyof HomeTabParamList>
  >;

export type Chain = {
  id: number;
  network: string;
  name: string;
  nativeCurrency: {name: string; symbol: string; decimals: number};
  rpcUrl: string;
  blockExplorer: string;
};
