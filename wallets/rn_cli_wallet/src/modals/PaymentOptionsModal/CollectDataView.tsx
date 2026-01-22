import { useState, useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { CollectDataAction } from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface CollectDataViewProps {
  collectData: CollectDataAction;
  collectedData: Record<string, string>;
  fieldErrors: Record<string, string>;
  onUpdateField: (fieldId: string, value: string, fieldType?: string) => void;
  onContinue: () => void;
}

export function CollectDataView({
  collectData,
  collectedData,
  fieldErrors,
  onUpdateField,
  onContinue,
}: CollectDataViewProps) {
  const Theme = useTheme();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const fields = collectData.fields;

  const getBorderColor = (fieldId: string) => {
    if (fieldErrors[fieldId]) {
      return Theme['text-error'];
    }
    if (focusedField === fieldId) {
      return Theme['bg-accent-primary'];
    }
    return Theme['foreground-tertiary'];
  };

  const handleSubmitEditing = (index: number) => {
    if (index < fields.length - 1) {
      inputRefs.current[fields[index + 1].id]?.focus();
    } else {
      onContinue();
    }
  };

  return (
    <KeyboardAwareScrollView
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text
        variant="h6-400"
        color="text-primary"
        center
        style={styles.headerTitle}
      >
        Additional Information
      </Text>

      {/* Collect Data Form */}
      <View>
        {fields.map((field, index) => (
          <View key={field.id} style={styles.fieldContainer}>
            <TextInput
              ref={ref => {
                inputRefs.current[field.id] = ref;
              }}
              style={[
                styles.fieldInput,
                {
                  backgroundColor: Theme['foreground-primary'],
                  color: Theme['text-primary'],
                  borderColor: getBorderColor(field.id),
                },
              ]}
              value={collectedData[field.id] || ''}
              onChangeText={value =>
                onUpdateField(field.id, value, field.fieldType)
              }
              placeholder={
                field.fieldType === 'date'
                  ? 'YYYY-MM-DD (e.g., 1990-01-15)'
                  : `${field.name}`
              }
              placeholderTextColor={Theme['text-secondary']}
              autoCapitalize="none"
              autoFocus={index === 0}
              returnKeyType={index === fields.length - 1 ? 'done' : 'next'}
              onSubmitEditing={() => handleSubmitEditing(index)}
              blurOnSubmit={index === fields.length - 1}
              onFocus={() => setFocusedField(field.id)}
              onBlur={() => setFocusedField(null)}
              keyboardType={
                field.fieldType === 'date' ? 'number-pad' : 'default'
              }
              maxLength={field.fieldType === 'date' ? 10 : undefined}
            />
          </View>
        ))}
      </View>

      <View style={styles.confirmButtonContainer}>
        <ActionButton onPress={onContinue} fullWidth>
          Continue
        </ActionButton>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    marginBottom: Spacing[5],
  },
  fieldContainer: {
    marginBottom: Spacing[4],
  },
  fieldInput: {
    height: 60,
    borderRadius: BorderRadius[4],
    paddingHorizontal: Spacing[5],
    borderWidth: 1,
    fontSize: 16,
  },
  confirmButtonContainer: {
    paddingTop: Spacing[4],
    gap: Spacing[2],
  },
});
