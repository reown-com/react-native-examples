import { NetworkId } from "@/constants/networks";
import { Brand } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { ThemedText } from "./themed-text";

/** Ethereum diamond mark. */
export function EthMark({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L5 12.5l7 4 7-4L12 2Z"
        fill={Brand.ethereum}
        opacity={0.6}
      />
      <Path d="M12 2L5 12.5l7 4V2Z" fill={Brand.ethereum} />
      <Path
        d="M12 16.5L5 13l7 9 7-9-7 3.5Z"
        fill={Brand.ethereum}
        opacity={0.6}
      />
      <Path d="M12 16.5L5 13l7 9V16.5Z" fill={Brand.ethereum} />
    </Svg>
  );
}

/** Solana three-bar gradient mark. */
export function SolMark({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="solg" x1="5" y1="3" x2="19" y2="21">
          <Stop offset="0" stopColor={Brand.solanaFrom} />
          <Stop offset="1" stopColor={Brand.solanaTo} />
        </LinearGradient>
      </Defs>
      <Path
        d="M5.5 17.5h13l-3 3H5.5l3-3ZM5.5 10.5h13l-3 3H5.5l3-3ZM18.5 3.5h-13l3-3h13l-3 3Z"
        fill="url(#solg)"
      />
    </Svg>
  );
}

export function NetworkMark({
  network,
  size = 24,
}: {
  network: NetworkId;
  size?: number;
}) {
  return network === "eip155" ? (
    <EthMark size={size} />
  ) : (
    <SolMark size={size} />
  );
}

/** A colored circle with a token glyph (e.g. blue $ for USDC). */
export function TokenGlyph({
  color,
  glyph,
  size = 32,
}: {
  color: string;
  glyph: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.glyph,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <ThemedText
        weight="500"
        color="text-white"
        style={{ fontSize: size * 0.44, lineHeight: size * 0.5 }}
      >
        {glyph}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    alignItems: "center",
    justifyContent: "center",
  },
});
