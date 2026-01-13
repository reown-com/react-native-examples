import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

export default function NfcIcon({ size = 24, color = '#FFFFFF' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 8.5C2 5.46243 4.46243 3 7.5 3H16.5C19.5376 3 22 5.46243 22 8.5V15.5C22 18.5376 19.5376 21 16.5 21H7.5C4.46243 21 2 18.5376 2 15.5V8.5Z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M9 15L9 13C9 11.3431 10.3431 10 12 10V10C13.6569 10 15 11.3431 15 13V15"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M6 15L6 12C6 8.68629 8.68629 6 12 6V6C15.3137 6 18 8.68629 18 12V15"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M12 18V15"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
