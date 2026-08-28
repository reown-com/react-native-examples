export function isTerminalConfigured(
  merchantId: string | null,
  hasLocalApiKey: boolean,
  isBridgeConfigured: boolean,
): boolean {
  return !!merchantId?.trim() && (hasLocalApiKey || isBridgeConfigured);
}

export function getConnectionSetupRemaining(
  hasMerchantId: boolean,
  hasLocalApiKey: boolean,
  isBridgeConfigured: boolean,
): number {
  if (isBridgeConfigured) return 0;
  return (hasMerchantId ? 0 : 1) + (hasLocalApiKey ? 0 : 1);
}

export function shouldShowConnectionSection(
  isBridgeConfigured: boolean,
  hasBridgeMerchantId: boolean,
  hasOtherConnectionControl: boolean,
): boolean {
  return (
    !isBridgeConfigured || hasBridgeMerchantId || hasOtherConnectionControl
  );
}

export function shouldRouteInvalidApiKeyToSettings(
  isInvalidApiKey: boolean,
  isBridgeConfigured: boolean,
): boolean {
  return isInvalidApiKey && !isBridgeConfigured;
}
