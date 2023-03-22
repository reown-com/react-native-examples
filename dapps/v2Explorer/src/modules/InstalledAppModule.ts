import {Linking, NativeModules, Platform} from 'react-native';

const {InstalledAppModule} = NativeModules;
const isAndroid = Platform.OS === 'android';

interface InstalledAppInterface {
  /**
   * Checks if an app is installed on the device by receiving the applicationId for Android (e.g. com.walletconnect.example)
   * or App Scheme for iOS (e.g. wc://)
   *
   * NOTE: As of iOS 9, your app needs to provide the LSApplicationQueriesSchemes key inside Info.plist.
   *
   * @param id - String representing the appId or scheme
   */
  isAppInstalled(id?: string | null): Promise<boolean>;
}

function isAppInstalled(id?: string | null): Promise<boolean> {
  if (!id) {
    return Promise.resolve(false);
  }

  if (isAndroid) {
    return InstalledAppModule.isAppInstalled(id);
  } else {
    return Linking.canOpenURL(id).catch(() => false);
  }
}

export default {isAppInstalled} as InstalledAppInterface;
