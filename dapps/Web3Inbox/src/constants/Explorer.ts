export const EXPLORER_API_BASE_URL = 'https://explorer-api.walletconnect.com';

export const EXPLORER_ENDPOINTS = {
  projects: '/w3i/v1/projects',
  notifyConfig: '/w3i/v1/notify-config',
};

export type ProjectItem = {
  id: string;
  name: string;
  description: string;
  dapp_url: string;
  image_url: {
    sm: string;
    md: string;
    lg: string;
  };
};
