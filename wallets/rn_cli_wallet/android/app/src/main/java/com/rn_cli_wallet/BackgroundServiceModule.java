package com.rn_cli_wallet;

import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.provider.Settings;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.util.Base64;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import android.security.keystore.KeyProperties;

import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.UnrecoverableEntryException;
import java.security.cert.CertificateException;
import java.security.SecureRandom;
import java.security.GeneralSecurityException;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.nio.charset.StandardCharsets;

import java.io.IOException;

import java.util.List;

import android.os.Build;
import android.security.keystore.KeyGenParameterSpec;
import javax.crypto.KeyGenerator;
import javax.crypto.spec.IvParameterSpec;
import java.nio.ByteBuffer;

public class BackgroundServiceModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private static final String MODULE_NAME = "BackgroundServiceModule";
    private static final String KEY_ALIAS = "wc_my_key_alias";
    private static final int KEY_SIZE = 256;
    private static final String BLOCK_MODE = KeyProperties.BLOCK_MODE_CBC;
    private static final String ENCRYPTION_PADDING = KeyProperties.ENCRYPTION_PADDING_PKCS7;

    private static byte[] nonce = new byte[12];
    private static byte[] aad = "".getBytes(StandardCharsets.UTF_8);

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

    @ReactMethod
    public void getKey(Promise promise) {
        try {
            KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
            keyStore.load(null);
            KeyStore.SecretKeyEntry secretKeyEntry = (KeyStore.SecretKeyEntry) keyStore.getEntry(KEY_ALIAS, null);
            if (secretKeyEntry != null) {
                SecretKey secretKey = secretKeyEntry.getSecretKey();
                promise.resolve("Key found " + secretKey);
            } else {
                throw new NoSuchProviderException("Private key not found for alias: " + KEY_ALIAS);
            }
        } catch (KeyStoreException | NoSuchAlgorithmException | UnrecoverableEntryException | NoSuchProviderException | CertificateException | IOException e) {
            promise.reject("Error getting key from keychain", e);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    @ReactMethod
    public void generateAndStoreKey(Promise promise) throws Exception {
        // Get the Android KeyStore instance
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);

        // Check if the key already exists
        if (!keyStore.containsAlias(KEY_ALIAS)) {
            // Generate a symmetric key
            KeyGenerator keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
            KeyGenParameterSpec keySpec = new KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                    .setBlockModes(BLOCK_MODE)
                    .setEncryptionPaddings(ENCRYPTION_PADDING)
                    .setKeySize(KEY_SIZE)
                    .build();
            keyGenerator.init(keySpec);
            SecretKey secretKey = keyGenerator.generateKey();
            Log.d("Key generated", secretKey.toString());
            promise.resolve("Key generated successfully " + secretKey.toString());
        } else {
            Log.d("Key generation", "Key already exists in KeyStore");
            promise.reject("Key already exists in KeyStore");
        }
    }

    public static byte[] encrypt(String plaintext, SecretKey key) throws Exception {
        SecureRandom secureRandom = new SecureRandom();
        secureRandom.nextBytes(nonce);

        byte[] message = plaintext.getBytes(StandardCharsets.UTF_8);

        Cipher cipher = Cipher.getInstance("ChaCha20Poly1305");
        cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(nonce));

        cipher.updateAAD(aad);
        byte[] encryptedMessage = cipher.doFinal(message);

        ByteBuffer byteBuffer = ByteBuffer.allocate(nonce.length + encryptedMessage.length);
        byteBuffer.put(nonce);
        byteBuffer.put(encryptedMessage);
        return byteBuffer.array();
    }
    @ReactMethod
    public static void decrypt(Promise promise) throws GeneralSecurityException {
        Cipher cipher = Cipher.getInstance("ChaCha20-Poly1305");
        try {
            KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
            keyStore.load(null);
            KeyStore.SecretKeyEntry secretKeyEntry = (KeyStore.SecretKeyEntry) keyStore.getEntry(KEY_ALIAS, null);
            if (secretKeyEntry != null) {
                SecretKey secretKey = secretKeyEntry.getSecretKey();
                Log.d("Fetched secret key", secretKey.toString());
                try {
                    byte[] ciphertext = encrypt("Hello WalletConnect", secretKey);
                    Log.d("Ciphertext", ciphertext.toString());
                    GCMParameterSpec spec = new GCMParameterSpec(128, nonce);
                    cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);
                    cipher.updateAAD(aad);
                    byte[] plaintext = cipher.doFinal(ciphertext);
                    String decrypted = new String(plaintext, StandardCharsets.UTF_8);
                    Log.d("Plaintext", ciphertext.toString());
                    promise.resolve("Decrypted " + decrypted);
                } catch (Exception e) {
                    promise.reject("Failed to decrypt", e);
                }
            } else {
                throw new NoSuchProviderException("Private key not found for alias: " + KEY_ALIAS);
            }
        } catch (KeyStoreException | NoSuchAlgorithmException | UnrecoverableEntryException | NoSuchProviderException | CertificateException | IOException e) {
            promise.reject("Error getting key from keychain", e);
        }
    }
}