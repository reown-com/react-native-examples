import { BorderRadius, Spacing } from "@/constants/spacing";
import { memo } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import QRCodeSkia from "react-native-qrcode-skia";
import { Shimmer } from "./shimmer";

export interface QrCodeProps {
  size: number;
  uri?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  logoSize?: number;
  onPress?: () => void;
}

function QrCode_({
  size,
  uri,
  testID,
  style,
  children,
  logoSize,
  onPress,
}: QrCodeProps) {
  // QR is always rendered light (black on white) for scannability.
  const containerPadding = Spacing["spacing-4"];
  const qrSize = size - containerPadding * 2;
  const _logoSize = logoSize ?? qrSize / 4;
  const logoAreaSize = _logoSize > 0 ? _logoSize + Spacing["spacing-6"] : 0;

  if (!uri) {
    return (
      <Shimmer width={size} height={size} borderRadius={BorderRadius["5"]} />
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.container,
        { height: size, width: size, backgroundColor: "#FFFFFF" },
        style,
      ]}
      testID={testID}
      nativeID={testID}
    >
      <QRCodeSkia
        value={uri}
        size={qrSize}
        color="#0F0F0F"
        style={{ backgroundColor: "#FFFFFF" }}
        errorCorrectionLevel="Q"
        pathStyle="fill"
        shapeOptions={{
          shape: "rounded",
          eyePatternShape: "rounded",
          gap: 0,
          eyePatternGap: 0,
        }}
        logoAreaSize={children && logoAreaSize > 0 ? logoAreaSize : undefined}
        logo={children ?? undefined}
      />
      {children ? <View style={styles.icon}>{children}</View> : null}
    </Pressable>
  );
}

export default memo(QrCode_, (prev, next) => {
  return (
    prev.size === next.size &&
    prev.uri === next.uri &&
    prev.style === next.style
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius["5"],
    alignSelf: "center",
  },
  icon: {
    position: "absolute",
  },
});
