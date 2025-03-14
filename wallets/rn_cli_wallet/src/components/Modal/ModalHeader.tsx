import {Image, StyleSheet, Text, View} from 'react-native';

import {SignClientTypes, Verify} from '@walletconnect/types';

import {useTheme} from '@/hooks/useTheme';
import VerifiedDomain from '@/assets/VerifiedDomain.png';
import VerifyTag from '@/components/VerifyTag';

interface ModalHeaderProps {
  metadata?: SignClientTypes.Metadata;
  intention?: string;
  verifyContext?: Verify.Context;
  showVerifyContext?: boolean;
  isLinkMode?: boolean;
}

export function ModalHeader({
  metadata,
  intention,
  verifyContext,
  showVerifyContext = true,
  isLinkMode,
}: ModalHeaderProps) {
  const Theme = useTheme();
  const color = Theme['fg-100'];
  const validation = verifyContext?.verified.validation;
  const isScam = verifyContext?.verified.isScam;

  return (
    <View style={styles.container}>
      {isLinkMode && (
        <View
          style={[
            styles.linkModeContainer,
            {
              backgroundColor: Theme['accent-100'],
            },
          ]}>
          <Text style={[styles.linkMode, {color: Theme['inverse-100']}]}>
            LINK MODE
          </Text>
        </View>
      )}
      {metadata?.icons[0] && (
        <Image
          source={{uri: metadata?.icons[0] ?? ''}}
          style={[styles.logo, {borderColor: Theme['gray-glass-010']}]}
        />
      )}
      <Text style={[styles.title, {color}]}>{metadata?.name || 'Unknown'}</Text>
      {intention && <Text style={[styles.desc, {color}]}>{intention}</Text>}
      <View style={styles.domainContainer}>
        {!isScam && validation === 'VALID' && (
          <Image source={VerifiedDomain} style={styles.icon} />
        )}
        <Text style={[styles.domain, {color: Theme['fg-200']}]}>
          {metadata?.url || 'unknown domain'}
        </Text>
      </View>
      {showVerifyContext && (
        <VerifyTag validation={validation} isScam={isScam} style={styles.tag} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingTop: 16,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  desc: {
    fontSize: 16,
    fontWeight: '600',
  },
  domainContainer: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  domain: {
    fontSize: 12,
    fontWeight: '500',
  },
  icon: {
    height: 16,
    width: 16,
  },
  tag: {
    marginTop: 4,
  },
  linkModeContainer: {
    borderRadius: 20,
    height: 25,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  linkMode: {
    fontSize: 12,
    fontWeight: '500',
  },
});
