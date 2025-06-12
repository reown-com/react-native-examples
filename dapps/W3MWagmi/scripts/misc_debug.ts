export const getMetadata = () => {
  return {
    name: 'AppKit + wagmi (debug)',
    description: 'AppKit + wagmi (debug)',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
    redirect: {
      native: 'w3mwagmisample-debug://',
      universal: 'https://appkit-lab.reown.com/rn_appkit_debug',
      linkMode: true,
    },
  };
};

export const getCustomWallets = () => {
  const wallets = [
    {
      id: 'rn-wallet-debug',
      name: 'React Native Wallet (debug)',
      image_url: 'https://avatars.githubusercontent.com/u/179229932',
      mobile_link: 'rn-web3wallet-debug://',
      link_mode: 'https://appkit-lab.reown.com/rn_walletkit_debug',
    },
    {
      id: 'rn-wallet-internal',
      name: 'React Native Wallet (internal)',
      image_url: 'https://avatars.githubusercontent.com/u/179229932',
      mobile_link: 'rn-web3wallet-internal://',
      link_mode: 'https://appkit-lab.reown.com/rn_walletkit_internal',
    },
  ];

  return wallets;
};
