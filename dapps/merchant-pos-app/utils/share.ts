import { Share } from "react-native";

/** Open the native share sheet for a payment link. Returns true if not dismissed. */
export async function sharePaymentLink(
  url: string,
  label?: string,
): Promise<boolean> {
  try {
    const message = label ? `${label}\n${url}` : url;
    const result = await Share.share({ message, url });
    return result.action !== Share.dismissedAction;
  } catch {
    return false;
  }
}
