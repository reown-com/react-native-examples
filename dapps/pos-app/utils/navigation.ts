import { Href, router } from "expo-router";

export const resetNavigation = (href?: Href) => {
  router.dismissAll();
  router.replace("/");
  if (href) {
    router.navigate(href);
  }
};
