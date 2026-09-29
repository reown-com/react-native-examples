import { filterBreadcrumb } from "@/utils/sentry";

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
