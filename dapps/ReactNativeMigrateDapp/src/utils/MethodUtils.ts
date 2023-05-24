export const signMessage = async (provider: any, address: string) => {
  if (!provider) {
    throw new Error('Not connected');
  }

  // Draft Message Parameters
  const message = 'My email is john@doe.com';
  const msgParams = [message, address];

  const result = await provider.request({
    method: 'personal_sign',
    params: msgParams,
  });
  return JSON.stringify(result);
};
