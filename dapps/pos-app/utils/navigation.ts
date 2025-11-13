import { Colors } from "@/constants/theme";
import { Href, router } from "expo-router";
import { isVariant } from "./misc";

export const shouldCenterHeaderTitle = (routeName: string) => {
  return routeName === "index" || routeName === "payment-success";
};

export const getHeaderBackgroundColor = (
  routeName: string,
): keyof typeof Colors.light | keyof typeof Colors.dark => {
  if (routeName === "payment-success") {
    return isVariant() ? "polygon-payment-success" : "text-success";
  }
  return "bg-primary";
};

export const getHeaderTintColor = (
  routeName: string,
): keyof typeof Colors.light | keyof typeof Colors.dark => {
  if (routeName === "payment-success") {
    return isVariant() ? "polygon-payment-success-header" : "text-invert";
  }

  return "text-primary";
};

export const resetNavigation = (href?: Href) => {
  router.dismissAll();
  router.replace("/");
  if (href) {
    router.navigate(href);
  }
};
