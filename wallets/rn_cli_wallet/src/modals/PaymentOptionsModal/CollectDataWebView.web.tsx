// Web variant of CollectDataWebView.
//
// The identity-collection (IC / KYC) form at pay.walletconnect.com sends
// `X-Frame-Options: DENY`, so it cannot be embedded in an <iframe>, and a new
// tab can't be driven by our E2E tooling (Maestro web cannot switch tabs).
//
// Instead of the hosted form, on web we render the fields IN-APP from
// `collectData.schema` (the full source of truth) and submit the values
// directly via `confirmPayment`'s `collectedData` param (a first-class SDK
// path — the hosted `url` is optional). Native keeps the hosted webview (which
// submits server-side); see the sibling CollectDataWebView.tsx.
//
// The design mirrors the buyer-experience `/collect` IC form (Figma): a
// title + description with inline "Read more", schema-driven fields (text with
// floating label + clear, real date input, country select), a Terms & Privacy
// sentence with an "I agree" consent box, and a Confirm button that stays
// disabled until the form is valid.
import type { ComponentType, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import type {
  CollectDataField,
  CollectDataFieldResult,
} from '@walletconnect/pay';

import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Spacing, BorderRadius, FontFamily } from '@/utils/ThemeUtil';
import Checkmark from '@/assets/Checkmark';
import SvgCaretUpDown from '@/assets/CaretUpDown';
import { COUNTRIES, getCountryName } from '@/utils/CountriesUtil';
import {
  parseCollectData,
  validateCollectData,
  type CollectFieldDescriptor,
} from '@/utils/CollectDataSchemaUtil';

const TERMS_URL = 'https://reown.com/terms-of-service';
const PRIVACY_URL = 'https://reown.com/privacy-policy';

const READ_MORE_TEXT =
  'We use these details to comply with applicable regulations and verify your identity. They are shared only with WalletConnect Pay and processed according to our Privacy Policy.';

// Raw DOM elements used for the date picker and country dropdown — they give a
// real, accessible native control on web with no extra dependencies. Typed
// minimally so this compiles without the DOM lib in the RN tsconfig.
interface DomFieldProps {
  type?: string;
  value?: string;
  max?: string;
  id?: string;
  'data-testid'?: string;
  disabled?: boolean;
  onChange?: (e: { target: { value: string } }) => void;
  style?: Record<string, string | number>;
  children?: ReactNode;
}
const DomInput = 'input' as unknown as ComponentType<DomFieldProps>;
const DomSelect = 'select' as unknown as ComponentType<DomFieldProps>;
const DomOption = 'option' as unknown as ComponentType<{
  value?: string;
  disabled?: boolean;
  children?: ReactNode;
}>;

// react-native-web maps `FontFamily.regular` ('System' on web) to this stack
// per Text element; the body keeps the browser default (serif). Raw DOM
// controls must set it explicitly to match the surrounding labels.
const WEB_SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Shared CSS for the raw DOM controls (strips native chrome so they inherit the
// field box styling). `color` is applied per-render from the active theme.
const DOM_CONTROL_BASE: Record<string, string | number> = {
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 16,
  fontFamily: WEB_SYSTEM_FONT,
  padding: 0,
  width: '100%',
};
// The country <select> is rendered as a transparent full-box overlay so the
// entire field (padding + caret included) is tappable, not just the text row.
// The selected value is shown by a Text underneath.
const DOM_SELECT_OVERLAY: Record<string, string | number> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  margin: 0,
  padding: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  appearance: 'none',
  WebkitAppearance: 'none',
  opacity: 0,
  cursor: 'pointer',
};

// Prefilled, valid-by-default values keep the form submit-ready for demos/E2E
// while staying editable (mirrors the prefill the native hosted form used).
function defaultValueForDescriptor(field: CollectFieldDescriptor): string {
  switch (field.control) {
    case 'date':
      return '1990-06-15';
    case 'country':
      return 'US';
    case 'checkbox':
      return 'true';
    default:
      if (/name/i.test(field.id)) {
        return 'John Doe';
      }
      if (/address/i.test(field.id)) {
        return 'New York, NY';
      }
      return '';
  }
}

interface CollectDataWebViewProps {
  // Unused on web (the hosted form URL); present for parity with native.
  url?: string;
  fields?: CollectDataField[];
  // JSON-Schema string describing the full field set, required, and anyOf rules.
  schema?: string;
  onComplete: (collectedData?: CollectDataFieldResult[]) => void;
  onError: (error: string) => void;
}

