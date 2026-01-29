import { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SessionTypes } from '@walletconnect/types';

import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';
import { ChainIcons } from '@/components/ChainIcons';
import ModalStore from '@/store/ModalStore';
import { Button } from '@/components/Button';

interface IndividualSessionProps {
  name: string | undefined;
  icons: string;
  url: string;
  topic: string;
  session: SessionTypes.Struct;
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
    ModalStore.open('SessionDetailModal', {
      session: session as SessionTypes.Struct,
    });
  };

  return (
    <Button
      style={[
        styles.container,
        { backgroundColor: Theme['foreground-primary'] },
      ]}
      onPress={onPress}
    >
      <View style={styles.flexRow}>
        {icon ? (
          <Image
            source={{ uri: icon, cache: 'force-cache' }}
            style={[
              styles.iconContainer,
              { backgroundColor: Theme['foreground-tertiary'] },
            ]}
          />
        ) : null}
        <View style={styles.textContainer}>
          <Text
            variant="lg-500"
            color="text-primary"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
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
    </Button>
  );
};

export default IndividualSession;

const styles = StyleSheet.create({
  container: {
    padding: Spacing[5],
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
