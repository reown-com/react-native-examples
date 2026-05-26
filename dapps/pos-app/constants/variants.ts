import { Colors } from "./theme";

export type VariantName =
  | "default"
  | "solflare"
  | "binance"
  | "phantom"
  | "solana"
  | "trezor"
  | "ledger"
  | "imin"
  | "money2020"
  | "xmoney";

type VariantColorOverrides = Partial<typeof Colors.light>;

interface Variant {
  name: string;
  variantLogo?: ReturnType<typeof require>; // require() asset, omitted for default
  defaultTheme?: "light" | "dark";
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
  solflare: {
    name: "Solflare",
    variantLogo: require("@/assets/images/variants/solflare_brand.png"),
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
    variantLogo: require("@/assets/images/variants/binance_brand.png"),
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
    variantLogo: require("@/assets/images/variants/phantom_brand.png"),
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
    variantLogo: require("@/assets/images/variants/solana_brand.png"),
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
  trezor: {
    name: "Trezor",
    variantLogo: require("@/assets/images/variants/trezor_brand.png"),
    defaultTheme: "light",
    colors: {
      light: {
        "icon-accent-primary": "#60E198",
        "bg-accent-primary": "#60E198",
        "bg-payment-success": "#60E198",
        "text-payment-success": "#1F1F1F",
        "border-payment-success": "#363636",
        "text-invert": "#1F1F1F",
      },
      dark: {
        "icon-accent-primary": "#60E198",
        "bg-accent-primary": "#60E198",
        "bg-payment-success": "#60E198",
        "text-payment-success": "#1F1F1F",
        "border-payment-success": "#363636",
      },
    },
  },
  ledger: {
    name: "Ledger",
    variantLogo: require("@/assets/images/variants/ledger_brand.png"),
    defaultTheme: "light",
    colors: {
      light: {
        "icon-accent-primary": "#000000",
        "bg-accent-primary": "#000000",
        "bg-payment-success": "#000000",
        "text-payment-success": "#FFFFFF",
        "border-payment-success": "#E9E9E9",
      },
      dark: {
        "icon-accent-primary": "#000000",
        "bg-accent-primary": "#000000",
        "bg-payment-success": "#000000",
        "text-payment-success": "#FFFFFF",
        "border-payment-success": "#E9E9E9",
      },
    },
  },
  imin: {
    name: "iMin",
    variantLogo: require("@/assets/images/variants/imin_brand.png"),
    defaultTheme: "light",
    colors: {
      light: {
        "icon-accent-primary": "#3E4D59",
        "bg-accent-primary": "#3E4D59",
        "bg-payment-success": "#000000",
        "text-payment-success": "#FFFFFF",
        "border-payment-success": "#E9E9E9",
      },
      dark: {
        "icon-accent-primary": "#3E4D59",
        "bg-accent-primary": "#3E4D59",
        "bg-payment-success": "#000000",
        "text-payment-success": "#FFFFFF",
        "border-payment-success": "#E9E9E9",
      },
    },
  },
  money2020: {
    name: "Money 20/20",
    variantLogo: require("@/assets/images/variants/money2020_brand.png"),
    defaultTheme: "dark",
    colors: {
      light: {},
      dark: {},
    },
  },
  xmoney: {
    name: "xMoney",
    variantLogo: require("@/assets/images/variants/xmoney_brand.png"),
    defaultTheme: "dark",
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
