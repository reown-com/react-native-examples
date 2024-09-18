export const getMetadata = () => {
  return {
    name: 'React Native Wallet Example',
    description: 'React Native WalletKit by Reown',
    url: 'https://reown.com/',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
    redirect: {
      native: 'rn-web3wallet-debug://',
      universal: 'https://appkit-lab.reown.com/rn_walletkit_debug',
      linkMode: true,
    },
  };
};
