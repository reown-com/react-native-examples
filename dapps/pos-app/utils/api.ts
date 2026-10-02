/**
 * Replace ID-like segments of a URL path with `:id` so it stays short and
 * paths to the same route group together (e.g.
 * `/merchant/payment/pay_57a2.../status` -> `/merchant/payment/:id/status`).
 * Masks prefixed ids (`pay_...`), UUIDs, and long opaque tokens. Keep the
 * original path alongside (e.g. in a log's `data`) when the real id is needed.
 */
export function maskPathIds(path: string): string {
  return path
    .split("/")
    .map((segment) => {
      if (!segment) return segment;
      // Prefixed ids: pay_..., cus_..., mer_..., etc.
      if (/^[a-z]+_[A-Za-z0-9]+$/.test(segment)) return ":id";
      // UUIDs
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          segment,
        )
      ) {
        return ":id";
      }
      // Long opaque tokens mixing letters and digits
      if (
        segment.length >= 16 &&
        /[A-Za-z]/.test(segment) &&
        /\d/.test(segment)
      ) {
        return ":id";
      }
      return segment;
    })
    .join("/");
}
