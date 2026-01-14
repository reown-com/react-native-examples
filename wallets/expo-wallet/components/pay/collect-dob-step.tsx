import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRef, useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import type { TextInput } from 'react-native-gesture-handler';
import { Button } from '@/components/primitives/button';
import { Text } from '@/components/primitives/text';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

interface CollectDobStepProps {
  initialDate?: Date;
  onContinue: (dateOfBirth: Date) => void;
}

export function CollectDobStep({
  initialDate,
  onContinue,
}: CollectDobStepProps) {
  // Default to 25 years ago if no initial date
  const defaultDate =
    initialDate || new Date(Date.now() - 25 * 365 * 24 * 60 * 60 * 1000);

  const [year, setYear] = useState(
    initialDate ? String(defaultDate.getFullYear()) : '',
  );
  const [month, setMonth] = useState(
    initialDate ? String(defaultDate.getMonth() + 1).padStart(2, '0') : '',
  );
  const [day, setDay] = useState(
    initialDate ? String(defaultDate.getDate()).padStart(2, '0') : '',
  );

  const monthRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);

  const backgroundColor = useThemeColor('foreground-primary');
  const textColor = useThemeColor('text-primary');
  const placeholderColor = useThemeColor('text-tertiary');
  const separatorColor = useThemeColor('text-tertiary');
  const buttonColor = useThemeColor('bg-accent-primary');
  const buttonDisabledColor = useThemeColor('foreground-tertiary');

  const validateDate = useCallback((): Date | null => {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);

    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    if (year.length !== 4) return null;
    if (m < 1 || m > 12) return null;
    if (d < 1 || d > 31) return null;

    const date = new Date(y, m - 1, d);

    // Check if the date is valid (handles invalid dates like Feb 30)
    if (
      date.getFullYear() !== y ||
      date.getMonth() !== m - 1 ||
      date.getDate() !== d
    ) {
      return null;
    }

    // Check age constraints (18-120 years old)
    const today = new Date();
    const minAge = new Date(today);
    minAge.setFullYear(today.getFullYear() - 18);
    const maxAge = new Date(today);
    maxAge.setFullYear(today.getFullYear() - 120);

    if (date > minAge || date < maxAge) return null;

    return date;
  }, [year, month, day]);

  const isValid = validateDate() !== null;

  const handleYearChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    setYear(cleaned);
    if (cleaned.length === 4) {
      monthRef.current?.focus();
    }
  };

  const handleMonthChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 2);
    setMonth(cleaned);
    if (cleaned.length === 2) {
      dayRef.current?.focus();
    }
  };

  const handleDayChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 2);
    setDay(cleaned);
  };

  const handleContinue = () => {
    const date = validateDate();
    if (date) {
      onContinue(date);
    }
  };

  return (
    <View style={styles.container}>
      <Text fontSize={20} lineHeight={24} center type="defaultSemiBold">
        What&apos;s your date of birth?
      </Text>

      <View style={[styles.inputContainer, { backgroundColor }]}>
        <BottomSheetTextInput
          style={[styles.input, styles.yearInput, { color: textColor }]}
          value={year}
          onChangeText={handleYearChange}
          placeholder="YYYY"
          placeholderTextColor={placeholderColor}
          keyboardType="number-pad"
          maxLength={4}
          returnKeyType="next"
          autoFocus
          onSubmitEditing={() => monthRef.current?.focus()}
        />
        <Text style={[styles.separator, { color: separatorColor }]}>/</Text>
        <BottomSheetTextInput
          ref={monthRef}
          style={[styles.input, styles.monthDayInput, { color: textColor }]}
          value={month}
          onChangeText={handleMonthChange}
          placeholder="MM"
          placeholderTextColor={placeholderColor}
          keyboardType="number-pad"
          maxLength={2}
          returnKeyType="next"
          onSubmitEditing={() => dayRef.current?.focus()}
        />
        <Text style={[styles.separator, { color: separatorColor }]}>/</Text>
        <BottomSheetTextInput
          ref={dayRef}
          style={[styles.input, styles.monthDayInput, { color: textColor }]}
          value={day}
          onChangeText={handleDayChange}
          placeholder="DD"
          placeholderTextColor={placeholderColor}
          keyboardType="number-pad"
          maxLength={2}
          returnKeyType="done"
          onSubmitEditing={isValid ? handleContinue : undefined}
        />
      </View>

      <Button
        onPress={handleContinue}
        type="primary"
        text="Continue"
        style={[
          styles.button,
          { backgroundColor: isValid ? buttonColor : buttonDisabledColor },
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius['4'],
    paddingVertical: Spacing['spacing-5'],
    paddingHorizontal: Spacing['spacing-4'],
  },
  input: {
    fontSize: 16,
    fontFamily: 'KHTeka-Medium',
    textAlign: 'center',
  },
  yearInput: {
    width: 80,
  },
  monthDayInput: {
    width: 50,
  },
  separator: {
    fontSize: 16,
    marginHorizontal: Spacing['spacing-2'],
  },
  button: {
    marginTop: Spacing['spacing-2'],
  },
});
