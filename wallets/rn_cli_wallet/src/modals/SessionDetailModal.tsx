import { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSnapshot } from 'valtio';
import { getSdkError } from '@walletconnect/utils';
import { SessionTypes } from '@walletconnect/types';

import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { ChainIcons } from '@/components/ChainIcons';
import ModalStore from '@/store/ModalStore';
import SettingsStore from '@/store/SettingsStore';
import { walletKit } from '@/utils/WalletKitUtil';
import SvgDisconnect from '@/assets/Disconnect';
import SvgClose from '@/assets/Close';
import { haptics } from '@/utils/haptics';

export default function SessionDetailModal() {
  const Theme = useTheme();
  const { data } = useSnapshot(ModalStore.state);
  const session = data?.session as SessionTypes.Struct | undefined;
  const [loading, setLoading] = useState(false);

  const metadata = session?.peer.metadata;
  const namespaces = session?.namespaces;

  const chainIds = useMemo(() => {
    if (!namespaces) return [];
    return Object.values(namespaces).flatMap(ns => ns.chains || []);
  }, [namespaces]);

  const methods = useMemo(() => {
    if (!namespaces) return [];
    return [
      ...new Set(Object.values(namespaces).flatMap(ns => ns.methods || [])),
    ];
  }, [namespaces]);

  const events = useMemo(() => {
    if (!namespaces) return [];
    return [
      ...new Set(Object.values(namespaces).flatMap(ns => ns.events || [])),
    ];
  }, [namespaces]);

  const onClose = useCallback(() => {
    ModalStore.close();
  }, []);

  const onDisconnect = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      await walletKit.disconnectSession({
        topic: session.topic,
        reason: getSdkError('USER_DISCONNECTED'),
      });
      haptics.requestResponse();
      SettingsStore.setSessions(Object.values(walletKit.getActiveSessions()));
      ModalStore.close();
    } catch (e) {
      console.log((e as Error).message, 'error');
    }
    setLoading(false);
  }, [session]);

  if (!session) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: Theme['bg-primary'] }]}>
      {/* Header Row */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.disconnectButton,
            { backgroundColor: Theme['bg-invert'] },
          ]}
          onPress={onDisconnect}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Theme['text-invert']} />
          ) : (
            <>
              <SvgDisconnect
                width={14}
                height={14}
                fill={Theme['text-invert']}
              />
              <Text
                variant="md-400"
                color="text-invert"
                style={styles.disconnectText}
              >
                Disconnect
              </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <SvgClose width={32} height={32} fill={Theme['text-primary']} />
        </TouchableOpacity>
      </View>

      {/* App Info Card */}
      <View
        style={[styles.card, { backgroundColor: Theme['foreground-primary'] }]}
      >
        <View style={styles.appInfoRow}>
          {metadata?.icons[0] && (
            <Image
              source={{ uri: metadata.icons[0], cache: 'force-cache' }}
              style={[
                styles.appIcon,
                { backgroundColor: Theme['foreground-tertiary'] },
              ]}
            />
          )}
          <View style={styles.appInfoText}>
            <Text variant="lg-500" color="text-primary">
              {metadata?.name || 'Unknown'}
            </Text>
            <Text
              variant="sm-400"
              color="text-secondary"
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {metadata?.url || 'Unknown URL'}
            </Text>
          </View>
          <ChainIcons chainIds={chainIds} size={24} overlap={8} />
        </View>
      </View>

      {/* Methods Card */}
      {methods.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: Theme['foreground-primary'] },
          ]}
        >
          <Text variant="lg-400" color="text-primary" style={styles.cardTitle}>
            Methods
          </Text>
          <Text variant="md-400" color="text-secondary">
            {methods.join(', ')}
          </Text>
        </View>
      )}

      {/* Events Card */}
      {events.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: Theme['foreground-primary'] },
          ]}
        >
          <Text variant="lg-400" color="text-primary" style={styles.cardTitle}>
            Events
          </Text>
          <Text variant="md-400" color="text-secondary">
            {events.join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    padding: Spacing[5],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius[3],
    gap: Spacing[1],
  },
  disconnectText: {
    marginLeft: Spacing[1],
  },
  closeButton: {
    padding: Spacing[1],
  },
  card: {
    borderRadius: BorderRadius[4],
    padding: Spacing[4],
    marginBottom: Spacing[3],
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius[3],
  },
  appInfoText: {
    flex: 1,
    marginLeft: Spacing[3],
    marginRight: Spacing[2],
  },
  cardTitle: {
    marginBottom: Spacing[2],
  },
});
