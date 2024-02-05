import React from 'react';
import {View, StyleSheet} from 'react-native';
import {CircleActionButton} from '../CircleActionButton';
import QRCodeSvg from '../../assets/QRCode';
import CopySvg from '../../assets/Copy';
import {useNavigation} from '@react-navigation/native';

interface IndividualSessionProps {
  setCopyDialog: (visible: boolean) => void;
}

const ActionButtons = ({setCopyDialog}: IndividualSessionProps) => {
  const navigation = useNavigation();
  return (
    <View style={styles.absoluteFlexRow}>
      <CircleActionButton
        onPress={() => {
          setCopyDialog(true);
        }}>
        <CopySvg />
      </CircleActionButton>
      <CircleActionButton
        onPress={() => {
          navigation.navigate('Scan');
        }}>
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
