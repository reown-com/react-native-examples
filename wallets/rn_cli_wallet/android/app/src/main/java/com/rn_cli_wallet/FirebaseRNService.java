package com.rn_cli_wallet;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import javax.crypto.SecretKey;

public class FirebaseRNService extends FirebaseMessagingService {
    private static ReactApplicationContext reactContext;
    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        Log.d("New Token", "Refreshed token: " + token);
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage message) {
        super.onMessageReceived(message);
        createNotificationChannel();
        if (message.getData().size() > 0) {
            Log.d("Msg data", "Message data payload: " + message.getData());
        }
        Log.d(message.getNotification().getTitle(), message.getNotification().getBody());
        NotificationManager notificationManager = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        }

        // Create a notification builder
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, "react_native_ch_id")
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .setContentTitle(message.getNotification().getTitle())
                .setContentText(message.getNotification().getBody())
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setDefaults(NotificationCompat.DEFAULT_ALL)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

        // Show the notification
        notificationManager.notify(15, builder.build());
        // String topic = message.getData().get("topic");
        // String blob = message.getData().get("blob");

        // BackgroundServiceModule bgService = new BackgroundServiceModule(reactContext);
        // try{
        // SecretKey symKey = bgService.oldGetKey(topic);
        // byte[] decrypted = bgService.decryptPayload(symKey.toString(), blob.getBytes());
        // Log.d("Message received", decrypted.toString());
        //} catch (Exception e) {
        //Log.d("Decryption error", e.toString());
        //}
    }

    private void oldcreateNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "react_native_ch_name";
            String description = "My Notification Channel Description";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel("react_native_ch_id", name, importance);
            channel.setDescription(description);
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "react_native_ch_name";
            String description = "My Notification Channel Description";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel("react_native_ch_id", name, importance);
            channel.setDescription(description);
            channel.setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION), new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build());
            channel.enableVibration(true);
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }
}
