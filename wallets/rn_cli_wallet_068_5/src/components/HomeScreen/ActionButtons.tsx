import React from 'react';
import {View, StyleSheet} from 'react-native';
import {CircleActionButton} from '../CircleActionButton';

interface IndividualSessionProps {
  setCopyDialog: (arg0: boolean) => void;
}

const ActionButtons = ({setCopyDialog}: IndividualSessionProps) => {
  return (
    <View style={styles.absoluteFlexRow}>
      <CircleActionButton
        copyImage={true}
        handlePress={() => {
          setCopyDialog(true);
        }}
      />
      {/* // ToDo: Add in after QRCode Module is complete */}
      {/* <CircleActionButton
        copyImage={false}
        handlePress={() => setApprovalModal(true)}
      /> */}
    </View>
  );
};

export default ActionButtons;

const styles = StyleSheet.create({
  absoluteFlexRow: {
    position: 'absolute',
    bottom: 50,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
  },
});
