import { Colors } from "@/constants/theme";

export const shouldCenterHeaderTitle = (routeName: string) => {
  return routeName === "index" || routeName === "payment-success";
};

export const getHeaderBackgroundColor = (
  routeName: string,
): keyof typeof Colors.light | keyof typeof Colors.dark => {
  return routeName === "payment-success" ? "text-success" : "bg-primary";
};

export const getHeaderTintColor = (
  routeName: string,
): keyof typeof Colors.light | keyof typeof Colors.dark => {
  return routeName === "payment-success" ? "text-invert" : "text-primary";
};
