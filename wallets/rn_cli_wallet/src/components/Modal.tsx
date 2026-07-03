import { useSnapshot } from 'valtio';
import { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import RNModal from 'react-native-modal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ModalStore from '@/store/ModalStore';
import { Spacing } from '@/utils/ThemeUtil';
import { DesktopFrame } from '@/constants/DesktopFrame';
import SessionProposalModal from '@/modals/SessionProposalModal';
import SessionSignModal from '@/modals/SessionSignModal';
import SessionSendTransactionModal from '@/modals/SessionSendTransactionModal';
import SessionSignTypedDataModal from '@/modals/SessionSignTypedDataModal';
import { LoadingModal } from '@/modals/LoadingModal';
import SessionAuthenticateModal from '@/modals/SessionAuthenticateModal';
import SessionSignSuiPersonalMessageModal from '@/modals/SessionSuiSignPersonalMessageModal';
import SessionSignSuiTransactionModal from '@/modals/SessionSuiSignTransactionModal';
import SessionSignAndExecuteSuiTransactionModal from '@/modals/SessionSuiSignAndExecuteTransactionModal';
import SessionTonSendMessageModal from '@/modals/SessionTonSendMessageModal';
import SessionTonSignDataModal from '@/modals/SessionTonSignDataModal';
import SessionSignTronModal from '@/modals/SessionSignTronModal';
import SessionSignCantonModal from '@/modals/SessionSignCantonModal';
import SessionSolanaSignMessageModal from '@/modals/SessionSolanaSignMessageModal';
import SessionSolanaSignTransactionModal from '@/modals/SessionSolanaSignTransactionModal';
import PaymentOptionsModal from '@/modals/PaymentOptionsModal';
import ImportWalletModal from '@/modals/ImportWalletModal';
import SessionDetailModal from '@/modals/SessionDetailModal';
import ScannerOptionsModal from '@/modals/ScannerOptionsModal';

export default function Modal() {
  const { open, view } = useSnapshot(ModalStore.state);
  const insets = useSafeAreaInsets();
  const gestureRootStyle = useMemo(
    () => [
      styles.gestureRoot,
      Platform.OS === 'android' && insets.bottom > 0
        ? { paddingBottom: insets.bottom }
        : null,
    ],
    [insets.bottom],
  );
  // handle the modal being closed by click outside
  const onClose = useCallback(() => {
    if (open) {
      ModalStore.close();
    }
  }, [open]);

  const componentView = useMemo(() => {
    switch (view) {
      case 'SessionProposalModal':
        return <SessionProposalModal />;
      case 'SessionSignModal':
        return <SessionSignModal />;
      case 'SessionSignTypedDataModal':
        return <SessionSignTypedDataModal />;
      case 'SessionSendTransactionModal':
        return <SessionSendTransactionModal />;
      case 'SessionAuthenticateModal':
        return <SessionAuthenticateModal />;
      case 'LoadingModal':
        return <LoadingModal />;
      case 'SessionSuiSignTransactionModal':
        return <SessionSignSuiTransactionModal />;
      case 'SessionSuiSignPersonalMessageModal':
        return <SessionSignSuiPersonalMessageModal />;
      case 'SessionSuiSignAndExecuteTransactionModal':
        return <SessionSignAndExecuteSuiTransactionModal />;
      case 'SessionTonSendMessageModal':
        return <SessionTonSendMessageModal />;
      case 'SessionTonSignDataModal':
        return <SessionTonSignDataModal />;
      case 'SessionSignTronModal':
        return <SessionSignTronModal />;
      case 'SessionSignCantonModal':
        return <SessionSignCantonModal />;
      case 'SessionSolanaSignMessageModal':
        return <SessionSolanaSignMessageModal />;
      case 'SessionSolanaSignTransactionModal':
        return <SessionSolanaSignTransactionModal />;
      case 'PaymentOptionsModal':
        return <PaymentOptionsModal />;
      case 'ImportWalletModal':
        return <ImportWalletModal />;
      case 'SessionDetailModal':
        return <SessionDetailModal />;
      case 'ScannerOptionsModal':
        return <ScannerOptionsModal />;
      default:
        return <View />;
    }
  }, [view]);

  return (
    <RNModal
      backdropOpacity={0.6}
      backdropTransitionOutTiming={1}
      hideModalContentWhileAnimating
      useNativeDriver
      statusBarTranslucent
      propagateSwipe
      onBackdropPress={onClose}
      style={[styles.modal, Platform.OS === 'web' ? styles.modalWeb : null]}
      // On web, render inline (not via the full-screen portal) so the sheet +
      // backdrop stay inside the desktop frame and get clipped to its rounded
      // bottom corners instead of overflowing to the viewport edge.
      coverScreen={Platform.OS !== 'web'}
      isVisible={open}
    >
      <GestureHandlerRootView style={gestureRootStyle}>
        {componentView}
      </GestureHandlerRootView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: Spacing[0],
  },
  // On web, constrain the sheet to the desktop frame width and center it so it
  // doesn't stretch full-viewport. Self-adjusts: fills the width on narrow
  // screens, caps + centers on wide desktop. With coverScreen=false the backdrop
  // dims only the frame area (its parent), not the full page.
  modalWeb: {
    width: '100%',
    maxWidth: DesktopFrame.DEVICE_WIDTH,
    alignSelf: 'center',
  },
  gestureRoot: {
    flex: 1,
    margin: Spacing[0],
    justifyContent: 'flex-end',
  },
});
