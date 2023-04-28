package com.rn_cli_wallet;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import javax.crypto.SecretKey;

public class FirebaseRNService extends FirebaseMessagingService {
    private static ReactApplicationContext reactContext;
    @Override
    public void onMessageReceived(@NonNull RemoteMessage message) {
        super.onMessageReceived(message);
        String topic = message.getData().get("topic");
        String blob = message.getData().get("blob");

        BackgroundServiceModule bgService = new BackgroundServiceModule(reactContext);
        SecretKey symKey = bgService.getKey();
        try{
            byte[] decrypted = bgService.decryptPayload(symKey.toString(), blob.getBytes());
            Log.d("Message received", decrypted.toString());
        } catch (Exception e) {
            Log.d("Decryption error", e.toString());
        }
    }
}
