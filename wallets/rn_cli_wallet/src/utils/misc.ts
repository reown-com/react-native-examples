export const getMetadata = () => {
  return {
    name: 'React Native Wallet Example',
    description: 'React Native WalletKit for Reown',
    url: 'https://reown.com/walletkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
    redirect: {
      native: 'rn-web3wallet://',
      universal: 'https://dev.appkit-lab.reown.com/rn_walletkit',
      linkMode: true,
    },
  };
};
