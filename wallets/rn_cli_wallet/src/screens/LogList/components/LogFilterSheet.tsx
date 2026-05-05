import { Pressable, StyleSheet, View } from 'react-native';
import RNModal from 'react-native-modal';

import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import SvgClose from '@/assets/Close';

export type LogSource = 'all' | 'app' | 'walletkit';

const options: { value: LogSource; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'app', label: 'App' },
  { value: 'walletkit', label: 'WalletKit' },
];

interface LogFilterSheetProps {
  visible: boolean;
  selected: LogSource;
  onSelect: (source: LogSource) => void;
  onClose: () => void;
}

export function LogFilterSheet({
  visible,
  selected,
  onSelect,
  onClose,
}: LogFilterSheetProps) {
  const Theme = useTheme();

  return (
    <RNModal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.7}
      useNativeDriver
      statusBarTranslucent
      style={styles.modal}
    >
      <View style={[styles.sheet, { backgroundColor: Theme['bg-primary'] }]}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text variant="h6-400" color="text-primary" style={styles.title}>
            Filter
          </Text>
          <Button
            onPress={onClose}
            style={[
              styles.closeButton,
              { borderColor: Theme['border-secondary'] },
            ]}
          >
            <SvgClose width={14} height={14} fill={Theme['text-primary']} />
          </Button>
        </View>
        <View style={styles.list}>
          {options.map(option => {
            const isSelected = option.value === selected;
            return (
              <Pressable
                key={option.value}
                onPress={() => onSelect(option.value)}
                style={[
                  styles.item,
                  //eslint-disable-next-line react-native/no-inline-styles
                  {
                    backgroundColor: isSelected
                      ? Theme['foreground-accent-primary-10']
                      : Theme['foreground-primary'],
                    borderColor: isSelected
                      ? Theme['bg-accent-primary']
                      : 'transparent',
                  },
                ]}
              >
                <Text variant="lg-400" color="text-primary">
                  {option.label}
                </Text>
                {isSelected && (
                  <View
                    style={[
                      styles.radioOuter,
                      { borderColor: Theme['icon-accent-primary'] },
                    ]}
                  >
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: Theme['icon-accent-primary'] },
                      ]}
                    />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </RNModal>
  );
}

const FILTER_LABELS: Record<LogSource, string> = {
  all: 'All',
  app: 'App',
  walletkit: 'WalletKit',
};

export function getFilterLabel(source: LogSource): string {
  return FILTER_LABELS[source];
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius[8],
    borderTopRightRadius: BorderRadius[8],
    padding: Spacing[5],
    gap: Spacing[7],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 38,
    height: 38,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius[3],
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: Spacing[2],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 68,
    paddingHorizontal: Spacing[5],
    borderRadius: BorderRadius[4],
    borderWidth: 1,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
});
