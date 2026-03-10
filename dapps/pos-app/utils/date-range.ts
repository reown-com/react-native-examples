import { DateRangeFilterType } from "./types";

interface DateRange {
  fromDate?: string;
  toDate?: string;
}

/**
 * Computes ISO date strings for a given date range filter.
 */
export function getDateRange(filter: DateRangeFilterType): DateRange {
  if (filter === "all_time") {
    return {};
  }

  const now = new Date();
  const toDate = now.toISOString();
  let from: Date;

  switch (filter) {
    case "today": {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    }
    case "7_days": {
      from = new Date(now);
      from.setDate(from.getDate() - 7);
      from.setHours(0, 0, 0, 0);
      break;
    }
    case "this_week": {
      from = new Date(now);
      const day = from.getDay();
      // Monday = 1, Sunday = 0 → shift so Monday is start of week
      const diff = day === 0 ? 6 : day - 1;
      from.setDate(from.getDate() - diff);
      from.setHours(0, 0, 0, 0);
      break;
    }
    case "this_month": {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
  }

  return { fromDate: from.toISOString(), toDate };
}