export function CollectDataWebView({
  fields = [],
  schema,
  onComplete,
}: CollectDataWebViewProps) {
  const Theme = useTheme();

  const parsed = useMemo(
    () => parseCollectData(schema, fields),
    [schema, fields],
  );

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      parsed.fields.map(f => [f.id, defaultValueForDescriptor(f)]),
    ),
  );
  const [consentChecked, setConsentChecked] = useState(true);
  const [readMoreExpanded, setReadMoreExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setValue = useCallback((id: string, value: string) => {
    setValues(prev => ({ ...prev, [id]: value }));
  }, []);

  const validation = useMemo(
    () => validateCollectData(parsed, values, consentChecked),
    [parsed, values, consentChecked],
  );

  const onSubmit = useCallback(() => {
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    setError(null);

    const collectedData: CollectDataFieldResult[] = parsed.fields
      .filter(f => values[f.id]?.trim())
      .map(f => ({ id: f.id, value: values[f.id] }));

    if (parsed.consent && consentChecked) {
      collectedData.push({ id: parsed.consent.id, value: 'true' });
    }

    onComplete(collectedData);
  }, [parsed, values, consentChecked, validation, onComplete]);

  const buttonColorStyle = {
    backgroundColor: Theme['bg-accent-primary'],
    opacity: validation.valid ? 1 : 0.6,
  };

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      <View style={styles.headerText}>
        <Text variant="h6-400" color="text-primary" center>
          Add your personal details
        </Text>
        <Text variant="lg-400" color="text-secondary" center>
          To meet compliance requirements, some basic information is collected
          from WalletConnect Pay users.
          {!readMoreExpanded && (
            <Text
              variant="lg-400"
              color="text-secondary"
              underline
              onPress={() => setReadMoreExpanded(true)}>
              {' '}
              Read more
            </Text>
          )}
        </Text>
        {readMoreExpanded && (
          <Text variant="lg-400" color="text-secondary" center>
            {READ_MORE_TEXT}
          </Text>
        )}
      </View>

      <ScrollView
        style={styles.fields}
        contentContainerStyle={styles.fieldsContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {parsed.fields.map(field => {
          const value = values[field.id] ?? '';
          if (field.control === 'date') {
            return (
              <DateField
                key={field.id}
                field={field}
                value={value}
                onChange={v => setValue(field.id, v)}
              />
            );
          }
          if (field.control === 'country') {
            return (
              <CountryField
                key={field.id}
                field={field}
                value={value}
                onChange={v => setValue(field.id, v)}
              />
            );
          }
          return (
            <TextField
              key={field.id}
              field={field}
              value={value}
              onChange={v => setValue(field.id, v)}
            />
          );
        })}

        {parsed.consent && (
          <ConsentBox
            checked={consentChecked}
            onToggle={() => setConsentChecked(c => !c)}
            testID={`pay-collect-field-${parsed.consent.id}`}
          />
        )}
      </ScrollView>

      {error && (
        <Text variant="sm-400" color="text-error" center style={styles.error}>
          {error}
        </Text>
      )}

      <Button
        testID="pay-collect-submit"
        onPress={onSubmit}
        disabled={!validation.valid}
        style={[styles.button, buttonColorStyle]}>
        <Text variant="lg-500" color="text-invert">
          Confirm
        </Text>
      </Button>
    </View>
  );
}

interface FieldProps {
  field: CollectFieldDescriptor;
  value: string;
  onChange: (value: string) => void;
}

function TextField({ field, value, onChange }: FieldProps) {
  const Theme = useTheme();
  const [focused, setFocused] = useState(false);
  const floating = focused || !!value;

  return (
    <View
      style={[
        styles.fieldBox,
        {
          backgroundColor: Theme['foreground-primary'],
          borderColor: Theme['border-primary'],
        },
      ]}>
      <View style={styles.fieldContent}>
        {floating && (
          <Text variant="sm-400" color="text-secondary">
            {field.label}
          </Text>
        )}
        <TextInput
          testID={`pay-collect-field-${field.id}`}
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={floating ? undefined : field.label}
          placeholderTextColor={Theme['text-secondary']}
          maxLength={field.maxLength}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.textInput, { color: Theme['text-primary'] }]}
        />
      </View>
      {!!value && (
        <Button
          onPress={() => onChange('')}
          accessibilityLabel={`Clear ${field.label}`}
          hitSlop={8}
          style={styles.adornment}>
          <Text variant="lg-400" color="text-secondary">
            ✕
          </Text>
        </Button>
      )}
    </View>
  );
}

