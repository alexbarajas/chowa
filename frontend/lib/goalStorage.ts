import { GoalState } from "@/lib/types";
import { todayIsoDate } from "@/lib/dateUtils";

const STORAGE_KEY = "chowa-goal";

export function loadGoal(): GoalState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GoalState;

    // Backward compatibility: goals saved before the baseline snapshot
    // feature existed won't have a `baseline` field. Backfill one so
    // older data doesn't crash the "then vs now" comparison.
    if (!parsed.baseline) {
      parsed.baseline = {
        date: parsed.setDate ?? todayIsoDate(),
        weight: null,
        feeling: "",
        sleepHours: null,
        sleepQuality: null,
        recipesCookedCount: 0,
      };
      saveGoal(parsed);
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveGoal(goal: GoalState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goal));
}
