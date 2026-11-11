import { usePathname } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

const APP_NAME = "WalletConnect Pay";

const PAGE_TITLES: Record<string, string> = {
  "/amount": "New payment",
  "/scan": "Waiting for payment",
  "/payment-success": "Payment confirmed",
  "/payment-failure": "Payment failed",
  "/email-receipt": "Email receipt",
  "/activity": "Transactions",
  "/settings": "Settings",
  "/logs": "Logs",
  "/merchant-setup": "Merchant setup",
  "/scan-setup-qr": "Scan credentials",
  "/setup": "Setup",
};

export function getDocumentTitle(pathname: string): string {
  const page = PAGE_TITLES[pathname];
  return page ? `${page} · ${APP_NAME}` : APP_NAME;
}

/**
 * Sets the browser tab title for the current route on web. expo-router turns
 * off React Navigation's automatic document title, and expo-router/head only
 * renders inside a focused screen (not the root layout), so without this every
 * route has an empty <title>. Does nothing on native.
 */
export function DocumentTitle() {
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS !== "web") return;
    document.title = getDocumentTitle(pathname);
  }, [pathname]);

  return null;
}
