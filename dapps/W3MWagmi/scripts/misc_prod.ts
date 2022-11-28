import {Platform} from 'react-native';

export const getMetadata = () => {
  return {
    name: 'AppKit + wagmi',
    description: 'AppKit + wagmi',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
    redirect: {
      native: 'w3mwagmisample://',
      universal: 'https://appkit-lab.reown.com/rn_appkit',
      linkMode: true,
    },
  };
};

export const getCustomWallets = () => {
  const wallets = [
    {
      id: 'rn-wallet',
      name: 'Wallet(RN)',
      image_url:
        'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
      mobile_link: 'rn-web3wallet://',
      link_mode: 'https://appkit-lab.reown.com/rn_walletkit',
    },
    {
      id: 'flutter-wallet',
      name: 'Wallet(Flutter)',
      image_url:
        'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
      mobile_link: 'wcflutterwallet://',
      link_mode: 'https://appkit-lab.reown.com/flutter_walletkit',
    },
  ];

  if (Platform.OS === 'android') {
    wallets.push({
      id: 'android-wallet',
      name: 'Wallet(Android)',
      image_url:
        'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
      mobile_link: 'kotlin-web3wallet://',
      link_mode: 'https://appkit-lab.reown.com/wallet_release',
    });
  } else if (Platform.OS === 'ios') {
    wallets.push({
      id: 'ios-wallet',
      name: 'Wallet(iOS)',
      image_url:
        'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
      mobile_link: 'walletapp://',
      link_mode: 'https://appkit-lab.reown.com/wallet',
    });
  }

  return wallets;
};
