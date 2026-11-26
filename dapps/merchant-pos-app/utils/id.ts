import { v4 as uuidv4 } from "uuid";

/**
 * Reference id for a WCPay payment. The API caps `referenceId` at 35 chars,
 * so we strip the UUID hyphens to get a 32-char value.
 */
export function generateReferenceId(): string {
  return uuidv4().replace(/-/g, "");
}
