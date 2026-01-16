import { Image, StyleSheet, View } from 'react-native';

import { SignClientTypes, Verify } from '@walletconnect/types';

import { useTheme } from '@/hooks/useTheme';
import VerifiedDomain from '@/assets/VerifiedDomain.png';
import VerifyTag from '@/components/VerifyTag';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

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
  const validation = verifyContext?.verified.validation;
  const isScam = verifyContext?.verified.isScam;

  return (
    <View style={styles.container}>
      {isLinkMode && (
        <View
          style={[
            styles.linkModeContainer,
            {
              backgroundColor: Theme['bg-accent-primary'],
            },
          ]}
        >
          <Text variant="sm-500" color="text-invert">
            LINK MODE
          </Text>
        </View>
      )}
      {metadata?.icons[0] && (
        <Image
          source={{ uri: metadata?.icons[0] ?? '' }}
          style={[styles.logo, { borderColor: Theme['border-primary'] }]}
        />
      )}
      <Text variant="h6-500" color="text-primary">
        {metadata?.name || 'Unknown'}
      </Text>
      {intention && (
        <Text variant="lg-500" color="text-primary">
          {intention}
        </Text>
      )}
      <View style={styles.domainContainer}>
        {!isScam && validation === 'VALID' && (
          <Image source={VerifiedDomain} style={styles.icon} />
        )}
        <Text variant="sm-500" color="text-tertiary">
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
    marginHorizontal: Spacing[4],
    paddingTop: Spacing[4],
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  domainContainer: {
    marginTop: Spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: Spacing[1],
  },
  icon: {
    height: 16,
    width: 16,
  },
  tag: {
    marginTop: Spacing[1],
  },
  linkModeContainer: {
    borderRadius: BorderRadius[5],
    height: 25,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing[3],
  },
});
