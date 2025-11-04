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
import { Shimmer } from "./shimmer";
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
  const logoSize = arenaClear ? 0 : size / 4;
  const padding = Spacing["spacing-3"];

  const dots = useMemo(
    () => (uri ? QRCodeUtil.generate(uri, size, logoSize) : []),
    [uri, size, logoSize],
  );

  return uri ? (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Theme["bg-primary"],
        },
        style,
      ]}
      testID={testID}
    >
      <Svg height={size} width={size}>
        {dots}
      </Svg>
      {!arenaClear && <View style={styles.icon}>{children}</View>}
    </View>
  ) : (
    <Shimmer
      width={size + padding * 2}
      height={size + padding * 2}
      borderRadius={BorderRadius["5"]}
    />
  );
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
    padding: Spacing["spacing-3"],
  },
  icon: {
    position: "absolute",
  },
});
