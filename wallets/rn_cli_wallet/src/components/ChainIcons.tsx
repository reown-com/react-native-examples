import { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { BorderRadius } from '@/utils/ThemeUtil';

interface ChainIconsProps {
  chainIds: string[];
  size?: number;
  overlap?: number;
}

export function ChainIcons({
  chainIds,
  size = 24,
  overlap = 8,
}: ChainIconsProps) {
  const Theme = useTheme();

  const uniqueChainIds = useMemo(() => {
    return [...new Set(chainIds)];
  }, [chainIds]);

  const containerWidth = useMemo(() => {
    const count = uniqueChainIds.length;
    if (count === 0) return 0;
    return size + (count - 1) * (size - overlap);
  }, [uniqueChainIds.length, size, overlap]);

  return (
    <View style={[styles.container, { width: containerWidth, height: size }]}>
      {uniqueChainIds.map((chainId, index) => {
        const logo = PresetsUtil.getChainIconById(chainId);
        const leftOffset = index * (size - overlap);

        return (
          <View
            key={chainId}
            style={[
              styles.iconWrapper,
              {
                left: leftOffset,
                width: size,
                height: size,
                zIndex: uniqueChainIds.length - index,
                borderColor: Theme['bg-primary'],
              },
            ]}
          >
            {logo ? (
              <Image
                source={logo}
                style={[
                  styles.icon,
                  {
                    width: size - 2,
                    height: size - 2,
                    backgroundColor: Theme['foreground-tertiary'],
                  },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.icon,
                  {
                    width: size - 2,
                    height: size - 2,
                    backgroundColor: Theme['foreground-tertiary'],
                  },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'relative',
  },
  iconWrapper: {
    position: 'absolute',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    borderRadius: BorderRadius.full,
  },
});
