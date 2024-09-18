import {Platform} from 'react-native';

export const getMetadata = () => {
  return {
    name: 'AppKit + wagmi (internal)',
    description: 'AppKit + wagmi (internal)',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
    redirect: {
      native: 'w3mwagmisample-internal://',
      universal: 'https://dev.appkit-lab.reown.com/rn_appkit_internal',
      linkMode: true,
    },
  };
};

export const getCustomWallets = () => {
  const wallets = [
    {
      id: 'rn-wallet-internal',
      name: 'Wallet (RN internal)',
      image_url:
        'https://docs.walletconnect.com/assets/images/web3walletLogo-54d3b546146931ceaf47a3500868a73a.png',
      mobile_link: 'rn-web3wallet-internal://',
      link_mode: 'https://appkit-lab.reown.com/rn_walletkit_internal',
    },
    {
      id: 'flutter-wallet-internal',
      name: 'Wallet (Flutter internal)',
      image_url:
        'https://docs.walletconnect.com/assets/images/web3walletLogo-54d3b546146931ceaf47a3500868a73a.png',
      mobile_link: 'wcflutterwallet-internal://',
      link_mode: 'https://dev.appkit-lab.reown.com/flutter_walletkit_internal',
    },
  ];

  if (Platform.OS === 'android') {
    wallets.push({
      id: 'android-wallet-internal',
      name: 'Wallet(Android internal)',
      image_url:
        'https://docs.walletconnect.com/assets/images/web3walletLogo-54d3b546146931ceaf47a3500868a73a.png',
      mobile_link: 'kotlin-web3wallet://',
      link_mode:
        'https://web3modal-laboratory-git-chore-kotlin-assetlinks-walletconnect1.vercel.app/wallet_internal',
    });
  } else if (Platform.OS === 'ios') {
    wallets.push({
      id: 'ios-wallet',
      name: 'Wallet(iOS)',
      image_url:
        'https://docs.walletconnect.com/assets/images/web3walletLogo-54d3b546146931ceaf47a3500868a73a.png',
      mobile_link: 'walletapp://',
      link_mode: 'https://appkit-lab.reown.com/wallet',
    });
  }

  return wallets;
};
