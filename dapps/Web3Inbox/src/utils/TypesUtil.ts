import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {NotifyClientTypes} from '@walletconnect/notify-client';

export type CaipAddress = `${string}:${string}:${string}`;

export type ThemeKeys =
  | 'accent-100'
  | 'accent-010'
  | 'accent-glass-090'
  | 'accent-glass-080'
  | 'accent-glass-050'
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
  | 'gray-glass-090';

export type SpacingType =
  | '0'
  | '4xs'
  | '3xs'
  | '2xs'
  | 'xs'
  | 's'
  | 'm'
  | 'l'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl';

export type TextType =
  | 'medium-title-400'
  | 'medium-title-500'
  | 'medium-title-600'
  | 'small-title-400'
  | 'small-title-500'
  | 'small-title-600'
  | 'large-400'
  | 'large-500'
  | 'large-600'
  | 'medium-400'
  | 'medium-500'
  | 'medium-600'
  | 'paragraph-400'
  | 'paragraph-500'
  | 'paragraph-600'
  | 'small-400'
  | 'small-500'
  | 'small-600'
  | 'tiny-400'
  | 'tiny-500'
  | 'tiny-600'
  | 'micro-600'
  | 'micro-700';

export type ColorType =
  | 'accent-100'
  | 'error-100'
  | 'fg-100'
  | 'fg-150'
  | 'fg-200'
  | 'fg-250'
  | 'fg-275'
  | 'fg-300'
  | 'inverse-000'
  | 'inverse-100'
  | 'success-100';

// Navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Connect: undefined;
  Home: NavigatorScreenParams<HomeTabParamList>;
  SubscriptionDetails: {
    topic: string;
    metadata: NotifyClientTypes.Metadata;
  };
  SubscriptionSettings: {topic: string};
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type HomeTabParamList = {
  Subscriptions: undefined;
  Discover: undefined;
  Settings: undefined;
};

export type HomeTabScreenProps<T extends keyof HomeTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<HomeTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;
