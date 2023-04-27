package com.rn_cli_wallet;

import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.provider.Settings;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

import java.util.List;

public class BackgroundServiceModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private static final String MODULE_NAME = "BackgroundServiceModule";

    public BackgroundServiceModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void getPhoneID(Promise response) {
        try {
            @SuppressLint("HardwareIds") String id = Settings.Secure.getString(reactContext.getContentResolver(), Settings.Secure.ANDROID_ID);
            response.resolve(id);
        } catch (Exception e) {
            response.reject("Error", e);
        }
    }

    public boolean isDecryptionBackgroundServiceRunning() {
        ActivityManager manager = (ActivityManager) reactContext.getSystemService(Context.ACTIVITY_SERVICE);
        List<ActivityManager.RunningServiceInfo> runningServices = manager.getRunningServices(Integer.MAX_VALUE);
        for (ActivityManager.RunningServiceInfo service : runningServices) {
            if (DecryptionBackgroundService.class.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }

    @ReactMethod
    public void startService(Promise response) {
        if (isDecryptionBackgroundServiceRunning()) {
            Log.d("DecryptionBgService", "Already Running");
            response.resolve("DecryptionBackgroundService already running");
            return;
        }

        Intent serviceIntent = new Intent(getReactApplicationContext(), DecryptionBackgroundService.class);
        getReactApplicationContext().startService(serviceIntent);
        Log.d("DecryptionBgService", "Started");
        response.resolve("DecryptionBackgroundService started");
    }

    @ReactMethod
    public void stopService(Promise response) {
        Intent serviceIntent = new Intent(getReactApplicationContext(), DecryptionBackgroundService.class);
        getReactApplicationContext().stopService(serviceIntent);
        Log.d("DecryptionBgService", "Stopped");
        response.resolve("DecryptionBackgroundService stopped");
    }
}