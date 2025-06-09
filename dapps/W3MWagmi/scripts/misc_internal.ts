export const getMetadata = () => {
  return {
    name: 'AppKit + wagmi (internal)',
    description: 'AppKit + wagmi (internal)',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
    redirect: {
      native: 'w3mwagmisample-internal://',
      universal: 'https://appkit-lab.reown.com/rn_appkit_internal',
      linkMode: true,
    },
  };
};

export const getCustomWallets = () => {
  const wallets = [
    {
      id: 'rn-wallet-internal',
      name: 'React Native Wallet',
      image_url: 'https://avatars.githubusercontent.com/u/179229932',
      mobile_link: 'rn-web3wallet-internal://',
      link_mode: 'https://appkit-lab.reown.com/rn_walletkit_internal',
    },
  ];

  return wallets;
};
