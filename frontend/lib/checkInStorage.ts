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
