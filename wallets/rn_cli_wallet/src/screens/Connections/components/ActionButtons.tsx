import { View, StyleSheet, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { CircleActionButton } from '@/components/CircleActionButton';
import QRCodeSvg from '@/assets/QRCode';
import CopySvg from '@/assets/Copy';
import NfcIcon from '@/assets/NfcIcon';
import { useNfcReader } from '@/hooks/useNfcReader';

interface IndividualSessionProps {
  setCopyDialog: (visible: boolean) => void;
  onNfcUri?: (uri: string) => void;
}

const ActionButtons = ({ setCopyDialog, onNfcUri }: IndividualSessionProps) => {
  const navigation = useNavigation();
  const { isSupported, isEnabled, isScanning, startScan, openSettings } =
    useNfcReader();

  const handleNfcPress = async () => {
    if (!isSupported) {
      Alert.alert('NFC Not Supported', 'This device does not support NFC.');
      return;
    }

    if (!isEnabled) {
      Alert.alert(
        'NFC Disabled',
        'Please enable NFC in your device settings to use tap-to-pay.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSettings },
        ],
      );
      return;
    }

    if (isScanning) {
      return;
    }

    if (Platform.OS === 'ios') {
      Alert.alert('Ready to Scan', 'Hold your phone near the POS terminal.');
    }

    const uri = await startScan();
    if (uri && onNfcUri) {
      onNfcUri(uri);
    }
  };

  const showNfcButton = Platform.OS === 'android' || isSupported;

  return (
    <View style={styles.absoluteFlexRow}>
      <CircleActionButton
        onPress={() => {
          setCopyDialog(true);
        }}
      >
        <CopySvg />
      </CircleActionButton>
      {showNfcButton && (
        <CircleActionButton onPress={handleNfcPress} disabled={isScanning}>
          <NfcIcon color={isScanning ? '#666666' : '#FFFFFF'} />
        </CircleActionButton>
      )}
      <CircleActionButton
        onPress={() => {
          navigation.navigate('Scan');
        }}
      >
        <QRCodeSvg />
      </CircleActionButton>
    </View>
  );
};

export default ActionButtons;

const styles = StyleSheet.create({
  absoluteFlexRow: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    gap: 20,
  },
});
