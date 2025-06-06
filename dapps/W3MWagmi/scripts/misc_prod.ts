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
      id: 'phantom-wallet',
      name: 'Phantom',
      image_url: 'https://avatars.githubusercontent.com/u/124594793?s=200&v=4',
      mobile_link: 'phantom://',
  }];

  return wallets;
};
