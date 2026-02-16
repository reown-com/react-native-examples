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
  | 'collectData'
  | 'confirm'
  | 'confirming'
  | 'result';

interface ViewWrapperProps {
  children: React.ReactNode;
  step: Step;
  isWebView: boolean;
  showBackButton: boolean;
  onBack: () => void;
  onClose: () => void;
  headerLeftContent?: React.ReactNode;
}

const ANIMATION_DURATION = 250;

export function ViewWrapper({
  children,
  step,
  isWebView,
  showBackButton,
  onBack,
  onClose,
  headerLeftContent,
}: ViewWrapperProps) {
  const Theme = useTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <>
      {/* Header */}
      <View style={[styles.header, isWebView && styles.webViewHeader]}>
        <View style={headerLeftContent ? styles.headerLeftFlex : styles.headerLeft}>
          {showBackButton ? (
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
          ) : headerLeftContent ? (
            headerLeftContent
          ) : null}
        </View>

        {/* Spacer */}
        <View style={styles.headerCenter} />

        {/* Close Button */}
        <View style={styles.headerRight}>
          <ModalCloseButton onPress={onClose} />
        </View>
      </View>

      {/* Animated Content */}
      <Animated.View
        key={step}
        style={isWebView ? styles.webViewContent : undefined}
        entering={FadeIn.duration(ANIMATION_DURATION)}
        exiting={FadeOut.duration(ANIMATION_DURATION)}
      >
        {children}
      </Animated.View>
    </>
  );

  if (isWebView) {
    return (
      <View
        style={[
          styles.fullscreenContainer,
          { backgroundColor: Theme['bg-primary'], paddingTop: insets.top, paddingBottom: insets.bottom },
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
  headerLeftFlex: {
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
