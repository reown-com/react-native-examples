import { useCallback, useState } from 'react';
import { useSnapshot } from 'valtio';

import ModalStore from '@/store/ModalStore';
import PayStore from '@/store/PayStore';
import SettingsStore from '@/store/SettingsStore';
import { eip155Wallets } from '@/utils/EIP155WalletUtil';
import type {
  PaymentOptionsResponse,
  PaymentOption,
  CollectDataFieldResult,
} from '@walletconnect/pay';

import { LoadingView } from './LoadingView';
import { ErrorView } from './ErrorView';
import { CollectDataView } from './CollectDataView';
import { ConfirmPaymentView } from './ConfirmPaymentView';
import { PaymentOptionsView } from './PaymentOptionsView';
import { formatDateInput, isValidDateOfBirth } from './utils';

export default function PaymentOptionsModal() {
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
    if (selectedOption) {
      setSelectedOption(null);
      setPaymentActions(null);
      setActionsError(null);
    }
  }, [selectedOption]);

  const updateCollectedField = useCallback(
    (fieldId: string, value: string, fieldType?: string) => {
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

    const missingFields = paymentData.collectData.fields
      .filter(field => field.required && !collectedData[field.id]?.trim())
      .map(field => field.name);

    if (missingFields.length > 0) {
      setCollectDataError(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

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
  }, [paymentData, collectedData]);

  const onSelectOption = useCallback(
    (option: PaymentOption) => {
      setSelectedOption(option);
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

      const collectedDataResults: CollectDataFieldResult[] =
        paymentData.collectData
          ? paymentData.collectData.fields
              .filter(field => collectedData[field.id]?.trim())
              .map(field => ({
                id: field.id,
                value: collectedData[field.id].trim(),
              }))
          : [];

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

  // Loading state
  if (isLoading) {
    return <LoadingView message={data?.loadingMessage} />;
  }

  // Error state
  if (errorMessage) {
    return <ErrorView message={errorMessage} onClose={onClose} />;
  }

  // No data
  if (!paymentData) {
    return null;
  }

  const { info, options } = paymentData;
  const hasCollectData =
    paymentData?.collectData && paymentData.collectData.fields.length > 0;
  const showCollectDataForm = hasCollectData && !collectDataCompleted;
  const showSigningView =
    selectedOption && (!hasCollectData || collectDataCompleted);

  // Collect Data Form (first step if collectData exists)
  if (showCollectDataForm) {
    return (
      <CollectDataView
        collectData={paymentData.collectData!}
        info={info}
        collectedData={collectedData}
        error={collectDataError}
        onUpdateField={updateCollectedField}
        onSave={onSaveCollectData}
        onCancel={onClose}
      />
    );
  }

  // Confirm Payment view (after selecting option)
  if (showSigningView) {
    return (
      <ConfirmPaymentView
        selectedOption={selectedOption}
        paymentActions={paymentActions}
        isLoadingActions={isLoadingActions}
        isSigningPayment={isSigningPayment}
        error={actionsError}
        onApprove={onApprovePayment}
        onBack={onBack}
      />
    );
  }

  // Payment Options view (default)
  return (
    <PaymentOptionsView
      info={info}
      options={options}
      onSelectOption={onSelectOption}
      onCancel={onClose}
    />
  );
}
