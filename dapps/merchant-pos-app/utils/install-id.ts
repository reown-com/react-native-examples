import { storage } from "./storage";
import { v4 as uuidv4 } from "uuid";

const KEY = "install-id";

/**
 * A stable identifier for this app install. Persisted in MMKV, so it survives
 * across launches but is wiped if the app is uninstalled. Generated on first
 * read. Used as the merchant id (one merchant per install).
 */
export function getInstallId(): string {
  let existing = storage.getItem<string>(KEY);
  if (existing && existing.startsWith("mpos_")) {
    console.warn("Removing legacy install id", existing);
    storage.removeItem(KEY);
    existing = null;
  }
  if (typeof existing === "string" && existing.length > 0) return existing;

  const id = uuidv4();
  storage.setItem(KEY, id);
  return id;
}
