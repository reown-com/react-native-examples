import { Colors } from "./theme";

// Only "default" ships today. The variant machinery below is intentionally kept
// so a brand variant can be re-added later. To add one:
//   1. Add its key to the `VariantName` union.
//   2. Add a matching entry to `Variants` (brand colors, optional `variantLogo`,
//      `printerLogo`, `defaultTheme`, `allowThemeToggle`).
//   3. Re-add the "Wallet theme" SettingsItem + bottom sheet in app/settings.tsx
//      (it renders `VariantList` via RadioList and calls `setVariant`).
export type VariantName = "default";

type VariantColorOverrides = Partial<typeof Colors.light>;

interface Variant {
  name: string;
  variantLogo?: ReturnType<typeof require>; // require() asset, omitted for default
  printerLogo?: string; // base64 PNG printed on the receipt; falls back to default when omitted
  defaultTheme?: "light" | "dark";
  allowThemeToggle?: boolean; // let users switch theme manually even on a branded variant
  colors: {
    light: VariantColorOverrides;
    dark: VariantColorOverrides;
  };
}

export const Variants: Record<VariantName, Variant> = {
  default: {
    name: "None",
    colors: {
      light: {},
      dark: {},
    },
  },
};

export const VariantList = Object.entries(Variants).map(([key, value]) => ({
  id: key as VariantName,
  ...value,
}));
