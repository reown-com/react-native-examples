import React, {useEffect} from 'react';
import {Platform} from 'react-native';
import {CopyURIDialog} from '../CopyURIDialog';
import Modal from 'react-native-modal';

interface CopyWCURIModalProps {
  pair: any;
  WCURI: string;
  setVisible: () => void;
  setApprovalModal: (visible: boolean) => void;
  setWCUri: (wcURI: string) => void;
  copyDialog: boolean;
  pairedProposal: any;
  approvalModal: boolean;
}

export function CopyWCURIModal({
  pairedProposal,
  pair,
  WCURI,
  setVisible,
  setApprovalModal,
  setWCUri,
  copyDialog,
  approvalModal,
}: CopyWCURIModalProps) {
  useEffect(() => {}, [copyDialog, pairedProposal, approvalModal]);

  // @notice iOS and Android had workarounds for the modal not closing properly
  if (Platform.OS === 'ios') {
    return (
      <Modal
        isVisible={copyDialog}
        backdropOpacity={0.4}
        onModalHide={() => {
          if (pairedProposal) {
            setTimeout(
              () => setApprovalModal(true),
              Platform.OS === 'ios' ? 200 : 0,
            );
          }
        }}
        backdropColor="transparent">
        <CopyURIDialog
          pair={pair}
          wcURI={WCURI}
          setVisible={setVisible}
          setApprovalModal={setApprovalModal}
          setWCUri={setWCUri}
          visible={copyDialog}
        />
      </Modal>
    );
  }

  //@notice: Android implementation
  return (
    <CopyURIDialog
      pair={pair}
      wcURI={WCURI}
      setVisible={setVisible}
      setApprovalModal={setApprovalModal}
      setWCUri={setWCUri}
      visible={copyDialog}
    />
  );
}
