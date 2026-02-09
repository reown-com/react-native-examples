import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import SvgArrowLeft from '@/assets/ArrowLeft';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { ModalCloseButton } from '@/components/ModalCloseButton';
import { Button } from '@/components/Button';

type Step =
  | 'loading'
  | 'intro'
  | 'collectData'
  | 'collectDataWebView'
  | 'confirm'
  | 'confirming'
  | 'result';

interface ViewWrapperProps {
  children: React.ReactNode;
  step: Step;
  showBackButton: boolean;
  onBack: () => void;
  onClose: () => void;
}

const ANIMATION_DURATION = 250;

export function ViewWrapper({
  children,
  step,
  showBackButton,
  onBack,
  onClose,
}: ViewWrapperProps) {
  const Theme = useTheme();
  const insets = useSafeAreaInsets();

  const isWebViewStep = step === 'collectDataWebView';

  const content = (
    <>
      {/* Header */}
      <View style={[styles.header, isWebViewStep && styles.webViewHeader]}>
        {/* Back Button - hidden in WebView step since X handles back */}
        <View style={styles.headerLeft}>
          {showBackButton && !isWebViewStep && (
            <Button
              onPress={onBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <SvgArrowLeft
                width={38}
                height={38}
                fill={Theme['text-primary']}
              />
            </Button>
          )}
        </View>

        {/* Spacer */}
        <View style={styles.headerCenter} />

        {/* Close Button - in WebView step, X goes back instead of closing */}
        <View style={styles.headerRight}>
          <ModalCloseButton onPress={isWebViewStep ? onBack : onClose} />
        </View>
      </View>

      {/* Animated Content */}
      <Animated.View
        key={step}
        style={
          step === 'collectDataWebView' ? styles.webViewContent : undefined
        }
        entering={FadeIn.duration(ANIMATION_DURATION)}
        exiting={FadeOut.duration(ANIMATION_DURATION)}
      >
        {children}
      </Animated.View>
    </>
  );

  if (isWebViewStep) {
    return (
      <View
        style={[
          styles.fullscreenContainer,
          { backgroundColor: Theme['bg-primary'], paddingTop: insets.top },
        ]}
      >
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      {content}
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
  fullscreenContainer: {
    flex: 1,
  },
  webViewContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[5],
  },
  webViewHeader: {
    marginBottom: Spacing[2],
    paddingHorizontal: Spacing[3],
  },
  headerLeft: {
    width: 38,
    height: 38,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  headerRight: {
    width: 38,
    height: 38,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
