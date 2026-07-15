import { IngredientCategory } from "@/lib/types";

/** Days elapsed since an ISO date string (0 = added today). */
export function daysSince(isoDate: string): number {
  const then = new Date(isoDate + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = now.getTime() - then.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

export function todayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Rough "use it soon" thresholds by category — not precise food science,
// just enough to stop treating a ribeye and a bag of rice the same way.
// Worth refining later (e.g. per-ingredient overrides) once real usage shows
// where these are wrong.
const URGENT_THRESHOLD_DAYS: Record<IngredientCategory, number> = {
  protein: 3,
  produce: 4,
  dairy: 6,
  pantry: 21,
  other: 4,
};

export function freshnessLabel(
  days: number,
  category: IngredientCategory,
  frozen: boolean = false
): { text: string; urgent: boolean } {
  if (frozen) {
    // Freezing effectively pauses the clock — still worth surfacing age
    // (freezer burn, "just use it already"), but never urgent the way
    // fresh food is.
    if (days === 0) return { text: "frozen today", urgent: false };
    if (days === 1) return { text: "frozen 1 day ago", urgent: false };
    return { text: `frozen ${days} days ago`, urgent: days >= 90 };
  }

  const threshold = URGENT_THRESHOLD_DAYS[category];
  const urgent = days >= threshold;

  if (days === 0) return { text: "added today", urgent: false };
  if (days === 1) return { text: "1 day ago", urgent };
  return { text: `${days} days ago${urgent ? " — use soon" : ""}`, urgent };
}
