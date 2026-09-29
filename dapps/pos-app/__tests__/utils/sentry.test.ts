import { filterBreadcrumb, filterTransaction } from "@/utils/sentry";
import type { TransactionEvent } from "@sentry/react-native";

describe("filterBreadcrumb", () => {
  it("strips query strings from web history breadcrumbs", () => {
    expect(
      filterBreadcrumb({
        category: "navigation",
        data: {
          from: "/setup?apiKey=sk_live_secret&merchantId=mrch_1",
          to: "/settings#top",
        },
      }),
    ).toEqual({
      category: "navigation",
      data: { from: "/setup", to: "/settings" },
    });
  });

  it("keeps native navigation breadcrumbs, which only carry route names", () => {
    const breadcrumb = {
      category: "navigation",
      message: "Navigation to settings",
      data: { from: "setup", to: "settings" },
    };
    expect(filterBreadcrumb(breadcrumb)).toEqual(breadcrumb);
  });

  it("drops non-navigation breadcrumbs", () => {
    expect(filterBreadcrumb({ category: "console", message: "x" })).toBeNull();
    expect(filterBreadcrumb({ category: "deeplink" })).toBeNull();
    expect(filterBreadcrumb(null)).toBeNull();
  });
});

describe("filterTransaction", () => {
  it("strips setup queries from the request, root trace, and child spans", () => {
    const event: TransactionEvent = {
      type: "transaction",
      request: {
        url: "https://pay.example/setup?apiKey=sk_live_secret&merchantId=m1",
      },
      contexts: {
        trace: {
          trace_id: "0".repeat(32),
          span_id: "0".repeat(16),
          data: {
            "url.full":
              "https://pay.example/setup?apiKey=sk_live_secret&merchantId=m1",
          },
        },
      },
      spans: [
        {
          trace_id: "0".repeat(32),
          span_id: "1".repeat(16),
          start_timestamp: 1,
          data: {
            "url.full": "https://pay.example/setup?apiKey=sk_live_secret",
            "route.url": "/setup?apiKey=sk_live_secret",
            safe: "keep-me",
          },
        },
      ],
    };

    expect(filterTransaction(event)).toMatchObject({
      contexts: {
        trace: { data: { "url.full": "https://pay.example/setup" } },
      },
      spans: [
        {
          data: {
            "url.full": "https://pay.example/setup",
            "route.url": "/setup",
            safe: "keep-me",
          },
        },
      ],
    });
    expect(event.request).toBeUndefined();
  });
});
