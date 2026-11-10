export interface AccountSuspensionFlags {
  isBanned?: boolean | null;
  isBlocked?: boolean | null;
  bannedUntil?: Date | string | null;
  blockedUntil?: Date | string | null;
}

const isFlagActive = (
  flag: boolean | null | undefined,
  until: Date | string | null | undefined,
  now: number,
): boolean => {
  if (!flag) return false;
  if (!until) return true; // no expiry: suspended until an admin lifts it
  const untilMs = new Date(until).getTime();
  return Number.isNaN(untilMs) || untilMs > now;
};

/**
 * True while an admin ban or block is in force. A ban/block with an expiry date
 * stops applying once that date has passed.
 */
export function isAccountSuspended(
  flags: AccountSuspensionFlags | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!flags) return false;
  return (
    isFlagActive(flags.isBanned, flags.bannedUntil, now) ||
    isFlagActive(flags.isBlocked, flags.blockedUntil, now)
  );
}

export const ACCOUNT_SUSPENDED_ERROR =
  "Konto zostało zablokowane. Skontaktuj się z administratorem.";
