import * as Sentry from "@sentry/react-native";

import { maskPathIds } from "./api";
import { getBuildVariant } from "./build-variant";

const BUILD_VARIANT = getBuildVariant();
const IS_PRODUCTION = BUILD_VARIANT === "production";

const stripQuery = (value: unknown) =>
  typeof value === "string" ? value.replace(/[?#].*$/, "") : value;

const URL_DATA_KEYS = ["url.full", "http.url", "route.url"] as const;
type SentrySpan = Parameters<
  NonNullable<Sentry.ReactNativeOptions["beforeSendSpan"]>
>[0];

function stripQueriesFromSpanData(
  data: Record<string, unknown> | undefined,
): void {
  if (!data) return;
  for (const key of URL_DATA_KEYS) {
    const value = data[key];
    if (typeof value === "string") data[key] = stripQuery(value);
  }
}

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

// On web, Sentry's HttpContext integration stores the current page URL in the
// root span's `url.full` attribute as well as in `event.request`. Scrub both the
// root trace and child spans so setup credentials cannot survive in trace data.
export function filterTransaction(
  event: Sentry.TransactionEvent,
): Sentry.TransactionEvent {
  delete event.request;
  stripQueriesFromSpanData(event.contexts?.trace?.data);
  event.spans?.forEach((span) => stripQueriesFromSpanData(span.data));
  return event;
}

export function filterSpan(span: SentrySpan): SentrySpan {
  stripQueriesFromSpanData(span.data);
  if (span.op?.startsWith("http") && span.description) {
    span.description = maskPathIds(span.description);
  }
  return span;
}

// Call once at module scope in the root layout, before the app renders.
export function initSentry(): void {
  const tracePropagationTargets = [
    ...(process.env.EXPO_PUBLIC_API_URL
      ? [process.env.EXPO_PUBLIC_API_URL]
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
    beforeSendTransaction: filterTransaction,
    beforeSendSpan: filterSpan,
    beforeBreadcrumb: filterBreadcrumb,
  });
}
