import * as Application from "expo-application";

export type BuildVariant = "development" | "internal" | "production";

/**
 * Which build we're running, used to tag Sentry `environment` so internal/dev
 * test builds report separately and never pollute the production dashboards and
 * alerts we actually measure.
 *
 * - `development` — Metro / dev client (`__DEV__`).
 * - `internal`    — the "WPay Dev" build; its applicationId carries the
 *                   `.internal` suffix applied by the Gradle `internal` buildType
 *                   (see app.config.js / plugins/withAndroidVariants.js).
 * - `production`  — the shipped WalletConnect Pay build.
 */
export function getBuildVariant(): BuildVariant {
  if (__DEV__) return "development";
  const applicationId = Application.applicationId ?? "";
  return applicationId.endsWith(".internal") ? "internal" : "production";
}
