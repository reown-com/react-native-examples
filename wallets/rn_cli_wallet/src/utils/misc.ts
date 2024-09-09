export const getMetadata = () => {
  return {
    name: 'React Native Wallet Example',
    description: 'React Native Wallet for WalletConnect',
    url: 'https://walletconnect.com/',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
    redirect: {
      native: 'rn-web3wallet://',
      universal: 'https://dev.lab.web3modal.com/rn_walletkit',
      linkMode: true,
    },
  };
};
