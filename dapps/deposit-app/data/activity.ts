/**
 * Mocked recent-activity feed for the Home screen. New deposits made through
 * the simulated flow are prepended to this list at runtime (see the deposit
 * store).
 */
export type ActivityType = 'trade' | 'deposit';

export interface ActivityItem {
  type: ActivityType;
  label: string;
  sub: string;
  amount: string;
  value: string;
  time: string;
  positive: boolean;
}

// Start empty + at zero — only real deposits made through the flow appear here.
export const INITIAL_ACTIVITY: ActivityItem[] = [];

export const INITIAL_BALANCE = 0;
