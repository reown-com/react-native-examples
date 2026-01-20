import { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { PresetsUtil } from '@/utils/PresetsUtil';
import { BorderRadius } from '@/utils/ThemeUtil';
import { Text } from '@/components/Text';

interface ChainIconsProps {
  chainIds: string[];
  size?: number;
  overlap?: number;
  maxVisible?: number;
}

export function ChainIcons({
  chainIds,
  size = 24,
  overlap = 8,
  maxVisible = 5,
}: ChainIconsProps) {
  const Theme = useTheme();

  const uniqueChainIds = useMemo(() => {
    return [...new Set(chainIds)];
  }, [chainIds]);

  const visibleChainIds = useMemo(() => {
    return uniqueChainIds.slice(0, maxVisible);
  }, [uniqueChainIds, maxVisible]);

  const remainingCount = useMemo(() => {
    return Math.max(0, uniqueChainIds.length - maxVisible);
  }, [uniqueChainIds.length, maxVisible]);

  const containerWidth = useMemo(() => {
    const iconCount = visibleChainIds.length;
    const hasMore = remainingCount > 0;
    const totalCount = iconCount + (hasMore ? 1 : 0);
    if (totalCount === 0) return 0;
    return size + (totalCount - 1) * (size - overlap);
  }, [visibleChainIds.length, remainingCount, size, overlap]);

  return (
    <View style={[styles.container, { width: containerWidth, height: size }]}>
      {visibleChainIds.map((chainId, index) => {
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
                zIndex: visibleChainIds.length - index + 1,
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
      {remainingCount > 0 && (
        <View
          style={[
            styles.iconWrapper,
            styles.moreIndicator,
            {
              left: visibleChainIds.length * (size - overlap),
              width: size,
              height: size,
              backgroundColor: Theme['foreground-secondary'],
              borderColor: Theme['foreground-secondary'],
            },
          ]}
        >
          <Text variant="sm-400" color="text-primary">
            {' +' + remainingCount}
          </Text>
        </View>
      )}
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
  moreIndicator: {
    borderRadius: BorderRadius.full,
    zIndex: 0,
  },
});
