import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { CollectDataAction, PaymentInfo } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { styles } from './styles';
import { formatAmount } from './utils';

interface CollectDataViewProps {
  collectData: CollectDataAction;
  info?: PaymentInfo;
  collectedData: Record<string, string>;
  error: string | null;
  onUpdateField: (fieldId: string, value: string, fieldType?: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function CollectDataView({
  collectData,
  info,
  collectedData,
  error,
  onUpdateField,
  onSave,
  onCancel,
}: CollectDataViewProps) {
  const Theme = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: Theme['bg-175'] }]}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={styles.collectDataContentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
        <View style={styles.collectDataScrollContent}>
          {collectData.fields.map(field => (
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
                  onUpdateField(field.id, value, field.fieldType)
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
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: Theme['error-100'] }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.confirmButtonsContainer}>
          <ActionButton
            style={styles.approveButton}
            textStyle={styles.approveButtonText}
            onPress={onSave}
          >
            Continue to Payment
          </ActionButton>
          <ActionButton
            style={styles.closeButton}
            textStyle={styles.closeButtonText}
            onPress={onCancel}
            secondary
          >
            Cancel
          </ActionButton>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
