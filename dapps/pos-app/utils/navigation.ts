import { Colors } from "@/constants/theme";
import { Href, router } from "expo-router";

export const shouldCenterHeaderTitle = (routeName: string) => {
  return routeName === "index" || routeName === "payment-success";
};

export const getHeaderBackgroundColor = (
  routeName: string,
): keyof typeof Colors.light | keyof typeof Colors.dark => {
  return routeName === "payment-success" ? "bg-payment-success" : "bg-primary";
};

export const getHeaderTintColor = (
  routeName: string,
): keyof typeof Colors.light | keyof typeof Colors.dark => {
  return routeName === "payment-success"
    ? "text-payment-success"
    : "text-primary";
};

export const resetNavigation = (href?: Href) => {
  router.dismissAll();
  router.replace("/");
  if (href) {
    router.navigate(href);
  }
};
