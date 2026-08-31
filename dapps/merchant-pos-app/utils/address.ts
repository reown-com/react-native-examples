/** Truncate a wallet address as `0x1a2b…9f3c`. */
export function truncateAddress(address?: string | null, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

/**
 * Extract the bare address from a CAIP-10 account id.
 * e.g. `eip155:1:0xabc…` -> `0xabc…`, `solana:...:Abc…` -> `Abc…`.
 */
export function addressFromCaip(caip?: string | null): string {
  if (!caip) return "";
  const parts = caip.split(":");
  return parts[parts.length - 1] ?? caip;
}
