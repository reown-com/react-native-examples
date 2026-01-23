import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import SvgArrowLeft from '@/assets/ArrowLeft';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { ModalCloseButton } from '@/components/ModalCloseButton';

type Step =
  | 'loading'
  | 'intro'
  | 'collectData'
  | 'confirm'
  | 'confirming'
  | 'result';

interface ViewWrapperProps {
  children: React.ReactNode;
  step: Step;
  hasCollectData?: boolean;
  showBackButton: boolean;
  onBack: () => void;
  onClose: () => void;
}

const ANIMATION_DURATION = 250;

export function ViewWrapper({
  children,
  step,
  hasCollectData = false,
  showBackButton,
  onBack,
  onClose,
}: ViewWrapperProps) {
  const Theme = useTheme();

  // Determine if we should show step pills
  const showStepPills =
    hasCollectData && (step === 'collectData' || step === 'confirm');
  const currentPillIndex =
    step === 'collectData' ? 0 : step === 'confirm' ? 1 : -1;

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <View style={styles.headerLeft}>
          {showBackButton && (
            <TouchableOpacity
              onPress={onBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <SvgArrowLeft
                width={38}
                height={38}
                fill={Theme['text-primary']}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Step Pills */}
        <View style={styles.headerCenter}>
          {showStepPills && (
            <View style={styles.stepsContainer}>
              <View
                style={[
                  styles.stepPill,
                  {
                    backgroundColor:
                      currentPillIndex >= 0
                        ? Theme['bg-accent-primary']
                        : Theme['foreground-tertiary'],
                  },
                ]}
              />
              <View
                style={[
                  styles.stepPill,
                  {
                    backgroundColor:
                      currentPillIndex >= 1
                        ? Theme['bg-accent-primary']
                        : Theme['foreground-tertiary'],
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* Close Button */}
        <View style={styles.headerRight}>
          <ModalCloseButton onPress={onClose} />
        </View>
      </View>

      {/* Animated Content */}
      <Animated.View
        key={step}
        entering={FadeIn.duration(ANIMATION_DURATION)}
        exiting={FadeOut.duration(ANIMATION_DURATION)}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: BorderRadius[8],
    borderTopRightRadius: BorderRadius[8],
    padding: Spacing[5],
    paddingBottom: Spacing[8],
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[5],
  },
  headerLeft: {
    width: 38,
    height: 38,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 38,
    height: 38,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  stepPill: {
    width: Spacing[9],
    height: 6,
    borderRadius: BorderRadius.full,
  },
});
