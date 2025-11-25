import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { memo } from "react";
import {
  ImageSourcePropType,
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
  imageSrc?: ImageSourcePropType;
  testID?: string;
  arenaClear?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  logoSize?: number;
  logoBorderRadius?: number;
}

function QrCode_({
  size,
  uri,
  testID,
  arenaClear,
  style,
  children,
  logoSize,
  logoBorderRadius,
}: QrCodeProps) {
  const Theme = useTheme("light");
  const containerPadding = Spacing["spacing-3"];
  const qrSize = size - containerPadding * 2;
  const _logoSize = arenaClear ? 0 : (logoSize ?? qrSize / 4);
  const logoAreaSize = _logoSize > 0 ? _logoSize + Spacing["spacing-6"] : 0;

  const dotColor = Theme["bg-invert"];
  const edgeColor = Theme["bg-primary"];

  if (!uri) {
    return (
      <Shimmer width={size} height={size} borderRadius={BorderRadius["5"]} />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          backgroundColor: Theme["bg-primary"],
          padding: containerPadding,
        },
        style,
      ]}
      testID={testID}
    >
      <QRCodeSkia
        value={uri}
        size={qrSize}
        color={dotColor}
        style={{ backgroundColor: edgeColor }}
        errorCorrectionLevel="Q"
        pathStyle="fill"
        shapeOptions={{
          shape: "rounded",
          eyePatternShape: "rounded",
          gap: 0,
          eyePatternGap: 0,
          logoAreaBorderRadius: logoBorderRadius,
        }}
        logoAreaSize={logoAreaSize > 0 ? logoAreaSize : undefined}
        logo={children}
      />
      {!arenaClear && <View style={styles.icon}>{children}</View>}
    </View>
  );
}

export const QRCode = memo(QrCode_, (prevProps, nextProps) => {
  return (
    prevProps.size === nextProps.size &&
    prevProps.uri === nextProps.uri &&
    prevProps.style === nextProps.style &&
    prevProps.logoBorderRadius === nextProps.logoBorderRadius
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
