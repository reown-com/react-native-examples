import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {AcceptRejectButton} from '../AcceptRejectButton';
import {Events} from '../Modal/Events';
import {Methods} from '../Modal/Methods';
import {ModalHeader} from '../Modal/ModalHeader';
import {Tag} from '../Tag';

interface PairModalProps {
  proposal: any; //ToDo: fix.
  visible: boolean;
  open: (arg0: boolean) => void;
  handleAccept: () => void;
}

/*
     @notice: Proposal Modal for initiating the pair()
     @params: proposal, visible, open, handleAccept

     Rendering
      1. ModalHeader
      2. Requested Permissions Text
      3. Chain + Methods + Events
      4. Accept/Reject Buttons
  */

export function PairModal({
  proposal,
  visible,
  open,
  handleAccept,
}: PairModalProps) {
  // Note: Current namespaces is for EIP155 only (i.e. methods, events, chains)
  const name = proposal?.params?.proposer?.metadata?.name;
  const url = proposal?.params?.proposer?.metadata.url;
  const methods = proposal?.params?.requiredNamespaces.eip155.methods;
  const events = proposal?.params?.requiredNamespaces.eip155.events;
  const chains = proposal?.params?.requiredNamespaces.eip155.chains;
  const icon = proposal?.params.proposer.metadata.icons[0];

  return (
    <Modal
      isVisible={visible}
      backdropOpacity={0.6}
      onTouchEnd={() => open(false)}>
      <View style={styles.container}>
        <View style={styles.modalContainer}>
          <ModalHeader name={name} url={url} icon={icon} />

          <View style={styles.divider} />
          <Text style={styles.permissionsText}>REQUESTED PERMISSIONS:</Text>

          <View style={styles.chainContainer}>
            <View style={styles.flexRowWrapped}>
              {chains?.map((chain: string, index: number) => {
                return (
                  <Tag key={index} value={chain.toUpperCase()} grey={true} />
                );
              })}
            </View>

            <Methods methods={methods} />
            <Events events={events} />
          </View>

          <View style={styles.flexRow}>
            <AcceptRejectButton
              accept={false}
              onPress={() => console.log('reject')}
            />
            <AcceptRejectButton accept={true} onPress={handleAccept} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flex: 1,
    flexDirection: 'row',
  },
  flexRowWrapped: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 34,
    backgroundColor: 'rgba(242, 242, 247, 0.8)',
    width: '100%',
    paddingTop: 30,
    minHeight: '70%',
    position: 'absolute',
    bottom: 44,
  },
  imageRowContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  rejectButton: {
    color: 'red',
  },
  dappTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  wouldLikeToConnectText: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    opacity: 0.6,
  },

  permissionsText: {
    // paddingTop: 8,
    color: 'rgba(60, 60, 67, 0.6)',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    paddingBottom: 8,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginBottom: 8,
  },
  WCLogoLeft: {
    width: 60,
    height: 60,
    borderRadius: 30,
    right: -30,
    top: -8,
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  WCLogoRight: {
    width: 60,
    height: 60,
    borderRadius: 8,
    left: -30,
    top: -8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emojiContainer: {
    opacity: 0.8, //ToDo: Fix Transtion later
    width: 290,
    height: 44,
    borderRadius: 8,
    marginBottom: 8,
  },
  chainContainer: {
    width: '90%',
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(80, 80, 89, 0.1)',
  },
  methodsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodEventsTitle: {
    color: 'rgba(121, 134, 134, 1)',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    paddingLeft: 6,
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(60, 60, 67, 0.36)',
    marginVertical: 16,
  },
});
