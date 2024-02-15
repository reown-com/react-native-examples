// import React from 'react';

// import {useAccount, useEnsAvatar, useEnsName} from 'wagmi';
// import {Image, Pressable, View} from 'react-native';

// import {
//   Canvas,
//   Rect,
//   RadialGradient,
//   Skia,
//   Shader,
//   vec,
// } from '@shopify/react-native-skia';
// import useColors from '../../utils/theme';

// interface AvatarProps {
//   width: number;
//   height: number;
// }

// const hexToRgb = (hex: string): [number, number, number] => {
//   const bigint = parseInt(hex, 16);

//   const r = (bigint >> 16) & 255;
//   const g = (bigint >> 8) & 255;
//   const b = bigint & 255;

//   return [r, g, b];
// };

// const tintColor = (
//   rgb: [number, number, number],
//   tint: number,
// ): [number, number, number] => {
//   const [r, g, b] = rgb;
//   const tintedR = Math.round(r + (255 - r) * tint);
//   const tintedG = Math.round(g + (255 - g) * tint);
//   const tintedB = Math.round(b + (255 - b) * tint);

//   return [tintedR, tintedG, tintedB];
// };

// export const generateAvatarColor = (address: string) => {
//   const hash = address.toLowerCase().replace(/^0x/iu, '');
//   const baseColor = hash.substring(0, 6);
//   const rgbColor = hexToRgb(baseColor);

//   const colors: string[] = [];

//   for (let i = 0; i < 5; i += 1) {
//     const tintedColor = tintColor(rgbColor, 0.15 * i);
//     colors.push(`rgb(${tintedColor[0]}, ${tintedColor[1]}, ${tintedColor[2]})`);
//   }

//   return colors;
// };

// export default function AccountButton({width, height}: AvatarProps) {
//   const {address} = useAccount();
//   const colors = useColors();

//   const addressOrEnsDomain = address as `0x${string}` | undefined;
//   const {data: ensName} = useEnsName({address: addressOrEnsDomain});
//   const {data: ensAvatar} = useEnsAvatar({name: ensName});

//   return (
//     <Pressable
//       style={{
//         width,
//         height: width,
//         position: 'relative',
//         borderRadius: 100,
//         overflow: 'hidden',
//         borderColor: colors.secondary,
//       }}
//       onPress={() => {
//         // modal.open();
//       }}>
//       <View
//         style={{
//           position: 'absolute',
//           width: '100%',
//           height: '100%',
//           borderWidth: 1,
//           borderRadius: 100,
//           borderColor: 'rgba(255, 255, 255, 0.3)',
//           zIndex: 10,
//         }}
//       />
//       {ensAvatar ? (
//         <Image
//           source={{
//             uri: ensAvatar,
//           }}
//           style={{
//             width: '100%',
//             height: '100%',
//           }}
//         />
//       ) : address ? (
//         <Canvas style={{width, height: width}}>
//           <Rect x={0} y={0} width={width} height={width}>
//             <RadialGradient
//               c={vec(16, 16)}
//               r={16}
//               colors={generateAvatarColor(address)}
//             />
//           </Rect>
//         </Canvas>
//       ) : null}
//     </Pressable>
//   );
// }
