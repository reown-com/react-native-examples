import React from 'react';
import {StyleSheet} from 'react-native';
import {Button, Text, FlexView} from '@reown/appkit-ui-react-native';
import {useAccount, useProvider} from '@reown/appkit-react-native';
import base58 from 'bs58';
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import 'text-encoding';

import {ToastUtils} from '../utils/ToastUtils';

export function SolanaActionsView() {
  const isConnected = true;
  const {address, chainId} = useAccount();
  const {provider} = useProvider();

  const onSignSuccess = (data: any, title = 'Sign successful') => {
    ToastUtils.showSuccessToast(title, data);
  };

  const onSignError = (error: Error, title = 'Sign failed') => {
    ToastUtils.showErrorToast(title, error.message);
  };

  const signMessage = async () => {
    try {
      if (!provider) {
        ToastUtils.showErrorToast('Sign Message failed', 'No provider found');

        return;
      }
      if (!address) {
        ToastUtils.showErrorToast('Sign Message failed', 'No address found');

        return;
      }
      const encodedMessage = new TextEncoder().encode(
        'Hello from AppKit Solana',
      );
      const params = {
        message: base58.encode(encodedMessage),
        pubkey: address,
      };
      const {signature} = (await provider.request({
        method: 'solana_signMessage',
        params,
      })) as {signature: string};
      onSignSuccess(signature, 'Sign Message successful');
    } catch (error) {
      onSignError(error as Error, 'Sign Message failed');
    }
  };

  const signTransaction = async () => {
    try {
      if (!provider) {
        ToastUtils.showErrorToast(
          'Sign Transaction failed',
          'No provider found',
        );

        return;
      }
      if (!address) {
        ToastUtils.showErrorToast(
          'Sign Transaction failed',
          'No address found',
        );

        return;
      }
      const connection = new Connection(
        'https://api.mainnet-beta.solana.com',
        'confirmed',
      );
      const recipientPubKey = new PublicKey(
        'ComputeBudget111111111111111111111111111111',
      );
      const senderPubKey = new PublicKey(address);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPubKey,
          toPubkey: recipientPubKey,
          lamports: 0.00001 * LAMPORTS_PER_SOL,
        }),
      );
      transaction.feePayer = senderPubKey;
      const {blockhash} = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const base58EncodedTransaction = base58.encode(serializedTransaction);
      const params = {transaction: base58EncodedTransaction};
      const result = (await provider.request(
        {
          method: 'solana_signTransaction',
          params,
        },
        `solana:${chainId}`,
      )) as {signature?: string; transaction?: string};
      if (result.signature) {
        onSignSuccess(
          `Signature: ${result.signature}`,
          'Sign Transaction successful',
        );
      } else if (result.transaction) {
        onSignSuccess(
          `Signed Tx (bs58): ${result.transaction.substring(0, 60)}...`,
          'Sign Transaction successful',
        );
      } else {
        onSignSuccess(
          'Transaction signed (no specific signature/tx field in response)',
          'Sign Transaction successful',
        );
      }
    } catch (error: any) {
      onSignError(error as Error, 'Sign Transaction failed');
    }
  };

  const signAndSendTransaction = async () => {
    try {
      if (!provider) {
        ToastUtils.showErrorToast('Sign & Send Tx failed', 'No provider found');

        return;
      }
      if (!address) {
        ToastUtils.showErrorToast('Sign & Send Tx failed', 'No address found');

        return;
      }
      const connection = new Connection(
        'https://api.mainnet-beta.solana.com',
        'confirmed',
      );
      const recipientPubKey = new PublicKey(
        'ComputeBudget111111111111111111111111111111',
      );
      const senderPubKey = new PublicKey(address);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPubKey,
          toPubkey: recipientPubKey,
          lamports: 0.00002 * LAMPORTS_PER_SOL, // Slightly different amount for distinction
        }),
      );
      transaction.feePayer = senderPubKey;
      const {blockhash} = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const base58EncodedTransaction = base58.encode(serializedTransaction);
      const params = {transaction: base58EncodedTransaction};
      // The result for signAndSendTransaction is typically the transaction signature
      const {signature} = (await provider.request({
        method: 'solana_signAndSendTransaction',
        params,
      })) as {signature: string};
      onSignSuccess(`Tx Signature: ${signature}`, 'Sign & Send Tx successful');
      // Optionally, you can confirm the transaction here using the signature and connection
      // await connection.confirmTransaction(signature, 'confirmed');
      // ToastUtils.showInfoToast('Transaction confirmation pending...');
    } catch (error) {
      onSignError(error as Error, 'Sign & Send Tx failed');
    }
  };

  const signAllTransactions = async () => {
    try {
      if (!provider) {
        ToastUtils.showErrorToast('Sign All Txs failed', 'No provider found');

        return;
      }
      if (!address) {
        ToastUtils.showErrorToast('Sign All Txs failed', 'No address found');

        return;
      }
      const connection = new Connection(
        'https://api.mainnet-beta.solana.com',
        'confirmed',
      );
      const senderPubKey = new PublicKey(address);
      const recipient1PubKey = new PublicKey(
        'ComputeBudget111111111111111111111111111111',
      );
      const recipient2PubKey = new PublicKey(
        'Vote111111111111111111111111111111111111111',
      ); // Different recipient for variety

      const {blockhash} = await connection.getLatestBlockhash();

      const tx1 = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPubKey,
          toPubkey: recipient1PubKey,
          lamports: 0.00003 * LAMPORTS_PER_SOL,
        }),
      );
      tx1.feePayer = senderPubKey;
      tx1.recentBlockhash = blockhash;

      const tx2 = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPubKey,
          toPubkey: recipient2PubKey,
          lamports: 0.00004 * LAMPORTS_PER_SOL,
        }),
      );
      tx2.feePayer = senderPubKey;
      tx2.recentBlockhash = blockhash;

      const serializedTx1 = base58.encode(
        tx1.serialize({requireAllSignatures: false, verifySignatures: false}),
      );
      const serializedTx2 = base58.encode(
        tx2.serialize({requireAllSignatures: false, verifySignatures: false}),
      );

      const params = {transactions: [serializedTx1, serializedTx2]};

      // The result for signAllTransactions is typically an array of signed transactions or signatures
      const result = (await provider.request({
        method: 'solana_signAllTransactions',
        params,
      })) as {transactions?: string[]; signatures?: string[]}; // Adjust based on provider's typical response

      if (result.transactions) {
        onSignSuccess(
          `Signed ${
            result.transactions.length
          } Txs (bs58): Tx1: ${result.transactions[0].substring(0, 30)}...`,
          'Sign All Txs successful',
        );
      } else if (result.signatures) {
        onSignSuccess(
          `Signed ${
            result.signatures.length
          } Txs (signatures): Sig1: ${result.signatures[0].substring(
            0,
            30,
          )}...`,
          'Sign All Txs successful',
        );
      } else {
        onSignSuccess(
          'All transactions signed (response format varies)',
          'Sign All Txs successful',
        );
      }
    } catch (error) {
      onSignError(error as Error, 'Sign All Txs failed');
    }
  };

  return isConnected ? (
    <FlexView style={styles.container}>
      <Text variant="medium-600">Solana Actions</Text>
      <Button testID="sign-message-button" onPress={signMessage}>
        Sign Message
      </Button>
      <Button testID="sign-transaction-button" onPress={signTransaction}>
        Sign Transaction
      </Button>
      <Button
        testID="sign-send-transaction-button"
        onPress={signAndSendTransaction}>
        Sign & Send Transaction
      </Button>
      <Button
        testID="sign-all-transactions-button"
        onPress={signAllTransactions}>
        Sign All Transactions
      </Button>
    </FlexView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    gap: 8,
  },
});
