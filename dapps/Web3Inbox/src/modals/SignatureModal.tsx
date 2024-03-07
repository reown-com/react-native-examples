import {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import Modal from 'react-native-modal';
import WalletIcon from '@/icons/wallet';
import Logo from '@/icons/w3i-logo.png';
import useTheme from '@/hooks/useTheme';
import {BorderRadius, Spacing} from '@/utils/ThemeUtil';
import Button from '@/components/Button';
import {Text} from '@/components/Text';
import {LoadingThumbnail} from '@/components/LoadingThumbnail';

interface ModalProps {
  isVisible?: boolean;
  onDismiss?: () => void;
  onSignPress: () => void;
}

function SignatureModal({
  isVisible = true,
  onDismiss,
  onSignPress,
}: ModalProps) {
  const Theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleModalHide = () => {
    setIsLoading(false);
  };

  const handleSignPress = () => {
    setIsLoading(!isLoading);
    onSignPress?.();
  };

  return (
    <Modal
      isVisible={isVisible}
      onModalHide={handleModalHide}
      onBackdropPress={onDismiss}
      backdropOpacity={0.1}
      hideModalContentWhileAnimating
      onDismiss={onDismiss}>
      <View style={styles.container}>
        <Header isLoading={isLoading} />
        <Text variant="large-600">
          {isLoading ? 'Requesting sign-in' : 'Sign in to enable notifications'}
        </Text>
        <Text
          style={styles.description}
          variant="small-500"
          color="fg-150"
          center>
          To fully use Web3Inbox, please sign with your wallet
        </Text>
        <Button
          label={isLoading ? 'Waiting for wallet...' : 'Sign in with wallet'}
          onPress={handleSignPress}
          disabled={isLoading}
          style={[
            styles.signButton,
            isLoading && {backgroundColor: Theme['accent-glass-050']},
          ]}
          rightIcon={
            !isLoading && (
              <WalletIcon
                style={styles.signIcon}
                height={16}
                width={16}
                fill="white"
              />
            )
          }
        />
      </View>
    </Modal>
  );
}

function Header({isLoading}: {isLoading?: boolean}) {
  const Theme = useTheme();

  if (isLoading) {
    return (
      <LoadingThumbnail>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: Theme['accent-010'],
              borderRadius: BorderRadius.m,
            },
          ]}>
          <WalletIcon height={40} width={40} fill={Theme['accent-100']} />
        </View>
      </LoadingThumbnail>
    );
  }

  return (
    <View style={styles.header}>
      <View
        style={[
          styles.iconContainer,
          styles.logoContainer,
          {backgroundColor: Theme['accent-010']},
        ]}>
        <Image source={Logo} style={styles.w3iLogo} />
      </View>
      <View
        style={[
          styles.iconContainer,
          styles.walletContainer,
          {backgroundColor: Theme['accent-010']},
        ]}>
        <WalletIcon height={40} width={40} fill={Theme['accent-100']} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: Spacing['4xl'],
    paddingBottom: Spacing['2xl'],
    borderRadius: BorderRadius.s,
    paddingHorizontal: Spacing.xl,
    rowGap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.s,
    height: 80,
    width: 80,
  },
  w3iLogo: {
    height: 40,
    width: 40,
  },
  logoContainer: {
    borderRadius: 100,
    borderWidth: 6,
    borderColor: 'white',
    right: -7,
    zIndex: 1,
    height: 92,
    width: 92,
  },
  walletContainer: {
    left: -7,
  },
  description: {
    marginHorizontal: Spacing.s,
  },
  signButton: {
    width: '100%',
  },
  signIcon: {
    marginLeft: Spacing.xs,
  },
});

export default SignatureModal;
