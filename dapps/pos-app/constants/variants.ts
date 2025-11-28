import {
  BINANCE_LOGO_BASE64,
  DEFAULT_LOGO_BASE64,
  PHANTOM_LOGO_BASE64,
  SOLANA_LOGO_BASE64,
  SOLFLARE_LOGO_BASE64,
} from "./printer-logos";
import { Colors } from "./theme";

export type VariantName =
  | "default"
  | "solflare"
  | "binance"
  | "phantom"
  | "solana";

type VariantColorOverrides = Partial<typeof Colors.light>;

interface Variant {
  name: string;
  brandLogo: ReturnType<typeof require>; // require() asset
  printerLogo: string; // base64 string
  defaultTheme?: "light" | "dark";
  colors: {
    light: VariantColorOverrides;
    dark: VariantColorOverrides;
  };
}

export const Variants: Record<VariantName, Variant> = {
  default: {
    name: "Default",
    brandLogo: require("@/assets/images/brand.png"),
    printerLogo: DEFAULT_LOGO_BASE64,
    colors: {
      light: {},
      dark: {},
    },
  },
  solflare: {
    name: "Solflare",
    brandLogo: require("@/assets/images/variants/solflare_brand.png"),
    printerLogo: SOLFLARE_LOGO_BASE64,
    defaultTheme: "dark",
    colors: {
      light: {
        "icon-accent-primary": "#FFEF46",
        "bg-accent-primary": "#FFEF46",
        "bg-payment-success": "#FFEF46",
        "text-payment-success": "#202020",
        "border-payment-success": "#363636",
        "text-invert": "#202020", // Used in button text. Default one doesnt work with yellow
      },
      dark: {
        "icon-accent-primary": "#FFEF46",
        "bg-accent-primary": "#FFEF46",
        "bg-payment-success": "#FFEF46",
        "text-payment-success": "#202020",
        "border-payment-success": "#363636",
      },
    },
  },
  binance: {
    name: "Binance",
    brandLogo: require("@/assets/images/variants/binance_brand.png"),
    printerLogo: BINANCE_LOGO_BASE64,
    defaultTheme: "light",
    colors: {
      light: {
        "icon-accent-primary": "#FCD533",
        "bg-accent-primary": "#FCD533",
        "bg-payment-success": "#FCD533",
        "text-payment-success": "#202020",
        "border-payment-success": "#363636",
        "text-invert": "#202020", // Used in button text. Default one doesnt work with yellow
      },
      dark: {
        "icon-accent-primary": "#FCD533",
        "bg-accent-primary": "#FCD533",
        "bg-payment-success": "#FCD533",
        "text-payment-success": "#202020",
        "border-payment-success": "#363636",
      },
    },
  },
  phantom: {
    name: "Phantom",
    brandLogo: require("@/assets/images/variants/phantom_brand.png"),
    printerLogo: PHANTOM_LOGO_BASE64,
    defaultTheme: "light",
    colors: {
      light: {
        "icon-accent-primary": "#AB9FF2",
        "bg-accent-primary": "#AB9FF2",
        "bg-payment-success": "#AB9FF2",
        "text-payment-success": "#FFFFFF",
        "border-payment-success": "#E9E9E9",
      },
      dark: {
        "icon-accent-primary": "#AB9FF2",
        "bg-accent-primary": "#AB9FF2",
        "bg-payment-success": "#AB9FF2",
        "text-payment-success": "#FFFFFF",
        "border-payment-success": "#E9E9E9",
      },
    },
  },
  solana: {
    name: "Solana",
    brandLogo: require("@/assets/images/variants/solana_brand.png"),
    printerLogo: SOLANA_LOGO_BASE64,
    defaultTheme: "dark",
    colors: {
      light: {
        "icon-accent-primary": "#9945FF",
        "bg-accent-primary": "#9945FF",
        "bg-payment-success": "#9945FF",
        "text-payment-success": "#FFFFFF",
        "border-payment-success": "#FFFFFF",
      },
      dark: {
        "icon-accent-primary": "#9945FF",
        "bg-accent-primary": "#9945FF",
        "bg-payment-success": "#9945FF",
        "text-payment-success": "#FFFFFF",
        "border-payment-success": "#FFFFFF",
        "text-invert": "#FFFFFF", // Used in button text. Default one doesnt work with purple
      },
    },
  },
};

export const VariantList = Object.entries(Variants).map(([key, value]) => ({
  id: key as VariantName,
  ...value,
}));