// Max selectable date = today, so a date of birth can't be in the future.
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function DateField({ field, value, onChange }: FieldProps) {
  const Theme = useTheme();
  const inputStyle = { ...DOM_CONTROL_BASE, color: Theme['text-primary'] };

  return (
    <View
      style={[
        styles.fieldBox,
        {
          backgroundColor: Theme['foreground-primary'],
          borderColor: Theme['border-primary'],
        },
      ]}>
      <View style={styles.fieldContent}>
        <Text variant="sm-400" color="text-secondary">
          {field.label}
        </Text>
        <DomInput
          id={`pay-collect-field-${field.id}`}
          data-testid={`pay-collect-field-${field.id}`}
          type="date"
          value={value}
          max={todayISO()}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
        />
      </View>
    </View>
  );
}

function CountryField({ field, value, onChange }: FieldProps) {
  const Theme = useTheme();
  const floating = !!value;

  return (
    <View
      style={[
        styles.fieldBox,
        {
          backgroundColor: Theme['foreground-primary'],
          borderColor: Theme['border-primary'],
        },
      ]}>
      <View style={styles.fieldContent} pointerEvents="none">
        {floating && (
          <Text variant="sm-400" color="text-secondary">
            {field.label}
          </Text>
        )}
        <Text
          variant="lg-400"
          color={value ? 'text-primary' : 'text-secondary'}
          numberOfLines={1}>
          {value ? getCountryName(value) : field.label}
        </Text>
      </View>
      <SvgCaretUpDown
        width={20}
        height={20}
        fill={Theme['icon-default']}
        style={styles.adornment}
      />
      <DomSelect
        id={`pay-collect-field-${field.id}`}
        data-testid={`pay-collect-field-${field.id}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={DOM_SELECT_OVERLAY}>
        <DomOption value="" disabled>
          {field.label}
        </DomOption>
        {COUNTRIES.map(c => (
          <DomOption key={c.code} value={c.code}>
            {c.name}
          </DomOption>
        ))}
      </DomSelect>
    </View>
  );
}

interface ConsentBoxProps {
  checked: boolean;
  onToggle: () => void;
  testID: string;
}

function ConsentBox({ checked, onToggle, testID }: ConsentBoxProps) {
  const Theme = useTheme();

  return (
    <View style={styles.consentSection}>
      <Text variant="lg-400" color="text-secondary">
        By selecting “I agree” below I have agreed to the{' '}
        <Text
          variant="lg-400"
          color="text-accent-primary"
          underline
          onPress={() => Linking.openURL(TERMS_URL)}>
          Terms and Conditions
        </Text>{' '}
        and{' '}
        <Text
          variant="lg-400"
          color="text-accent-primary"
          underline
          onPress={() => Linking.openURL(PRIVACY_URL)}>
          Privacy Policy
        </Text>
      </Text>

      <Button
        testID={testID}
        onPress={onToggle}
        style={[
          styles.consentBox,
          {
            backgroundColor: checked
              ? Theme['foreground-accent-primary-10']
              : Theme['foreground-primary'],
            borderColor: checked
              ? Theme['border-accent-primary']
              : Theme['border-primary'],
          },
        ]}>
        <Text variant="lg-400" color="text-primary" style={styles.consentLabel}>
          I agree
        </Text>
        <View
          style={[
            styles.checkbox,
            checked
              ? {
                  backgroundColor: Theme['bg-accent-primary'],
                  borderColor: Theme['bg-accent-primary'],
                }
              : { borderColor: Theme['border-secondary'] },
          ]}>
          {checked && <Checkmark width={12} height={9} />}
        </View>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    // Extra top space so the title clears the back/close buttons in the header.
    paddingTop: Spacing[8],
    paddingBottom: Spacing[5],
    gap: Spacing[6],
  },
  headerText: {
    gap: Spacing[2],
  },
  fields: {
    flex: 1,
  },
  fieldsContent: {
    gap: Spacing[2],
    paddingBottom: Spacing[2],
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    minHeight: 60,
    paddingHorizontal: Spacing[5],
    borderWidth: 1,
    borderRadius: BorderRadius[4],
  },
  fieldContent: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing['05'],
  },
  textInput: {
    padding: 0,
    margin: 0,
    fontSize: 16,
    fontFamily: FontFamily.regular,
  },
  adornment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentSection: {
    gap: Spacing[4],
    marginTop: Spacing[3],
  },
  consentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    minHeight: 64,
    paddingHorizontal: Spacing[5],
    borderWidth: 1,
    borderRadius: BorderRadius[4],
  },
  consentLabel: {
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius[2],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    marginTop: Spacing['05'],
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[4],
    borderRadius: BorderRadius[4],
  },
});
