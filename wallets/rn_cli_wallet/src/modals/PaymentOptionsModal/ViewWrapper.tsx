import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import SvgArrowLeft from '@/assets/ArrowLeft';
import SvgClose from '@/assets/Close';

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
    <View style={[styles.container, { backgroundColor: Theme['bg-100'] }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <View style={styles.headerLeft}>
          {showBackButton && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <SvgArrowLeft width={38} height={38} fill={Theme['fg-100']} />
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
                        ? Theme['accent-100']
                        : Theme['bg-300'],
                  },
                ]}
              />
              <View
                style={[
                  styles.stepPill,
                  {
                    backgroundColor:
                      currentPillIndex >= 1
                        ? Theme['accent-100']
                        : Theme['bg-300'],
                  },
                ]}
              />
            </View>
          )}
        </View>

        {/* Close Button */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <SvgClose width={38} height={38} fill={Theme['fg-100']} />
          </TouchableOpacity>
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
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingTop: 16,
    paddingBottom: 30,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  iconButton: {
    padding: 0,
  },
  stepsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  stepPill: {
    width: 36,
    height: 6,
    borderRadius: 100,
  },
});
