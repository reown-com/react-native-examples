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
      name: 'React Native Wallet',
      image_url: 'https://avatars.githubusercontent.com/u/179229932',
      mobile_link: 'rn-web3wallet://',
      link_mode: 'https://appkit-lab.reown.com/rn_walletkit',
    },
  ];

  return wallets;
};
