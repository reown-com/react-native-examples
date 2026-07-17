import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ScannerFrameProps {
  size: number;
}

export const ScannerFrame: React.FC<ScannerFrameProps> = ({ size }) => {
  const strokeWidth = 5;
  const radius = 30;
  const cornerLength = 50;
  const offset = strokeWidth / 2;
  const end = size - offset;

  // Top-left corner
  const topLeft = `M ${offset} ${offset + cornerLength} L ${offset} ${
    offset + radius
  } Q ${offset} ${offset} ${offset + radius} ${offset} L ${
    offset + cornerLength
  } ${offset}`;
  // Top-right corner
  const topRight = `M ${end - cornerLength} ${offset} L ${
    end - radius
  } ${offset} Q ${end} ${offset} ${end} ${offset + radius} L ${end} ${
    offset + cornerLength
  }`;
  // Bottom-left corner
  const bottomLeft = `M ${offset} ${end - cornerLength} L ${offset} ${
    end - radius
  } Q ${offset} ${end} ${offset + radius} ${end} L ${
    offset + cornerLength
  } ${end}`;
  // Bottom-right corner
  const bottomRight = `M ${end - cornerLength} ${end} L ${
    end - radius
  } ${end} Q ${end} ${end} ${end} ${end - radius} L ${end} ${
    end - cornerLength
  }`;

  return (
    <Svg width={size} height={size}>
      {[topLeft, topRight, bottomLeft, bottomRight].map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke="white"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </Svg>
  );
};
