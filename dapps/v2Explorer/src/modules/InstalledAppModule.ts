/**
 * This exposes the native CalendarModule module as a JS module. This has a
 * function 'isAppInstalled' which takes the following parameter:
 *
 * 1. String name: A string representing the name of the app
 * For Android: package name is required (e.g. com.facebook.katana)
 * For iOS: scheme name is required (e.g. fb://) -> schemes need to be added to info.plist inside LSApplicationQueriesSchemes
 */
import {Linking, NativeModules, Platform} from 'react-native';

const {InstalledAppModule} = NativeModules;

interface InstalledAppInterface {
  isAppInstalled(name: string): Promise<boolean>;
}

function isAppInstalled(name: string): Promise<boolean> {
  const isAndroid = Platform.OS === 'android';
  if (isAndroid) {
    return InstalledAppModule.isAppInstalled(name);
  } else {
    return Linking.canOpenURL(name);
  }
}

export default {isAppInstalled} as InstalledAppInterface;
