import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import {
  forwardRef,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { BorderRadius } from '@/constants/spacing';
import { useThemeColor } from '@/hooks/use-theme-color';

export interface ModalRef {
  close: () => void;
}

interface ModalProps {
  children: ReactNode;
  onDismiss?: () => void;
}

export const Modal = forwardRef<ModalRef, ModalProps>(function InnerModal(
  { children, onDismiss },
  ref,
) {
  const sheetRef = useRef<BottomSheet>(null);
  const backgroundColor = useThemeColor('bg-primary');

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 100,
    overshootClamping: true,
    stiffness: 800,
  });

  const close = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  useImperativeHandle(ref, () => ({
    close,
  }));

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        if (onDismiss) {
          onDismiss();
        } else {
          router.back();
        }
      }
    },
    [onDismiss],
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={sheetRef}
        index={0}
        enablePanDownToClose
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        handleComponent={null}
        animationConfigs={animationConfigs}
        backgroundStyle={{
          backgroundColor,
          borderTopLeftRadius: BorderRadius['6'],
          borderTopRightRadius: BorderRadius['6'],
        }}>
        <BottomSheetView>{children}</BottomSheetView>
      </BottomSheet>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
