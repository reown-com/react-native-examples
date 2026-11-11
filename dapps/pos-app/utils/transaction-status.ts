import { Colors } from "@/constants/theme";
import { ImageSourcePropType } from "react-native";
import { TransactionStatus } from "./types";

type ColorKey = keyof typeof Colors.light;

export interface TransactionStatusMeta {
  /** Display label shown on the card title and status pill. */
  label: string;
  /** Theme key for the title text color. */
  titleColorKey: ColorKey;
  /** Theme key for the icon square / pill background (Status fill). */
  iconBgKey: ColorKey;
  /** Theme key for the icon tint (rendered on top of `iconBgKey`). */
  iconTintKey: ColorKey;
  /** PNG glyph rendered inside the icon square (tinted via `iconTintKey`). */
  icon: ImageSourcePropType;
  /**
   * Optional bolder glyph for the small (14px) status pill, where the regular
   * icon reads too thin. Falls back to `icon` when unset.
   */
  badgeIcon?: ImageSourcePropType;
}

/**
 * Single source of truth mapping a raw `TransactionStatus` to its display label,
 * colors and icon, following the design system's Status component: success,
 * error, warning, primary (in progress) and neutral types. Consumed by both the transaction card and the status pill so
 * the two never drift apart.
 */
export function getTransactionStatusMeta(
  status: TransactionStatus,
): TransactionStatusMeta {
  switch (status) {
    case "succeeded":
      return {
        label: "Confirmed",
        titleColorKey: "icon-success",
        iconBgKey: "bg-status-success",
        iconTintKey: "icon-success",
        icon: require("@/assets/images/check.png"),
        badgeIcon: require("@/assets/images/check-bold.png"),
      };
    case "cancelled":
      return {
        label: "Cancelled",
        titleColorKey: "text-primary",
        iconBgKey: "bg-status-neutral",
        iconTintKey: "icon-default",
        icon: require("@/assets/images/close.png"),
      };
    case "failed":
      return {
        label: "Failed",
        titleColorKey: "icon-error",
        iconBgKey: "bg-status-error",
        iconTintKey: "icon-error",
        icon: require("@/assets/images/receipt-x.png"),
      };
    case "expired":
      return {
        label: "Expired",
        titleColorKey: "icon-warning",
        iconBgKey: "bg-status-warning",
        iconTintKey: "icon-warning",
        icon: require("@/assets/images/warning_circle.png"),
      };
    case "requires_action":
    case "processing":
    default:
      return {
        label: "Pending",
        titleColorKey: "content-status-primary",
        iconBgKey: "bg-status-primary",
        iconTintKey: "content-status-primary",
        icon: require("@/assets/images/clock.png"),
      };
  }
}
