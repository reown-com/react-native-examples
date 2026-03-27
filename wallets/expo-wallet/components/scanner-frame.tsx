import Svg, { Rect } from 'react-native-svg';

export const ScannerFrame = ({ size }: { size: number }) => {
  const strokeWidth = 5;
  const radius = 18; // Border radius for rounded corners

  return (
    <Svg width={size} height={size} style={{ position: 'absolute' }}>
      <Rect
        x={strokeWidth / 2}
        y={strokeWidth / 2}
        width={size - strokeWidth}
        height={size - strokeWidth}
        rx={radius}
        ry={radius}
        stroke="black"
        strokeWidth={strokeWidth}
        fill="none"
      />
    </Svg>
  );
};
