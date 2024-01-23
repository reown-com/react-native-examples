import React, {useCallback, useMemo} from 'react';
import RNModal from 'react-native-modal';
import {useSnapshot} from 'valtio';
import ModalStore from '../store/ModalStore';
import SessionProposalModal from '../composites/SessionProposalModal';
import SessionSignModal from '../composites/SessionSignModal';
import SessionSendTransactionModal from '../composites/SessionSendTransactionModal';
import SessionSignTypedDataModal from '../composites/SessionSignTypedDataModal';
import {View} from 'react-native';

export default function Modal() {
  const {open, view} = useSnapshot(ModalStore.state);
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
      // case 'SessionUnsuportedMethodModal':
      //   return <SessionUnsuportedMethodModal />;
      // case 'AuthRequestModal':
      //   return <AuthRequestModal />;
      // case 'LoadingModal':
      //   return <LoadingModal />;
      default:
        return <View />;
    }
  }, [view]);

  return (
    <RNModal
      backdropOpacity={0.6}
      hideModalContentWhileAnimating
      onModalHide={onClose}
      isVisible={open}>
      {componentView}
    </RNModal>
  );
}
