package com.walletconnect.web3modal.rnsample;

import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

// This module will be added to the SDK in the future
public class InstalledAppModule extends ReactContextBaseJavaModule {

    public InstalledAppModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "InstalledAppModule";
    }

    @RequiresApi(api = Build.VERSION_CODES.TIRAMISU)
    @ReactMethod
    public void isAppInstalled(String packageName, Promise promise) {
        PackageManager packageManager = getReactApplicationContext().getPackageManager();

        try {
            if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(0));
            } else {
                packageManager.getPackageInfo(packageName, 0);
            }
            promise.resolve(true);
        } catch (PackageManager.NameNotFoundException e) {
            promise.resolve(false);
        }
    }
}
