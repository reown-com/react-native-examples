import React from 'react';
import {View, StyleSheet} from 'react-native';
import {CircleActionButton} from '../CircleActionButton';
import QRCodeSvg from '../../assets/QRCode';
import CopySvg from '../../assets/Copy';

interface IndividualSessionProps {
  setCopyDialog: (visible: boolean) => void;
}

const ActionButtons = ({setCopyDialog}: IndividualSessionProps) => {
  return (
    <View style={styles.absoluteFlexRow}>
      <CircleActionButton
        onPress={() => {
          setCopyDialog(true);
        }}>
        <CopySvg />
      </CircleActionButton>
      <CircleActionButton onPress={() => {}}>
        <QRCodeSvg />
      </CircleActionButton>
    </View>
  );
};

export default ActionButtons;

const styles = StyleSheet.create({
  absoluteFlexRow: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 20,
  },
});
