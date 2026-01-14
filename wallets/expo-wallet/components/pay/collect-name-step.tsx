import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/primitives/button';
import { Text } from '@/components/primitives/text';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { TextInput } from 'react-native-gesture-handler';

interface CollectNameStepProps {
  initialFirstName?: string;
  initialLastName?: string;
  onContinue: (firstName: string, lastName: string) => void;
}

export function CollectNameStep({
  initialFirstName = '',
  initialLastName = '',
  onContinue,
}: CollectNameStepProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [focusedField, setFocusedField] = useState<'first' | 'last' | null>(
    null,
  );

  const inputBackgroundColor = useThemeColor('foreground-primary');
  const inputBorderColor = useThemeColor('border-primary');
  const focusedBorderColor = useThemeColor('border-accent-primary');
  const placeholderColor = useThemeColor('text-secondary');
  const textColor = useThemeColor('text-primary');
  const buttonColor = useThemeColor('bg-accent-primary');
  const buttonDisabledColor = useThemeColor('foreground-tertiary');

  const lastNameRef = useRef<TextInput>(null);

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleContinue = () => {
    if (isValid) {
      onContinue(firstName.trim(), lastName.trim());
    }
  };

  return (
    <View style={styles.container}>
      <Text fontSize={20} lineHeight={24} center type="defaultSemiBold">
        What&apos;s your name?
      </Text>

      <View style={styles.inputsContainer}>
        <BottomSheetTextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBackgroundColor,
              borderColor:
                focusedField === 'first'
                  ? focusedBorderColor
                  : inputBorderColor,
              color: textColor,
            },
          ]}
          placeholder="First name"
          placeholderTextColor={placeholderColor}
          value={firstName}
          onChangeText={setFirstName}
          onFocus={() => setFocusedField('first')}
          onBlur={() => {
            setFocusedField(null);
          }}
          onSubmitEditing={() => {
            setFocusedField('last');
            lastNameRef.current?.focus();
          }}
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          autoFocus
          returnKeyType="next"
        />

        <BottomSheetTextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBackgroundColor,
              borderColor:
                focusedField === 'last' ? focusedBorderColor : inputBorderColor,
              color: textColor,
            },
          ]}
          placeholder="Last name"
          placeholderTextColor={placeholderColor}
          value={lastName}
          ref={lastNameRef}
          onChangeText={setLastName}
          onFocus={() => setFocusedField('last')}
          onBlur={() => setFocusedField(null)}
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />
      </View>

      <Button
        onPress={handleContinue}
        type="primary"
        text="Continue"
        style={[
          styles.button,
          {
            backgroundColor: isValid ? buttonColor : buttonDisabledColor,
          },
        ]}
        disabled={!isValid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing['spacing-5'],
    gap: Spacing['spacing-5'],
  },
  inputsContainer: {
    gap: Spacing['spacing-3'],
  },
  input: {
    height: 56,
    borderRadius: BorderRadius['4'],
    borderWidth: 1,
    paddingHorizontal: Spacing['spacing-4'],
    fontSize: 16,
    fontFamily: 'KH Teka',
  },
  button: {
    marginTop: Spacing['spacing-2'],
  },
});
