import * as Sentry from "@sentry/react-native";

import { maskPathIds } from "./api";
import { getBuildVariant } from "./build-variant";

const BUILD_VARIANT = getBuildVariant();
const IS_PRODUCTION = BUILD_VARIANT === "production";

const stripQuery = (value: unknown) =>
  typeof value === "string" ? value.replace(/[?#].*$/, "") : value;

// Keeps navigation breadcrumbs (enough context for automatic errors) and drops
// the rest, so network and console activity don't become a second logging
// pipeline. On web, history breadcrumbs record full URLs, including the query
// string. The `wpay://setup?apiKey=…` deep link lands on `/setup?apiKey=…`, so
// queries are stripped to keep secrets out of Sentry.
export function filterBreadcrumb(
  breadcrumb: Sentry.Breadcrumb | null,
): Sentry.Breadcrumb | null {
  if (breadcrumb?.category !== "navigation") return null;
  if (!breadcrumb.data) return breadcrumb;
  return {
    ...breadcrumb,
    data: {
      ...breadcrumb.data,
      from: stripQuery(breadcrumb.data.from),
      to: stripQuery(breadcrumb.data.to),
    },
  };
}

// Call once at module scope in the root layout, before the app renders.
export function initSentry(): void {
  const tracePropagationTargets = [
    ...(process.env.EXPO_PUBLIC_API_URL
      ? [process.env.EXPO_PUBLIC_API_URL]
      : []),
    ...(process.env.EXPO_PUBLIC_MERCHANT_DEV_API_URL
      ? [process.env.EXPO_PUBLIC_MERCHANT_DEV_API_URL]
      : []),
    /^\/api\//,
  ];

  // Sentry's Expo Router, replay, and tracing defaults are enabled by the
  // options below. This only narrows HTTP spans to our own API and web proxy.
  const integrations = [
    Sentry.reactNativeTracingIntegration({
      shouldCreateSpanForRequest: (url) =>
        tracePropagationTargets.some((target) =>
          typeof target === "string" ? url.includes(target) : target.test(url),
        ),
    }),
  ];

  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    sendDefaultPii: false,

    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: IS_PRODUCTION ? 0.1 : 0,

    tracesSampleRate: IS_PRODUCTION ? 0.2 : 1.0,

    tracePropagationTargets,
    integrations,

    environment: BUILD_VARIANT,
    initialScope: { tags: { build_variant: BUILD_VARIANT } },

    // Automatic events may include the active request context. We do not need
    // request URLs, headers, bodies, or responses in Sentry.
    beforeSend: (event) => {
      delete event.request;
      return event;
    },
    // Transactions skip `beforeSend`; on web their request URL can still hold
    // a deep link's query (e.g. the setup API key).
    beforeSendTransaction: (event) => {
      delete event.request;
      return event;
    },
    beforeSendSpan: (span) => {
      if (span.op?.startsWith("http") && span.description) {
        span.description = maskPathIds(span.description);
      }
      return span;
    },
    beforeBreadcrumb: filterBreadcrumb,
  });
}
