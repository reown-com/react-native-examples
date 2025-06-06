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
      id: 'phantom-wallet',
      name: 'Phantom',
      image_url: 'https://avatars.githubusercontent.com/u/124594793?s=200&v=4',
      mobile_link: 'phantom://',
  }];

  return wallets;
};
