import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import CaretUpDown from '@/assets/CaretUpDown';
import Checkmark from '@/assets/Checkmark';

export interface NetworkDropdownOption<T extends string> {
  label: T;
  chainId: string;
}

interface NetworkDropdownProps<T extends string> {
  options: readonly NetworkDropdownOption<T>[];
  selected: T;
  onSelect: (label: T) => void;
  // Optional controlled open state. When provided, the parent owns whether the
  // list is expanded (e.g. to close it when another field gains focus).
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NetworkDropdown<T extends string>({
  options,
  selected,
  onSelect,
  isOpen,
  onOpenChange,
}: NetworkDropdownProps<T>) {
  const Theme = useTheme();
  const [internalOpen, setInternalOpen] = useState(false);

  const expanded = isOpen ?? internalOpen;
  const setExpanded = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  const selectedOption =
    options.find(option => option.label === selected) ?? options[0];

  const handleSelect = (label: T) => {
    onSelect(label);
    setExpanded(false);
  };

  return (
    <View style={styles.wrapper}>
      <Button
        style={[
          styles.control,
          {
            backgroundColor: Theme['bg-primary'],
            borderColor: Theme['foreground-tertiary'],
          },
        ]}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.chainInfo}>
          <Image
            source={PresetsUtil.getChainIconById(selectedOption.chainId)}
            style={[
              styles.chainLogo,
              { backgroundColor: Theme['foreground-tertiary'] },
            ]}
          />
          <Text variant="md-400" color="text-primary">
            {selectedOption.label}
          </Text>
        </View>
        <CaretUpDown width={20} height={20} fill={Theme['text-secondary']} />
      </Button>

      {expanded && (
        <View
          style={[
            styles.list,
            {
              backgroundColor: Theme['bg-primary'],
              borderColor: Theme['foreground-tertiary'],
            },
          ]}
        >
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            nestedScrollEnabled
          >
            {options.map(option => {
              const isSelected = option.label === selected;
              return (
                <Button
                  key={option.label}
                  style={styles.row}
                  onPress={() => handleSelect(option.label)}
                >
                  <View style={styles.chainInfo}>
                    <Image
                      source={PresetsUtil.getChainIconById(option.chainId)}
                      style={[
                        styles.chainLogo,
                        { backgroundColor: Theme['foreground-tertiary'] },
                      ]}
                    />
                    <Text variant="md-400" color="text-primary">
                      {option.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <Checkmark
                      width={16}
                      height={16}
                      fill={Theme['icon-accent-primary']}
                    />
                  )}
                </Button>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius[3],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
  },
  list: {
    borderWidth: 1,
    borderRadius: BorderRadius[3],
    marginTop: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
  },
  scroll: {
    maxHeight: 240,
  },
  listContent: {
    gap: Spacing[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[2],
  },
  chainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  chainLogo: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
  },
});
