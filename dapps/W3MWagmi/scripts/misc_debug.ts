import {Platform} from 'react-native';

export const getMetadata = () => {
  return {
    name: 'AppKit + wagmi (debug)',
    description: 'AppKit + wagmi (debug)',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
    redirect: {
      native: 'w3mwagmisample-debug://',
      universal: 'https://dev.appkit-lab.reown.com/rn_appkit_debug',
      linkMode: true,
    },
  };
};

export const getCustomWallets = () => {
  const wallets = [
    {
      id: 'rn-wallet-debug',
      name: 'Wallet (RN debug)',
      image_url:
        'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
      mobile_link: 'rn-web3wallet-debug://',
      link_mode: 'https://dev.appkit-lab.reown.com/rn_walletkit_debug',
    },
    {
      id: 'rn-wallet-internal',
      name: 'Wallet (RN internal)',
      image_url:
        'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
      mobile_link: 'rn-web3wallet-internal://',
      link_mode: 'https://dev.appkit-lab.reown.com/rn_walletkit_internal',
    },
    {
      id: 'flutter-wallet-internal',
      name: 'Wallet (Flutter internal)',
      image_url:
        'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
      mobile_link: 'wcflutterwallet-internal://',
      link_mode: 'https://dev.appkit-lab.reown.com/flutter_walletkit_internal',
    },
  ];

  if (Platform.OS === 'android') {
    wallets.push({
      id: 'android-wallet-internal',
      name: 'Wallet(Android internal)',
      image_url:
        'https://github.com/reown-com/reown-docs/blob/main/static/assets/home/walletkitLogo.png?raw=true',
      mobile_link: 'kotlin-web3wallet://',
      link_mode:
        'https://web3modal-laboratory-git-chore-kotlin-assetlinks-walletconnect1.vercel.app/wallet_internal',
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
