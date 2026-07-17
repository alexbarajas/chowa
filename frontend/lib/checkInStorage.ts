import { DailyCheckIn } from "@/lib/types";

const STORAGE_KEY = "chowa-checkins";

export function loadCheckIns(): Record<string, DailyCheckIn> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCheckIn(entry: DailyCheckIn) {
  const all = loadCheckIns();
  all[entry.date] = entry;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/** Most recent non-skipped check-in, used to find "current" weight/feeling/sleep. */
export function mostRecentCheckIn(checkIns: Record<string, DailyCheckIn>): DailyCheckIn | null {
  const dates = Object.keys(checkIns).sort().reverse();
  for (const date of dates) {
    const entry = checkIns[date];
    if (entry && !entry.skipped) return entry;
  }
  return null;
}
