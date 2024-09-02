import {Platform} from 'react-native';

export const getCustomWallets = () => {
  const wallets = [
    {
      id: 'rn-wallet',
      name: 'Wallet(RN)',
      image_url:
        'https://docs.walletconnect.com/assets/images/web3walletLogo-54d3b546146931ceaf47a3500868a73a.png',
      mobile_link: 'rn-web3wallet://',
      link_mode: 'https://lab.web3modal.com/rn_walletkit',
    },
    {
      id: 'flutter-wallet',
      name: 'Wallet(Flutter)',
      image_url:
        'https://docs.walletconnect.com/assets/images/web3walletLogo-54d3b546146931ceaf47a3500868a73a.png',
      mobile_link: 'wcflutterwallet://',
      link_mode: undefined,
    },
    {
      id: 'flutter-wallet',
      name: 'Wallet(Flutter internal)',
      image_url:
        'https://docs.walletconnect.com/assets/images/web3walletLogo-54d3b546146931ceaf47a3500868a73a.png',
      mobile_link: 'wcflutterwallet-internal://',
      link_mode: 'https://dev.lab.web3modal.com/flutter_walletkit_internal',
    },
  ];

  if (Platform.OS === 'android') {
    wallets.push({
      id: 'android-wallet',
      name: 'Wallet(Android)',
      image_url:
        'https://docs.walletconnect.com/assets/images/web3walletLogo-54d3b546146931ceaf47a3500868a73a.png',
      mobile_link: 'kotlin-web3wallet://',
      link_mode:
        'https://web3modal-laboratory-git-chore-kotlin-assetlinks-walletconnect1.vercel.app/wallet',
    });
    wallets.push({
      id: 'android-wallet',
      name: 'Wallet(Android)',
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
      link_mode: 'https://lab.web3modal.com/wallet',
    });
  }

  return wallets;
};
