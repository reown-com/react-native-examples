import {Linking, NativeModules, Platform} from 'react-native';

const {InstalledAppModule} = NativeModules;
const isAndroid = Platform.OS === 'android';

interface InstalledAppInterface {
  /**
   * Checks if an app is installed on the device by receiving Package name for Android (e.g. com.walletconnect.example)
   * or App Scheme for iOS (e.g. wc://)
   *
   * NOTE: As of iOS 9, your app needs to provide the LSApplicationQueriesSchemes key inside Info.plist.
   *
   * @param name - String representing the app name
   */
  isAppInstalled(name?: string): Promise<boolean>;
}

function isAppInstalled(name?: string): Promise<boolean> {
  if (!name) {
    return Promise.resolve(false);
  }

  if (isAndroid) {
    return InstalledAppModule.isAppInstalled(name);
  } else {
    return Linking.canOpenURL(name).catch(() => false);
  }
}

export default {isAppInstalled} as InstalledAppInterface;
