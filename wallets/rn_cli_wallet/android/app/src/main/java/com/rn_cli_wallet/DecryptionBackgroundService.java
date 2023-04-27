package com.rn_cli_wallet;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

public class DecryptionBackgroundService extends Service {
    @Override
    public void onCreate() {
        super.onCreate();
        // Initialize any necessary resources here
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Implement the functionality of your background service here
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        // Not needed for a background service
        return null;
    }

    @Override
    public void onDestroy() {
        // Clean up any resources here
        super.onDestroy();
    }
}
