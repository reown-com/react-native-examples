import { BorderRadius, Spacing } from "@/constants/spacing";
import { useTheme } from "@/hooks/use-theme-color";
import { QRCodeUtil } from "@/utils/qr-code";
import { memo, useMemo } from "react";
import {
  ImageSourcePropType,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Svg from "react-native-svg";
// import { Icon } from "../../components/wui-icon";
// import { Image } from "../../components/wui-image";
// import { Shimmer } from "../../components/wui-shimmer";
// import { QRCodeUtil } from "../../utils/QRCodeUtil";
// import { BorderRadius, LightTheme, Spacing } from "../../utils/ThemeUtil";
// import type { IconType } from "../../utils/TypesUtil";

export interface QrCodeProps {
  size: number;
  uri?: string;
  imageSrc?: ImageSourcePropType;
  testID?: string;
  arenaClear?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function QrCode_({
  size,
  uri,
  testID,
  arenaClear,
  style,
  children,
}: QrCodeProps) {
  const Theme = useTheme("light");
  const containerPadding = Spacing["spacing-5"];
  const qrSize = size - containerPadding * 2;
  const logoSize = arenaClear ? 0 : qrSize / 4;

  const dots = useMemo(
    () => (uri ? QRCodeUtil.generate(uri, qrSize, logoSize) : []),
    [uri, qrSize, logoSize],
  );

  return uri ? (
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
      <Svg height={qrSize} width={qrSize}>
        {dots}
      </Svg>
      {!arenaClear && <View style={styles.icon}>{children}</View>}
    </View>
  ) : // <Shimmer width={size} height={size} borderRadius={BorderRadius.l} />
  null;
}

export const QRCode = memo(QrCode_, (prevProps, nextProps) => {
  return (
    prevProps.size === nextProps.size &&
    prevProps.uri === nextProps.uri &&
    prevProps.style === nextProps.style
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
