package com.rn_cli_wallet;

import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.provider.Settings;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.oblador.keychain.KeychainModule;

import android.security.keystore.KeyProperties;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PublicKey;
import java.security.UnrecoverableEntryException;
import java.security.cert.CertificateException;
import java.security.SecureRandom;
import java.security.GeneralSecurityException;

import javax.crypto.Cipher;
import javax.crypto.KeyAgreement;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.nio.charset.StandardCharsets;

import java.io.IOException;

import java.security.spec.ECGenParameterSpec;
import java.util.List;

import android.os.Build;
import android.security.keystore.KeyGenParameterSpec;

import org.bouncycastle.crypto.modes.ChaCha20Poly1305;
import org.bouncycastle.crypto.params.KeyParameter;
import org.bouncycastle.crypto.params.ParametersWithIV;
import org.bouncycastle.util.encoders.Hex;

import javax.crypto.KeyGenerator;
import javax.crypto.spec.IvParameterSpec;
import java.nio.ByteBuffer;

public class BackgroundServiceModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private static final String MODULE_NAME = "BackgroundServiceModule";
    private static final int KEY_SIZE = 256;
    private static final String BLOCK_MODE = KeyProperties.BLOCK_MODE_CBC;
    private static final String ENCRYPTION_PADDING = KeyProperties.ENCRYPTION_PADDING_NONE;

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

    public SecretKey oldGetKey(String keyAlias) {
        try {
            KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
            keyStore.load(null);
            KeyStore.SecretKeyEntry secretKeyEntry = (KeyStore.SecretKeyEntry) keyStore.getEntry(keyAlias, null);
            if (secretKeyEntry != null) {
                SecretKey secretKey = secretKeyEntry.getSecretKey();
                return secretKey;
            } else {
                throw new NoSuchProviderException("Private key not found for alias: " + keyAlias);
            }
        } catch (KeyStoreException | NoSuchAlgorithmException | UnrecoverableEntryException | NoSuchProviderException | CertificateException | IOException e) {
            Log.d("KeyStore Error", e.toString());

            return null;
        }
    }

    private byte[] getKey(String keyAlias) throws Exception {
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        KeyStore.Entry entry = keyStore.getEntry(keyAlias, null);
        if (entry == null) {
            throw new Exception("No key found with alias: " + keyAlias);
        }
        if (!(entry instanceof KeyStore.SecretKeyEntry)) {
            throw new Exception("Found key is not a SecretKeyEntry");
        }
        KeyStore.SecretKeyEntry secretKeyEntry = (KeyStore.SecretKeyEntry) entry;
        SecretKey keystoreSecretKey = secretKeyEntry.getSecretKey();

        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, "AndroidKeyStore");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            keyPairGenerator.initialize(new KeyGenParameterSpec.Builder(keyAlias, KeyProperties.PURPOSE_SIGN)
                    .setDigests(KeyProperties.DIGEST_SHA256)
                    .setAlgorithmParameterSpec(new ECGenParameterSpec("secp256r1"))
                    .setUserAuthenticationRequired(false)
                    .build());
        }
        KeyPair ephemeralKeyPair = keyPairGenerator.generateKeyPair();
        KeyAgreement keyAgreement = KeyAgreement.getInstance("ECDH");
        keyAgreement.init(ephemeralKeyPair.getPrivate());
        keyAgreement.doPhase(keystoreSecretKey, true);
        Log.d("get key","got keystore secret key");
        byte[] sharedSecret = keyAgreement.generateSecret();
        Log.d("get key","Shared key generated");

        return sharedSecret;
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    @ReactMethod
    public void generateAndStoreKey(String keyAlias, Promise promise) throws Exception {
        // Get the Android KeyStore instance
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        // Check if the key already exists
        if (!keyStore.containsAlias(keyAlias)) {
            // Generate a symmetric key
            KeyGenerator keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
            KeyGenParameterSpec keySpec = new KeyGenParameterSpec.Builder(keyAlias, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
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

    @NonNull
    public static byte[] encrypt(@NonNull String plaintext, SecretKey key) throws Exception {
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
    public static void decrypt(String keyAlias, Promise promise) throws GeneralSecurityException {
        Cipher cipher = Cipher.getInstance("ChaCha20-Poly1305");
        try {
            KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
            keyStore.load(null);
            KeyStore.SecretKeyEntry secretKeyEntry = (KeyStore.SecretKeyEntry) keyStore.getEntry(keyAlias, null);
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
                throw new NoSuchProviderException("Private key not found for alias: " + keyAlias);
            }
        } catch (KeyStoreException | NoSuchAlgorithmException | UnrecoverableEntryException | NoSuchProviderException | CertificateException | IOException e) {
            promise.reject("Error getting key from keychain", e);
        }
    }


    public byte[] encryptPayload(@NonNull String keyAlias, @NonNull String input) throws Exception {
        ChaCha20Poly1305 chacha = new ChaCha20Poly1305();
        byte[] sharedSecretKey = getKey(keyAlias);
        KeyParameter keyParameter = new KeyParameter(sharedSecretKey);
        byte[] iv = new byte[12];
        chacha.init(true, new ParametersWithIV(keyParameter, iv));
        Log.d("Init chacha", "ChaCha ready");
        byte[] inputBytes = input.getBytes(StandardCharsets.UTF_8);
        byte[] encryptedTextBytes = new byte[chacha.getOutputSize(inputBytes.length)];
        int outputSize = chacha.processBytes(inputBytes, 0, inputBytes.length, encryptedTextBytes, 0);
        chacha.doFinal(encryptedTextBytes, outputSize);
        return encryptedTextBytes;
    }

    @NonNull
    public static String stringToHex(@NonNull String input) {
        StringBuilder hexString = new StringBuilder();
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            String hex = Integer.toHexString(c);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    public byte[] decryptPayload1(String key, @NonNull byte[] input) throws Exception {
        ChaCha20Poly1305 chacha = new ChaCha20Poly1305();
        KeyParameter keyParam = new KeyParameter(Hex.decode(stringToHex(key)));
        byte[] iv = new byte[12];
        chacha.init(false, new ParametersWithIV(keyParam, iv));
        byte[] decryptedTextBytes = new byte[chacha.getOutputSize(input.length)];
        int outputSize = chacha.processBytes(input, 0, input.length, decryptedTextBytes, 0);
        chacha.doFinal(decryptedTextBytes, outputSize);
        return decryptedTextBytes;
    }

    public byte[] oldDecryptPayload(@NonNull String keyAlias, @NonNull byte[] input) throws Exception {
        ChaCha20Poly1305 chacha = new ChaCha20Poly1305();
        byte[] sharedSecretKey = getKey(keyAlias);
        KeyParameter keyParam = new KeyParameter(sharedSecretKey);
        byte[] iv = new byte[12];
        chacha.init(false, new ParametersWithIV(keyParam, iv));
        byte[] decryptedTextBytes = new byte[chacha.getOutputSize(input.length)];
        int outputSize = chacha.processBytes(input, 0, input.length, decryptedTextBytes, 0);
        chacha.doFinal(decryptedTextBytes, outputSize);
        return decryptedTextBytes;
    }

    public byte[] decryptPayload(@NonNull String keyAlias, @NonNull byte[] input) throws Exception {
        ChaCha20Poly1305 chacha = new ChaCha20Poly1305();
        byte[] sharedSecretKey = getKey(keyAlias);
        KeyParameter keyParam = new KeyParameter(sharedSecretKey);
        byte[] iv = new byte[12];
        chacha.init(false, new ParametersWithIV(keyParam, iv));
        byte[] decryptedTextBytes = new byte[chacha.getOutputSize(input.length)];
        int outputSize = chacha.processBytes(input, 0, input.length, decryptedTextBytes, 0);
        chacha.doFinal(decryptedTextBytes, outputSize);
        return decryptedTextBytes;
    }

    @ReactMethod
    public void testFlow(String keyAlias, Promise promise) {
        try {
            byte[] encryptedPayload = encryptPayload(keyAlias, "HelloWalletConnectfam!");
            Log.d("Encrypted", encryptedPayload.toString());
            byte[] decryptedPayload = decryptPayload(keyAlias, encryptedPayload);
            String decryptedPlainText = new String(decryptedPayload, StandardCharsets.UTF_8);
            promise.resolve(decryptedPlainText);
        } catch (Exception e){
            Log.d("Error", e.getMessage());
            promise.reject("Failed to encrypt & decrypt");
        }
    }
}