import { useMemo } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { SessionTypes } from '@walletconnect/types';

import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { ChainIcons } from '@/components/ChainIcons';
import ModalStore from '@/store/ModalStore';

type SessionLike = {
  topic: string;
  namespaces: {
    [key: string]: {
      chains?: readonly string[] | string[];
      accounts: readonly string[] | string[];
      methods: readonly string[] | string[];
      events: readonly string[] | string[];
    };
  };
  peer: {
    metadata: {
      name: string;
      icons: readonly string[] | string[];
      url: string;
      description: string;
    };
  };
};

interface IndividualSessionProps {
  name: string | undefined;
  icons: string;
  url: string;
  topic: string;
  session: SessionLike;
}

const IndividualSession = ({
  name,
  icons,
  url,
  session,
}: IndividualSessionProps) => {
  const icon = icons ? icons : null;
  const Theme = useTheme();

  const chainIds = useMemo(() => {
    if (!session?.namespaces) return [];
    return Object.values(session.namespaces).flatMap(ns => ns.chains || []);
  }, [session]);

  const onPress = () => {
    ModalStore.open('SessionDetailModal', { session: session as SessionTypes.Struct });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: Theme['foreground-primary'] }]}
      onPress={onPress}
    >
      <View style={styles.flexRow}>
        {icon ? (
          <Image
            source={{ uri: icon }}
            style={[styles.iconContainer, { backgroundColor: Theme['foreground-tertiary'] }]}
          />
        ) : null}
        <View style={styles.textContainer}>
          <Text variant="lg-500" color="text-primary">
            {name ? name : 'No Name'}
          </Text>
          <Text
            variant="sm-400"
            color="text-secondary"
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {url}
          </Text>
        </View>
        <ChainIcons chainIds={chainIds} size={24} overlap={8} />
      </View>
    </TouchableOpacity>
  );
};

export default IndividualSession;

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius[4],
    marginBottom: Spacing[2],
  },
  iconContainer: {
    height: 48,
    width: 48,
    borderRadius: BorderRadius[3],
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    paddingLeft: Spacing[3],
    marginRight: Spacing[2],
    flex: 1,
  },
});
