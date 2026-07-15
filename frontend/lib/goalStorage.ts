import { GoalState } from "@/lib/types";

const STORAGE_KEY = "chowa-goal";

export function loadGoal(): GoalState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGoal(goal: GoalState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goal));
}
