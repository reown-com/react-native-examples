// Web variant of CollectDataWebView.
//
// The identity-collection (IC / KYC) form at pay.walletconnect.com sends
// `X-Frame-Options: DENY`, so it cannot be embedded in an <iframe>, and a new
// tab can't be driven by our E2E tooling (Maestro web cannot switch tabs).
//
// Instead of the hosted form, on web we render the fields IN-APP from
// `collectData.fields` and submit the values directly via `confirmPayment`'s
// `collectedData` param (a first-class SDK path — the hosted `url` is optional).
// Native keeps the hosted webview (which submits server-side); see the sibling
// CollectDataWebView.tsx.
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import type {
  CollectDataField,
  CollectDataFieldResult,
} from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Spacing } from '@/utils/ThemeUtil';

// Prefilled, valid-by-default values (mirrors the prefill the native hosted form
// used). Keeps the form submit-ready for demos/E2E while staying editable.
function defaultValueFor(field: CollectDataField): string {
  switch (field.fieldType) {
    case 'date':
      return '1990-06-15';
    case 'checkbox':
      return 'true';
    default:
      return 'John Doe';
  }
}

interface CollectDataWebViewProps {
  // Unused on web (the hosted form URL); present for parity with native.
  url?: string;
  fields?: CollectDataField[];
  onComplete: (collectedData?: CollectDataFieldResult[]) => void;
  onError: (error: string) => void;
}

export function CollectDataWebView({
  fields = [],
  onComplete,
}: CollectDataWebViewProps) {
  const Theme = useTheme();

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map(f => [f.id, defaultValueFor(f)])),
  );
  const [error, setError] = useState<string | null>(null);

  const setValue = useCallback((id: string, value: string) => {
    setValues(prev => ({ ...prev, [id]: value }));
  }, []);

  const missingRequired = useMemo(
    () =>
      fields.filter(f => {
        if (!f.required) {
          return false;
        }
        const v = values[f.id];
        return f.fieldType === 'checkbox' ? v !== 'true' : !v?.trim();
      }),
    [fields, values],
  );

  const onSubmit = useCallback(() => {
    if (missingRequired.length > 0) {
      setError(
        `Please complete: ${missingRequired.map(f => f.name).join(', ')}`,
      );
      return;
    }
    const collectedData: CollectDataFieldResult[] = fields.map(f => ({
      id: f.id,
      value: values[f.id] ?? '',
    }));
    onComplete(collectedData);
  }, [fields, values, missingRequired, onComplete]);

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      <Text variant="lg-500" color="text-primary" style={styles.title}>
        Identity verification
      </Text>
      <Text variant="sm-400" color="text-secondary" style={styles.subtitle}>
        Confirm a few details to continue.
      </Text>

      <ScrollView
        style={styles.fields}
        contentContainerStyle={styles.fieldsContent}
        keyboardShouldPersistTaps="handled">
        {fields.map(field => {
          const value = values[field.id] ?? '';
          if (field.fieldType === 'checkbox') {
            const checked = value === 'true';
            return (
              <Button
                key={field.id}
                testID={`pay-collect-field-${field.id}`}
                onPress={() => setValue(field.id, checked ? 'false' : 'true')}
                style={styles.checkboxRow}>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: Theme['border-secondary'],
                      backgroundColor: checked
                        ? Theme['bg-accent-primary']
                        : 'transparent',
                    },
                  ]}>
                  {checked && (
                    <Text variant="sm-500" color="text-invert">
                      ✓
                    </Text>
                  )}
                </View>
                <Text
                  variant="md-400"
                  color="text-primary"
                  style={styles.checkboxLabel}>
                  {field.name}
                  {field.required ? ' *' : ''}
                </Text>
              </Button>
            );
          }
          return (
            <View key={field.id} style={styles.fieldGroup}>
              <Text variant="sm-400" color="text-secondary">
                {field.name}
                {field.required ? ' *' : ''}
              </Text>
              <TextInput
                testID={`pay-collect-field-${field.id}`}
                value={value}
                onChangeText={t => setValue(field.id, t)}
                placeholder={
                  field.fieldType === 'date' ? 'YYYY-MM-DD' : field.name
                }
                placeholderTextColor={Theme['text-tertiary']}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    color: Theme['text-primary'],
                    borderColor: Theme['border-primary'],
                  },
                ]}
              />
            </View>
          );
        })}
      </ScrollView>

      {error && (
        <Text variant="sm-400" color="text-error" style={styles.error}>
          {error}
        </Text>
      )}

      <Button
        testID="pay-collect-submit"
        onPress={onSubmit}
        style={[styles.button, { backgroundColor: Theme['bg-accent-primary'] }]}>
        <Text variant="md-500" color="text-invert">
          Continue
        </Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  fields: {
    flexGrow: 0,
  },
  fieldsContent: {
    gap: Spacing[3],
  },
  fieldGroup: {
    gap: Spacing[1],
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    flex: 1,
  },
  error: {
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[3],
    borderRadius: 16,
  },
});
