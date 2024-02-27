import React from 'react';

import {useWeb3Modal} from '@web3modal/wagmi-react-native';
import {useAccount, useEnsAvatar, useEnsName} from 'wagmi';
import {Image, Pressable, View} from 'react-native';

import {Canvas, Rect, RadialGradient, vec} from '@shopify/react-native-skia';
import {generateAvatarColor} from '@/utils/ColorGenerator';
import useColors from '@/hooks/useColors';

interface AvatarProps {
  width: number;
  height: number;
}

export default function AccountButton({width, height}: AvatarProps) {
  const {address} = useAccount();
  const modal = useWeb3Modal();
  const colors = useColors();

  const addressOrEnsDomain = address as `0x${string}` | undefined;
  const {data: ensName} = useEnsName({address: addressOrEnsDomain});
  const {data: ensAvatar} = useEnsAvatar({name: ensName});

  if (!address) {
    return null;
  }

  return (
    <Pressable
      style={{
        width,
        height: width,
        position: 'relative',
        borderRadius: 100,
        overflow: 'hidden',
        borderColor: colors.secondary,
      }}
      onPress={() => {
        modal.open();
      }}>
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderWidth: 1,
          borderRadius: 100,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          zIndex: 10,
        }}
      />
      {ensAvatar ? (
        <Image
          source={{
            uri: ensAvatar,
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      ) : address ? (
        <Canvas style={{width, height: width}}>
          <Rect x={0} y={0} width={width} height={width}>
            <RadialGradient
              c={vec(16, 16)}
              r={16}
              colors={generateAvatarColor(address)}
            />
          </Rect>
        </Canvas>
      ) : null}
    </Pressable>
  );
}
