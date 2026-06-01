/**
 * Pay-core Cognito access token (OAuth 2 client_credentials).
 *
 * Mirrors `dashboard-new/src/server/clients/pay-core/cognito-auth.ts`. The
 * dashboard mints these server-side and caches via `unstable_cache` for 50
 * minutes; here we keep an in-memory + in-flight cache (the token is
 * sensitive, so we do not persist it to MMKV).
 *
 * Security note: embedding a Cognito client secret in a mobile bundle is a
 * known limitation — it ends up in the JS bundle and can be extracted from
 * the APK. Only use this with a non-production client (or move the
 * client-credentials exchange behind a proxy you control).
 */

const TOKEN_TTL_MS = 50 * 60 * 1000; // 50 minutes (Cognito access tokens last 60)
const REFRESH_BUFFER_MS = 60 * 1000; // refresh ~1 min before expiry

const env = {
  clientId: process.env.EXPO_PUBLIC_PAY_CORE_COGNITO_CLIENT_ID,
  clientSecret: process.env.EXPO_PUBLIC_PAY_CORE_COGNITO_CLIENT_SECRET,
  tokenEndpoint: process.env.EXPO_PUBLIC_PAY_CORE_COGNITO_TOKEN_ENDPOINT,
  scope: process.env.EXPO_PUBLIC_PAY_CORE_COGNITO_SCOPE,
};

interface CognitoTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export class PayCoreCognitoAuthError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "PayCoreCognitoAuthError";
    this.statusCode = statusCode;
  }
}

let cached: { token: string; expiresAt: number } | null = null;
let pending: Promise<string> | null = null;

function basicAuthHeader(clientId: string, clientSecret: string): string {
  const credentials = `${clientId}:${clientSecret}`;
  const g = globalThis as {
    btoa?: (s: string) => string;
    Buffer?: typeof Buffer;
  };
  if (typeof g.btoa === "function") return g.btoa(credentials);
  if (g.Buffer) return g.Buffer.from(credentials, "utf-8").toString("base64");
  throw new PayCoreCognitoAuthError(
    "No base64 encoder available (btoa / Buffer)",
  );
}

async function fetchNewToken(): Promise<string> {
  const { clientId, clientSecret, tokenEndpoint, scope } = env;
  if (!clientId || !clientSecret || !tokenEndpoint) {
    console.error(
      "EXPO_PUBLIC_PAY_CORE_COGNITO_{CLIENT_ID,CLIENT_SECRET,TOKEN_ENDPOINT} must be set",
      { clientId, clientSecret, tokenEndpoint },
    );
    throw new PayCoreCognitoAuthError(
      "EXPO_PUBLIC_PAY_CORE_COGNITO_{CLIENT_ID,CLIENT_SECRET,TOKEN_ENDPOINT} must be set",
    );
  }

  const body = new URLSearchParams({ grant_type: "client_credentials" });
  if (scope) body.set("scope", scope);

  if (__DEV__) console.log(`[cognito] → POST ${tokenEndpoint}`);

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuthHeader(clientId, clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    if (__DEV__) console.warn(`[cognito] ✗ ${response.status} ${text}`);
    throw new PayCoreCognitoAuthError(
      `Failed to fetch Cognito token (${response.status}): ${text || response.statusText}`,
      response.status,
    );
  }

  const data = (await response.json()) as CognitoTokenResponse;
  if (__DEV__) {
    console.log(`[cognito] ✓ access token (expires_in ${data.expires_in}s)`);
  }
  return data.access_token;
}

/**
 * Get a Cognito access token, minting one via client_credentials if needed.
 * Cached in memory for 50 minutes; concurrent callers share the same
 * in-flight request.
 */
export async function getPayCoreCognitoToken(): Promise<string> {
  const now = Date.now();
  if (cached && now < cached.expiresAt - REFRESH_BUFFER_MS) {
    return cached.token;
  }
  if (pending) return pending;

  pending = (async () => {
    try {
      const token = await fetchNewToken();
      cached = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
      return token;
    } finally {
      pending = null;
    }
  })();

  return pending;
}

/** Drop the cached token (e.g. after a 401) so the next call mints a fresh one. */
export function clearPayCoreCognitoTokenCache(): void {
  cached = null;
  pending = null;
}
