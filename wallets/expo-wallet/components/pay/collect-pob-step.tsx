import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRef, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { Button } from '@/components/primitives/button';
import { Text } from '@/components/primitives/text';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { TextInput } from 'react-native-gesture-handler';

interface CollectPobStepProps {
  initialCity?: string;
  initialCountry?: string;
  onContinue: (city: string, country: string) => void;
}

export function CollectPobStep({
  initialCity = '',
  initialCountry = '',
  onContinue,
}: CollectPobStepProps) {
  const [city, setCity] = useState(initialCity);
  const [country, setCountry] = useState(initialCountry);
  const [focusedField, setFocusedField] = useState<'city' | 'country' | null>(
    null,
  );

  const inputBackgroundColor = useThemeColor('foreground-primary');
  const inputBorderColor = useThemeColor('border-primary');
  const focusedBorderColor = useThemeColor('border-accent-primary');
  const placeholderColor = useThemeColor('text-secondary');
  const textColor = useThemeColor('text-primary');
  const buttonColor = useThemeColor('bg-accent-primary');
  const buttonDisabledColor = useThemeColor('foreground-tertiary');

  const countryRef = useRef<TextInput>(null);

  const isValid = city.trim().length > 0 && country.trim().length > 0;

  const handleContinue = () => {
    if (isValid) {
      // Dismiss keyboard since next step (confirm) has no text inputs
      Keyboard.dismiss();
      onContinue(city.trim(), country.trim());
    }
  };

  return (
    <View style={styles.container}>
      <Text fontSize={20} lineHeight={24} center type="defaultSemiBold">
        What is your place of birth?
      </Text>

      <View style={styles.inputsContainer}>
        <BottomSheetTextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBackgroundColor,
              borderColor:
                focusedField === 'city' ? focusedBorderColor : inputBorderColor,
              color: textColor,
            },
          ]}
          placeholder="City"
          placeholderTextColor={placeholderColor}
          value={city}
          onChangeText={setCity}
          onFocus={() => setFocusedField('city')}
          onBlur={() => {
            setFocusedField(null);
          }}
          onSubmitEditing={() => {
            setFocusedField('country');
            countryRef.current?.focus();
          }}
          autoCapitalize="words"
          autoFocus
          returnKeyType="next"
        />

        <BottomSheetTextInput
          style={[
            styles.input,
            {
              backgroundColor: inputBackgroundColor,
              borderColor:
                focusedField === 'country'
                  ? focusedBorderColor
                  : inputBorderColor,
              color: textColor,
            },
          ]}
          placeholder="Country"
          placeholderTextColor={placeholderColor}
          value={country}
          ref={countryRef}
          onChangeText={setCountry}
          onFocus={() => setFocusedField('country')}
          onBlur={() => setFocusedField(null)}
          autoCapitalize="words"
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
