import { act, create, ReactTestRenderer } from 'react-test-renderer';
import type { ElementType } from 'react';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    'foreground-primary': '#f3f3f3',
    'foreground-tertiary': '#d0d0d0',
    'bg-invert': '#ffffff',
    'bg-primary': '#ffffff',
    'text-primary': '#202020',
    'icon-default': '#9a9a9a',
  }),
}));

jest.mock('@/components/Button', () => ({ Button: 'Button' }));
jest.mock('@/components/Text', () => ({ Text: 'Text' }));
jest.mock('@/components/Shimmer', () => ({ Shimmer: 'Shimmer' }));
jest.mock('@/assets/Copy', () => ({ __esModule: true, default: 'CopySvg' }));
jest.mock('@/utils/ClipboardUtil', () => ({
  setClipboardString: jest.fn(),
}));
jest.mock('@/utils/ToastUtil', () => ({ showToast: jest.fn() }));
jest.mock('@/utils/haptics', () => ({
  haptics: { copyAddress: jest.fn() },
}));
jest.mock('@/utils/PresetsUtil', () => ({
  PresetsUtil: {
    getChainDataById: () => ({ name: 'Ethereum' }),
    getChainIconById: () => null,
  },
}));

import { setClipboardString } from '../src/utils/ClipboardUtil';
import { TokenBalanceCard } from '../src/screens/Wallets/components/TokenBalanceCard';
import type { TokenBalance } from '../src/utils/BalanceTypes';

const balance: TokenBalance = {
  name: 'Ethereum',
  symbol: 'ETH',
  chainId: 'eip155:1',
  value: 0,
  price: 0,
  quantity: { decimals: '18', numeric: '1' },
};

const MockButton = 'Button' as unknown as ElementType;
const MockText = 'Text' as unknown as ElementType;
const MockShimmer = 'Shimmer' as unknown as ElementType;

describe('TokenBalanceCard wallet address state', () => {
  let renderer: ReactTestRenderer | undefined;

  afterEach(() => {
    if (renderer) {
      act(() => renderer?.unmount());
    }
    renderer = undefined;
    jest.clearAllMocks();
  });

  it('keeps the card disabled and renders a fixed-size skeleton while loading', () => {
    act(() => {
      renderer = create(
        <TokenBalanceCard
          balance={balance}
          walletAddress=""
          walletAddressStatus="loading"
        />,
      );
    });

    const button = renderer!.root.findByType(MockButton);
    const skeleton = renderer!.root.findByType(MockShimmer);

    expect(button.props.disabled).toBe(true);
    expect(button.props.accessibilityLabel).toBe('Ethereum address loading');
    expect(skeleton.props).toMatchObject({ width: 126, height: 16 });

    act(() => button.props.onPress());
    expect(setClipboardString).not.toHaveBeenCalled();
  });

  it('reveals and enables copying only when the address is ready', () => {
    const walletAddress = '0x1234567890abcdef';
    act(() => {
      renderer = create(
        <TokenBalanceCard
          balance={balance}
          walletAddress={walletAddress}
          walletAddressStatus="ready"
        />,
      );
    });

    const button = renderer!.root.findByType(MockButton);
    const textValues = renderer!.root
      .findAllByType(MockText)
      .map(node => node.props.children);

    expect(button.props.disabled).toBe(false);
    expect(textValues).toContain('0x1234...abcdef');
    expect(renderer!.root.findAllByType(MockShimmer)).toHaveLength(0);

    act(() => button.props.onPress());
    expect(setClipboardString).toHaveBeenCalledWith(walletAddress);
  });

  it('keeps the address slot geometry stable when the skeleton resolves', () => {
    act(() => {
      renderer = create(
        <TokenBalanceCard
          balance={balance}
          walletAddress=""
          walletAddressStatus="loading"
        />,
      );
    });
    const loadingSlotStyle = renderer!.root.findByProps({
      testID: 'wallet-address-slot',
    }).props.style;

    act(() => {
      renderer!.update(
        <TokenBalanceCard
          balance={balance}
          walletAddress="0x1234567890abcdef"
          walletAddressStatus="ready"
        />,
      );
    });
    const readySlotStyle = renderer!.root.findByProps({
      testID: 'wallet-address-slot',
    }).props.style;

    expect(readySlotStyle).toEqual(loadingSlotStyle);
    expect(readySlotStyle).toMatchObject({
      height: 20,
      justifyContent: 'center',
    });
  });

  it('shows a stable unavailable state instead of an endless skeleton', () => {
    act(() => {
      renderer = create(
        <TokenBalanceCard
          balance={balance}
          walletAddress=""
          walletAddressStatus="unavailable"
        />,
      );
    });

    const button = renderer!.root.findByType(MockButton);
    const textValues = renderer!.root
      .findAllByType(MockText)
      .map(node => node.props.children);

    expect(button.props.disabled).toBe(true);
    expect(textValues).toContain('Address unavailable');
    expect(renderer!.root.findAllByType(MockShimmer)).toHaveLength(0);
  });
});
