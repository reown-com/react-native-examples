import { Colors } from "@/constants/theme";
import { Href, router } from "expo-router";

const SUCCESS_ROUTES = new Set(["payment-success", "split-summary"]);

export const shouldCenterHeaderTitle = (routeName: string) => {
  return routeName === "index" || SUCCESS_ROUTES.has(routeName);
};

export const getHeaderBackgroundColor = (
  routeName: string,
): keyof typeof Colors.light | keyof typeof Colors.dark => {
  return SUCCESS_ROUTES.has(routeName) ? "bg-payment-success" : "bg-primary";
};

export const getHeaderTintColor = (
  routeName: string,
): keyof typeof Colors.light | keyof typeof Colors.dark => {
  return SUCCESS_ROUTES.has(routeName)
    ? "text-payment-success"
    : "text-primary";
};

export const resetNavigation = (href?: Href) => {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  router.replace("/");
  if (href) {
    router.navigate(href);
  }
};
