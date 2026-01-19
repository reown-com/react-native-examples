import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { SignClientTypes } from '@walletconnect/types';

import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import SvgClose from '@/assets/Close';

interface ModalHeaderProps {
  metadata?: SignClientTypes.Metadata;
  intention?: string;
  isLinkMode?: boolean;
  onClose?: () => void;
}

export function ModalHeader({
  metadata,
  intention,
  isLinkMode,
  onClose,
}: ModalHeaderProps) {
  const Theme = useTheme();

  // Build the title - e.g., "Sign a message for Aave"
  const title = intention
    ? `${intention} ${metadata?.name || 'Unknown'}`
    : metadata?.name || 'Unknown';

  return (
    <View style={styles.container}>
      {/* Close button */}
      {onClose && (
        <TouchableOpacity style={[styles.closeButton, { borderColor: Theme['border-secondary'] }]} onPress={onClose}>
          <SvgClose width={38} height={38} fill={Theme['text-primary']} />
        </TouchableOpacity>
      )}

      {/* Link mode badge */}
      {isLinkMode && (
        <View
          style={[
            styles.linkModeContainer,
            {
              backgroundColor: Theme['bg-accent-primary'],
            },
          ]}
        >
          <Text variant="sm-400" color="text-invert">
            LINK MODE
          </Text>
        </View>
      )}

      {/* App icon */}
      {metadata?.icons[0] && (
        <Image
          source={{ uri: metadata?.icons[0] ?? '' }}
          style={[styles.logo, { borderColor: Theme['border-primary'] }]}
        />
      )}

      {/* Title */}
      <Text variant="h6-400" color="text-primary" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing[4],
    paddingHorizontal: Spacing[4],
    width: '100%',
  },
  closeButton: {
    marginRight: Spacing[1],
    marginTop: Spacing[1],
    borderWidth: 1,
    borderRadius: BorderRadius[3],
    alignSelf: 'flex-end',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius[4],
    borderWidth: 1,
    marginVertical: Spacing[2],
  },
  title: {
    marginVertical: Spacing[2],
    textAlign: 'center',
  },
  linkModeContainer: {
    position: 'absolute',
    borderRadius: BorderRadius[2],
    height: 25,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    top: 24,
  },
});
