import { BorderRadius, Spacing } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/primitives/button';

interface PayHeaderProps {
  currentStep: number;
  totalSteps: number;
  showBack?: boolean;
  showSteps?: boolean;
  onBack?: () => void;
  onClose: () => void;
}

export function PayHeader({
  currentStep,
  totalSteps,
  showBack = false,
  showSteps = false,
  onBack,
  onClose,
}: PayHeaderProps) {
  const borderColor = useThemeColor('border-secondary');
  const tintColor = useThemeColor('icon-inverse');
  const activeDotColor = useThemeColor('bg-accent-primary');
  const inactiveDotColor = useThemeColor('border-secondary');

  return (
    <View style={styles.container}>
      {/* Back button */}
      <View style={styles.leftContainer}>
        {showBack && onBack && (
          <Button onPress={onBack} hitSlop={10} style={styles.iconButton}>
            <Image
              source={require('@/assets/icons/arrow-left.png')}
              style={[styles.backIcon, { tintColor }]}
            />
          </Button>
        )}
      </View>

      {/* Progress dots */}
      {totalSteps > 0 && showSteps && (
        <View style={styles.progressContainer}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    index < currentStep ? activeDotColor : inactiveDotColor,
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Close button */}
      <View style={styles.rightContainer}>
        <Button
          onPress={onClose}
          hitSlop={10}
          style={[styles.iconButton, { borderColor }]}>
          <Image
            source={require('@/assets/icons/close.png')}
            style={[styles.closeIcon, { tintColor }]}
          />
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['spacing-5'],
    paddingVertical: Spacing['spacing-4'],
  },
  leftContainer: {
    width: 38,
    height: 38,
  },
  rightContainer: {
    width: 38,
    height: 38,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    width: 38,
  },
  backIcon: {
    width: 38,
    height: 38,
  },
  closeIcon: {
    width: 13,
    height: 13,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['spacing-1'],
  },
  progressDot: {
    height: 6,
    width: 40,
    borderRadius: BorderRadius.full,
  },
});
