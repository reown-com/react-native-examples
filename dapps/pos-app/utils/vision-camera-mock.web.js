// Mock implementation of react-native-vision-camera for web
export const Camera = () => null;
export const useCameraDevice = () => null;
export const useCameraPermission = () => ({
  hasPermission: false,
  requestPermission: async () => false,
});
export const useCodeScanner = () => ({});
export const Code = {};
