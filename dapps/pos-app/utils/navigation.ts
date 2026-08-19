import { Href, router } from "expo-router";

export const resetNavigation = (href: Href = "/") => {
  router.dismissTo(href);
};
