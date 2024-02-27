const hexToRgb = (hex: string): [number, number, number] => {
  const bigint = parseInt(hex, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r, g, b];
};

const tintColor = (
  rgb: [number, number, number],
  tint: number,
): [number, number, number] => {
  const [r, g, b] = rgb;
  const tintedR = Math.round(r + (255 - r) * tint);
  const tintedG = Math.round(g + (255 - g) * tint);
  const tintedB = Math.round(b + (255 - b) * tint);

  return [tintedR, tintedG, tintedB];
};

export const generateAvatarColor = (address: string) => {
  const hash = address.toLowerCase().replace(/^0x/iu, '');
  const baseColor = hash.substring(0, 6);
  const rgbColor = hexToRgb(baseColor);

  const colors: string[] = [];

  for (let i = 0; i < 5; i += 1) {
    const tintedColor = tintColor(rgbColor, 0.15 * i);
    colors.push(`rgb(${tintedColor[0]}, ${tintedColor[1]}, ${tintedColor[2]})`);
  }

  return colors;
};
