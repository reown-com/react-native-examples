import AsyncStorage from '@react-native-async-storage/async-storage';


export const STORAGE_KEYS = {
  RECIPIENT_ADDRESS: 'recipient_address',
};

export const getItem = async (key: string) => {
  return await AsyncStorage.getItem(key);
};

export const setItem = async (key: string, value: string) => {
  return await AsyncStorage.setItem(key, value);
};

export const removeItem = async (key: string) => {
  return await AsyncStorage.removeItem(key);
};