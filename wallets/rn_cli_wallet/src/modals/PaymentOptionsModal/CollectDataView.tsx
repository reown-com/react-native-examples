import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import type { CollectDataAction, PaymentInfo } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { MerchantInfo } from './MerchantInfo';

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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerTitle, { color: Theme['fg-100'] }]}>
          Additional Information
        </Text>

        <MerchantInfo info={info} />

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
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
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
  closeButton: {
    width: '100%',
    height: 48,
    borderRadius: 100,
  },
  closeButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
