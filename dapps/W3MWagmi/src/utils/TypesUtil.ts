import {
  NavigatorScreenParams,
  CompositeScreenProps,
} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
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
  | 'success-glass-020'
  | 'success-glass-015'
  | 'success-glass-010'
  | 'success-glass-005'
  | 'error-100'
  | 'error-glass-020'
  | 'error-glass-015'
  | 'error-glass-010'
  | 'error-glass-005'
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
  | 'gray-glass-090';

// Navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Home: NavigatorScreenParams<HomeTabParamList>; // Nested Navigator
  Logs: undefined;
};

export type HomeTabParamList = {
  ConnectionsScreen: undefined;
  SettingsScreen: undefined;
};

// Define screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type HomeTabScreenProps<T extends keyof HomeTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<HomeTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;
