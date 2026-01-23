import { StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { BorderRadius } from '@/utils/ThemeUtil';
import Checkmark from '@/assets/Checkmark';
import { Button } from '@/components/Button';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
}

export function Checkbox({ checked, onPress }: CheckboxProps) {
  const Theme = useTheme();
  return (
    <Button
      onPress={onPress}
      style={[
        styles.checkbox,
        checked
          ? {
              backgroundColor: Theme['bg-accent-primary'],
              borderColor: Theme['bg-accent-primary'],
            }
          : { borderColor: Theme['border-secondary'] },
      ]}
    >
      {checked && <Checkmark width={12} height={9} />}
    </Button>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius[2],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
