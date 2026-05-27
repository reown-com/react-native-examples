import Svg, { Circle, Path, Rect } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

/** WalletConnect rounded-square logo mark. */
export function WcLogo({
  size = 38,
  radius = 11,
}: {
  size?: number;
  radius?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <Rect width={38} height={38} rx={radius} fill="#3b99fc" />
      <Path
        d="M19 9.5C14 9.5 10 13 9 17.7c4.8-2.2 8.7-2.2 10-2.2s5.2 0 10 2.2C28 13 24 9.5 19 9.5Z"
        fill="white"
        opacity={0.5}
      />
      <Path
        d="M19 15.5c-1.3 0-5.2 0-10 2.2 0 0 0 .1 0 .1 0 5.5 4.5 10 10 10s10-4.5 10-10v-.1c-4.8-2.2-8.7-2.2-10-2.2Z"
        fill="white"
      />
    </Svg>
  );
}

export function PlusIcon({ size = 24, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function LinkIcon({ size = 24, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CheckCircleIcon({ size = 24, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CloseIcon({ size = 20, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5 5l10 10M15 5L5 15"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ShareIcon({ size = 20, color = "#3b99fc" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 6l-4-4-4 4M12 2v13"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DisconnectIcon({ size = 16, color = "#ef4444" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function WalletIcon({ size = 24, color = "#3b99fc" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={2}
        y={5}
        width={20}
        height={14}
        rx={3}
        stroke={color}
        strokeWidth={1.8}
      />
      <Path d="M2 10h20" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function ReceiptIcon({ size = 18, color = "#8a8a8a" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={3}
        width={18}
        height={18}
        rx={3}
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M9 9h6M9 12h6M9 15h3"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
