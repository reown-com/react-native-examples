import {ReactNode, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {LinearGradient} from 'react-native-linear-gradient';
import {CoreTypes} from '@walletconnect/types';

import {ModalHeader} from './ModalHeader';
import {useSnapshot} from 'valtio';
import SettingsStore from '@/store/SettingsStore';
import VerifyInfoBox from '@/components/VerifyInfoBox';
import {ActionButton} from '@/components/ActionButton';

export interface RequestModalProps {
  children: ReactNode;
  metadata?: CoreTypes.Metadata;
  heading: string;
  onApprove: () => void;
  onReject: () => void;
  approveLoader?: boolean;
  rejectLoader?: boolean;
  intention?: string;
  isLinkMode?: boolean;
  disableApprove?: boolean;
}

export function RequestModalV2({
  children,
  heading,
  onApprove,
  onReject,
  approveLoader,
  rejectLoader,
  disableApprove,
}: RequestModalProps) {
  const {currentRequestVerifyContext} = useSnapshot(SettingsStore.state);
  return (
    <View style={styles.container}>
      <ModalHeader heading={heading} />
      {children}
      <ModalFooter
        onApprove={onApprove}
        onReject={onReject}
        approveLoader={approveLoader}
        rejectLoader={rejectLoader}
        verifyContext={currentRequestVerifyContext}
        disableApprove={disableApprove}
      />
    </View>
  );
}

function ModalFooter({
  onApprove,
  onReject,
  approveLoader,
  rejectLoader,
  verifyContext,
  disableApprove,
}: any) {
  const validation = verifyContext?.verified.validation;
  const isScam = verifyContext?.verified.isScam;

  const approveButtonColors = useMemo(() => {
    let gradient;
    let textColor;
    if (disableApprove) {
      gradient = ['transparent', 'transparent'];
      textColor = '#9A9A9A';
    } else {
      gradient = ['#732BCC', '#076CF1'];
      textColor = 'white';
    }
    return {
      gradient,
      textColor,
    };
  }, [disableApprove]);

  return (
    <View style={styles.container}>
      <VerifyInfoBox
        isScam={isScam}
        validation={validation}
        style={{marginBottom: 15}}
      />
      <View style={stylesFooter.buttonContainer}>
        <ActionButton
          loading={rejectLoader}
          disabled={approveLoader || rejectLoader}
          style={[stylesFooter.button, stylesFooter.declineButton]}
          textStyle={stylesFooter.rejectText}
          onPress={onReject}
          secondary>
          Cancel
        </ActionButton>
        <LinearGradient
          colors={approveButtonColors.gradient} // Gradient colors
          start={{x: 0, y: 0}} // Gradient start point
          end={{x: 1, y: 1}} // Gradient end point
          style={stylesFooter.button}>
          <ActionButton
            loading={approveLoader}
            disabled={approveLoader || disableApprove}
            style={[stylesFooter.button, stylesFooter.appoveButton]}
            textStyle={[
              stylesFooter.approveText,
              {color: approveButtonColors.textColor},
            ]}
            onPress={onApprove}>
            Approve
          </ActionButton>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column', // Main container stacks rows vertically
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: 'auto',
    backgroundColor: '#2A2A2A',
  },
  section: {
    width: '100%',
    backgroundColor: '#252525',
    borderRadius: 20,
    display: 'flex',
    padding: 5,
    marginBottom: 10,
  },
  innerSection: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
  },
  alignInCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row', // Each row splits into two columns
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    paddingLeft: 20,
    paddingEnd: 20,
  },
  chainLogo: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  column: {
    alignItems: 'center', // Center content horizontally in the column
  },
  iconColumn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textMuted: {
    color: '#9A9A9A',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 16,
    textAlign: 'left',
  },
  textMid: {
    fontSize: 14,
    lineHeight: 16,
  },
  textSm: {
    fontSize: 12,
    lineHeight: 14,
  },
  textMain: {
    color: '#ffffff',
    fontWeight: 500,
    textAlign: 'right',
  },
});

const stylesFooter = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  buttonContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  declineButton: {
    backgroundColor: 'transparent',
  },
  appoveButton: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  button: {
    width: '48%',
    height: 48,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#363636',
  },
  rejectText: {
    fontWeight: '500',
    fontSize: 16,
    color: '#ffff',
  },
  approveText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
