import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSnapshot } from 'valtio';

import ModalStore from '@/store/ModalStore';
import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import PayStore from '@/store/PayStore';
import { eip155Wallets } from '@/utils/EIP155WalletUtil';
import SettingsStore from '@/store/SettingsStore';
import type {
  PaymentOptionsResponse,
  PaymentOption,
  CollectDataFieldResult,
} from '@walletconnect/pay';

// Format date input as user types (YYYY-MM-DD)
function formatDateInput(value: string): string {
  // Remove any non-numeric characters except dashes
  const cleaned = value.replace(/[^0-9]/g, '');

  // Format as YYYY-MM-DD
  if (cleaned.length <= 4) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  } else {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(
      6,
      8,
    )}`;
  }
}

// Validate date format (YYYY-MM-DD) and check if it's a valid past date
function isValidDateOfBirth(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();

  // Check if date is valid and in the past (and reasonable - not before 1900)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date < now &&
    year >= 1900
  );
}

// Format amount with decimals
function formatAmount(
  value: string,
  decimals: number,
  minDecimals: number = 0,
): string {
  const num = BigInt(value);
  const divisor = BigInt(10 ** decimals);
  const integerPart = num / divisor;
  const fractionalPart = num % divisor;

  if (fractionalPart === BigInt(0)) {
    if (minDecimals > 0) {
      return `${integerPart}.${'0'.repeat(minDecimals)}`;
    }
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  // Remove trailing zeros, but keep at least minDecimals
  let trimmedFractional = fractionalStr.replace(/0+$/, '');
  if (trimmedFractional.length < minDecimals) {
    trimmedFractional = trimmedFractional.padEnd(minDecimals, '0');
  }
  return `${integerPart}.${trimmedFractional}`;
}

export default function PaymentOptionsModal() {
  const Theme = useTheme();
  const { data } = useSnapshot(ModalStore.state);
  const paymentData = data?.paymentOptions as
    | PaymentOptionsResponse
    | undefined;
  const isLoading =
    data?.loadingMessage !== undefined && !data?.errorMessage && !paymentData;
  const errorMessage = data?.errorMessage;

  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(
    null,
  );
  const [paymentActions, setPaymentActions] = useState<any[] | null>(null);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [isSigningPayment, setIsSigningPayment] = useState(false);
  const [actionsError, setActionsError] = useState<string | null>(null);
  const [collectedData, setCollectedData] = useState<Record<string, string>>(
    {},
  );
  const [collectDataCompleted, setCollectDataCompleted] = useState(false);
  const [collectDataError, setCollectDataError] = useState<string | null>(null);

  const onClose = useCallback(() => {
    setSelectedOption(null);
    setPaymentActions(null);
    setActionsError(null);
    setCollectedData({});
    setCollectDataCompleted(false);
    setCollectDataError(null);
    ModalStore.close();
  }, []);

  const onBack = useCallback(() => {
    // From signing view, go back to payment options
    if (selectedOption) {
      setSelectedOption(null);
      setPaymentActions(null);
      setActionsError(null);
    }
  }, [selectedOption]);

  const updateCollectedField = useCallback(
    (fieldId: string, value: string, fieldType?: string) => {
      // Format date fields as user types
      const formattedValue =
        fieldType === 'date' ? formatDateInput(value) : value;
      setCollectedData(prev => ({ ...prev, [fieldId]: formattedValue }));
      setCollectDataError(null);
    },
    [],
  );

  const fetchPaymentActions = useCallback(
    async (option: PaymentOption) => {
      const payClient = PayStore.getClient();
      if (!payClient || !paymentData) {
        setActionsError('Pay SDK not initialized');
        return;
      }

      setIsLoadingActions(true);
      setActionsError(null);

      try {
        console.log(
          '[Pay] Getting required payment actions for option:',
          option.id,
        );
        const actions = await payClient.getRequiredPaymentActions({
          paymentId: paymentData.paymentId,
          optionId: option.id,
        });
        console.log('[Pay] Required actions:', actions);
        setPaymentActions(actions);
      } catch (error: any) {
        console.error('[Pay] Error getting payment actions:', error);
        setActionsError(error?.message || 'Failed to get payment actions');
      } finally {
        setIsLoadingActions(false);
      }
    },
    [paymentData],
  );

  const onSaveCollectData = useCallback(() => {
    if (!paymentData?.collectData) {
      setCollectDataCompleted(true);
      return;
    }

    // Validate required fields
    const missingFields = paymentData.collectData.fields
      .filter(field => field.required && !collectedData[field.id]?.trim())
      .map(field => field.name);

    if (missingFields.length > 0) {
      setCollectDataError(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    // Validate date fields format
    const invalidDateFields = paymentData.collectData.fields
      .filter(
        field =>
          field.fieldType === 'date' &&
          collectedData[field.id]?.trim() &&
          !isValidDateOfBirth(collectedData[field.id]),
      )
      .map(field => field.name);

    if (invalidDateFields.length > 0) {
      setCollectDataError(
        `Invalid date format for: ${invalidDateFields.join(
          ', ',
        )}. Use YYYY-MM-DD (e.g., 1990-01-15)`,
      );
      return;
    }

    setCollectDataError(null);
    setCollectDataCompleted(true);
    // Now show payment options - user will select one
  }, [paymentData, collectedData]);

  const onSelectOption = useCallback(
    (option: PaymentOption) => {
      setSelectedOption(option);
      // collectData is already handled, fetch actions immediately
      fetchPaymentActions(option);
    },
    [fetchPaymentActions],
  );

  const onApprovePayment = useCallback(async () => {
    if (
      !paymentActions ||
      paymentActions.length === 0 ||
      !selectedOption ||
      !paymentData
    ) {
      return;
    }

    // Validate required fields
    if (paymentData.collectData) {
      const missingFields = paymentData.collectData.fields
        .filter(field => field.required && !collectedData[field.id]?.trim())
        .map(field => field.name);

      if (missingFields.length > 0) {
        setActionsError(
          `Please fill in required fields: ${missingFields.join(', ')}`,
        );
        return;
      }
    }

    setIsSigningPayment(true);
    setActionsError(null);

    try {
      const payClient = PayStore.getClient();
      const wallet = eip155Wallets[SettingsStore.state.eip155Address];
      const signatures: string[] = [];

      for (const action of paymentActions) {
        if (action.walletRpc) {
          const { method, params } = action.walletRpc;
          const parsedParams = JSON.parse(params);

          console.log('[Pay] Signing action:', method, parsedParams);

          if (
            method === 'eth_signTypedData_v4' ||
            method === 'eth_signTypedData_v3' ||
            method === 'eth_signTypedData'
          ) {
            const typedData = JSON.parse(parsedParams[1]);
            const { domain, types, message: messageData } = typedData;
            // Remove EIP712Domain from types as ethers handles it
            delete types.EIP712Domain;
            const signature = await wallet._signTypedData(
              domain,
              types,
              messageData,
            );
            console.log('[Pay] Signature:', signature);
            signatures.push(signature);
          }
        }
      }

      // Prepare collected data for submission
      const collectedDataResults: CollectDataFieldResult[] =
        paymentData.collectData
          ? paymentData.collectData.fields
              .filter(field => collectedData[field.id]?.trim())
              .map(field => ({
                id: field.id,
                value: collectedData[field.id].trim(),
              }))
          : [];

      // Submit results back to Pay SDK
      if (payClient) {
        console.log('[Pay] Confirming payment with signatures:', signatures);
        console.log('[Pay] Collected data:', collectedDataResults);

        const confirmResult = await payClient.confirmPayment({
          paymentId: paymentData.paymentId,
          optionId: selectedOption.id,
          signatures,
          collectedData:
            collectedDataResults.length > 0 ? collectedDataResults : undefined,
        });

        console.log('[Pay] Payment confirmed:', confirmResult);
      }

      ModalStore.close();
    } catch (error: any) {
      console.error('[Pay] Error signing payment:', error);
      setActionsError(error?.message || 'Failed to sign payment');
    } finally {
      setIsSigningPayment(false);
    }
  }, [paymentActions, selectedOption, paymentData, collectedData]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: Theme['bg-175'] }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme['accent-100']} />
          <Text style={[styles.loadingText, { color: Theme['fg-100'] }]}>
            {data?.loadingMessage || 'Loading payment options...'}
          </Text>
        </View>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={[styles.container, { backgroundColor: Theme['bg-175'] }]}>
        <Text style={[styles.headerTitle, { color: Theme['fg-100'] }]}>
          Payment Error
        </Text>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Theme['error-100'] }]}>
            {errorMessage}
          </Text>
        </View>
        <View style={styles.footerContainer}>
          <ActionButton
            style={styles.closeButton}
            textStyle={styles.closeButtonText}
            onPress={onClose}
            secondary
          >
            Close
          </ActionButton>
        </View>
      </View>
    );
  }

  if (!paymentData) {
    return null;
  }

  const { info, options } = paymentData;

  // Determine if we need to show collect data form
  const hasCollectData =
    paymentData?.collectData && paymentData.collectData.fields.length > 0;

  // Show collect data form FIRST if it exists and not completed (before payment options)
  const showCollectDataForm = hasCollectData && !collectDataCompleted;
  // Show signing view when option is selected (collectData already completed or doesn't exist)
  const showSigningView =
    selectedOption && (!hasCollectData || collectDataCompleted);

  // Show Collect Data Form FIRST (before payment options)
  if (showCollectDataForm) {
    return (
      <View style={[styles.container, { backgroundColor: Theme['bg-175'] }]}>
        <Text style={[styles.headerTitle, { color: Theme['fg-100'] }]}>
          Additional Information
        </Text>

        {/* Payment Info */}
        {info?.merchant && (
          <View style={styles.merchantContainer}>
            {info.merchant.iconUrl && (
              <Image
                source={{ uri: info.merchant.iconUrl }}
                style={styles.merchantIcon}
              />
            )}
            <Text style={[styles.merchantName, { color: Theme['fg-100'] }]}>
              {info.merchant.name}
            </Text>
          </View>
        )}

        {info?.amount && (
          <View style={styles.amountContainer}>
            <Text style={[styles.amountValue, { color: Theme['fg-100'] }]}>
              $
              {formatAmount(info.amount.value, info.amount.display.decimals, 2)}
            </Text>
          </View>
        )}

        {/* Collect Data Form */}
        <ScrollView
          style={styles.collectDataScrollView}
          contentContainerStyle={styles.collectDataScrollContent}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          {paymentData.collectData!.fields.map(field => (
            <View key={field.id} style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: Theme['fg-200'] }]}>
                {field.name}
                {field.required && (
                  <Text style={{ color: Theme['error-100'] }}> *</Text>
                )}
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    backgroundColor: Theme['bg-100'],
                    color: Theme['fg-100'],
                    borderColor: Theme['bg-300'],
                  },
                ]}
                value={collectedData[field.id] || ''}
                onChangeText={value =>
                  updateCollectedField(field.id, value, field.fieldType)
                }
                placeholder={
                  field.fieldType === 'date'
                    ? 'YYYY-MM-DD (e.g., 1990-01-15)'
                    : `Enter ${field.name}`
                }
                placeholderTextColor={Theme['fg-300']}
                autoCapitalize="none"
                keyboardType={
                  field.fieldType === 'date' ? 'number-pad' : 'default'
                }
                maxLength={field.fieldType === 'date' ? 10 : undefined}
              />
            </View>
          ))}
        </ScrollView>

        {/* Error */}
        {collectDataError && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: Theme['error-100'] }]}>
              {collectDataError}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.confirmButtonsContainer}>
          <ActionButton
            style={styles.approveButton}
            textStyle={styles.approveButtonText}
            onPress={onSaveCollectData}
          >
            Continue to Payment
          </ActionButton>
          <ActionButton
            style={styles.closeButton}
            textStyle={styles.closeButtonText}
            onPress={onClose}
            secondary
          >
            Cancel
          </ActionButton>
        </View>
      </View>
    );
  }

  // Show Signing Confirmation when option is selected
  if (showSigningView) {
    return (
      <View style={[styles.container, { backgroundColor: Theme['bg-175'] }]}>
        <Text style={[styles.headerTitle, { color: Theme['fg-100'] }]}>
          Confirm Payment
        </Text>

        {/* Selected Option Info */}
        <View style={styles.confirmationContainer}>
          {selectedOption.amount.display.iconUrl && (
            <Image
              source={{ uri: selectedOption.amount.display.iconUrl }}
              style={styles.confirmIcon}
            />
          )}
          <Text style={[styles.confirmAmount, { color: Theme['fg-100'] }]}>
            {formatAmount(
              selectedOption.amount.value,
              selectedOption.amount.display.decimals,
              2,
            )}{' '}
            {selectedOption.amount.display.assetSymbol}
          </Text>
          <Text style={[styles.confirmNetwork, { color: Theme['fg-200'] }]}>
            on {selectedOption.amount.display.networkName || 'Unknown Network'}
          </Text>
        </View>

        {/* Loading Actions */}
        {isLoadingActions && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme['accent-100']} />
            <Text style={[styles.loadingText, { color: Theme['fg-100'] }]}>
              Preparing payment...
            </Text>
          </View>
        )}

        {/* Actions Error */}
        {actionsError && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: Theme['error-100'] }]}>
              {actionsError}
            </Text>
          </View>
        )}

        {/* Actions Ready */}
        {paymentActions && !isLoadingActions && (
          <View style={styles.actionsContainer}>
            <Text style={[styles.actionsLabel, { color: Theme['fg-200'] }]}>
              This will sign a transfer authorization for this payment.
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.confirmButtonsContainer}>
          {paymentActions && !isLoadingActions && (
            <ActionButton
              style={styles.approveButton}
              textStyle={styles.approveButtonText}
              onPress={onApprovePayment}
              disabled={isSigningPayment}
            >
              {isSigningPayment ? 'Signing...' : 'Approve & Sign'}
            </ActionButton>
          )}
          <ActionButton
            style={styles.closeButton}
            textStyle={styles.closeButtonText}
            onPress={onBack}
            secondary
            disabled={isSigningPayment}
          >
            Back
          </ActionButton>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-175'] }]}>
      <Text style={[styles.headerTitle, { color: Theme['fg-100'] }]}>
        Payment Request
      </Text>

      {/* Merchant Info */}
      {info?.merchant && (
        <View style={styles.merchantContainer}>
          {info.merchant.iconUrl && (
            <Image
              source={{ uri: info.merchant.iconUrl }}
              style={styles.merchantIcon}
            />
          )}
          <Text style={[styles.merchantName, { color: Theme['fg-100'] }]}>
            {info.merchant.name}
          </Text>
        </View>
      )}

      {/* Amount */}
      {info?.amount && (
        <View style={styles.amountContainer}>
          <Text style={[styles.amountValue, { color: Theme['fg-100'] }]}>
            ${formatAmount(info.amount.value, info.amount.display.decimals, 2)}
          </Text>
          <Text style={[styles.amountLabel, { color: Theme['fg-200'] }]}>
            {info.amount.display.assetName}
          </Text>
        </View>
      )}

      {/* Payment Options */}
      <Text style={[styles.sectionTitle, { color: Theme['fg-100'] }]}>
        Select Payment Method
      </Text>

      <ScrollView style={styles.optionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[styles.optionCard, { backgroundColor: Theme['bg-150'] }]}
            onPress={() => onSelectOption(option)}
          >
            <View style={styles.optionInfo}>
              {option.amount.display.iconUrl && (
                <Image
                  source={{ uri: option.amount.display.iconUrl }}
                  style={styles.optionIcon}
                />
              )}
              <View style={styles.optionDetails}>
                <Text style={[styles.optionAmount, { color: Theme['fg-100'] }]}>
                  {formatAmount(
                    option.amount.value,
                    option.amount.display.decimals,
                    2,
                  )}{' '}
                  {option.amount.display.assetSymbol}
                </Text>
                <Text
                  style={[styles.optionNetwork, { color: Theme['fg-200'] }]}
                >
                  {option.amount.display.networkName || 'Unknown Network'}
                </Text>
              </View>
            </View>
            <Text style={[styles.optionEta, { color: Theme['fg-200'] }]}>
              ~{Math.round(option.etaS / 60)} min
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footerContainer}>
        <ActionButton
          style={styles.closeButton}
          textStyle={styles.closeButtonText}
          onPress={onClose}
          secondary
        >
          Cancel
        </ActionButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  merchantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  merchantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  amountLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    maxHeight: 300,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  optionDetails: {
    flex: 1,
  },
  optionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionNetwork: {
    fontSize: 12,
    marginTop: 2,
  },
  optionEta: {
    fontSize: 12,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  closeButton: {
    width: '100%',
    height: 48,
    borderRadius: 100,
  },
  closeButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  confirmationContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  confirmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
  },
  confirmAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  confirmNetwork: {
    fontSize: 14,
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionsLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  confirmButtonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  approveButton: {
    width: '100%',
    height: 48,
    borderRadius: 100,
  },
  approveButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  collectDataContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  collectDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  collectDataScrollView: {
    flexShrink: 1,
  },
  collectDataScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  fieldInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: 16,
  },
});
