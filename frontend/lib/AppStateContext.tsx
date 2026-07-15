"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  ActivityLevel,
  DailyCheckIn,
  Equipment,
  GoalState,
  GoalType,
  Ingredient,
  RecipeHistoryEntry,
} from "@/lib/types";
import { todayIsoDate, daysSince } from "@/lib/dateUtils";
import { loadCheckIns, saveCheckIn } from "@/lib/checkInStorage";
import { loadGoal, saveGoal } from "@/lib/goalStorage";

type AppState = {
  ingredients: Ingredient[];
  setIngredients: (i: Ingredient[]) => void;
  equipment: Equipment[];
  setEquipment: (e: Equipment[]) => void;
  activityLevel: ActivityLevel;
  setActivityLevel: (a: ActivityLevel) => void;
  timeConstraintMin: number;
  setTimeConstraintMin: (m: number) => void;
  recipeHistory: RecipeHistoryEntry[];
  addRecipeToHistory: (entry: RecipeHistoryEntry) => void;
  removeRecipeFromHistory: (id: string) => void;
  clearRecipeHistory: () => void;

  // Daily check-in
  todayCheckIn: DailyCheckIn | null;
  checkInOpen: boolean;
  openCheckIn: () => void;
  closeCheckIn: () => void;
  submitCheckIn: (entry: Omit<DailyCheckIn, "date" | "skipped">) => void;
  skipCheckIn: () => void;

  // Long-term goal
  goal: GoalState | null;
  needsGoalConfirmation: boolean;
  setGoal: (goal: GoalType) => void;
  confirmGoal: () => void;
};

// NOTE: most of this is in-memory only, so it resets on refresh — except
// daily check-ins, which are saved to localStorage since "once per day"
// only makes sense if it survives a page reload. Once Supabase is wired
// up, check-ins should move to the `activity_logs` table instead.
const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("active_light");
  const [timeConstraintMin, setTimeConstraintMin] = useState(20);
  const [recipeHistory, setRecipeHistory] = useState<RecipeHistoryEntry[]>([]);

  const [checkIns, setCheckIns] = useState<Record<string, DailyCheckIn>>({});
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [goal, setGoalState] = useState<GoalState | null>(null);

  // On first mount, load saved check-ins and auto-open the modal if
  // today doesn't have one yet. Also load the saved long-term goal, if any.
  useEffect(() => {
    const loaded = loadCheckIns();
    setCheckIns(loaded);
    if (!loaded[todayIsoDate()]) {
      setCheckInOpen(true);
    }
    setGoalState(loadGoal());
  }, []);

  function addRecipeToHistory(entry: RecipeHistoryEntry) {
    setRecipeHistory((prev) => [entry, ...prev]);
  }

  function removeRecipeFromHistory(id: string) {
    setRecipeHistory((prev) => prev.filter((entry) => entry.id !== id));
  }

  function clearRecipeHistory() {
    setRecipeHistory([]);
  }

  function submitCheckIn(entry: Omit<DailyCheckIn, "date" | "skipped">) {
    const full: DailyCheckIn = { ...entry, date: todayIsoDate(), skipped: false };
    saveCheckIn(full);
    setCheckIns((prev) => ({ ...prev, [full.date]: full }));
    setCheckInOpen(false);
  }

  function skipCheckIn() {
    const full: DailyCheckIn = {
      date: todayIsoDate(),
      skipped: true,
      sleepHours: null,
      sleepQuality: null,
      feeling: "",
      foodChanges: "",
    };
    saveCheckIn(full);
    setCheckIns((prev) => ({ ...prev, [full.date]: full }));
    setCheckInOpen(false);
  }

  const todayCheckIn = checkIns[todayIsoDate()] ?? null;

  function setGoal(goalType: GoalType) {
    const full: GoalState = {
      goal: goalType,
      setDate: todayIsoDate(),
      lastConfirmedDate: todayIsoDate(),
    };
    saveGoal(full);
    setGoalState(full);
  }

  function confirmGoal() {
    if (!goal) return;
    const updated: GoalState = { ...goal, lastConfirmedDate: todayIsoDate() };
    saveGoal(updated);
    setGoalState(updated);
  }

  // Nudge to reconfirm roughly weekly, per the plan discussed for goal cadence
  const needsGoalConfirmation = goal != null && daysSince(goal.lastConfirmedDate) >= 7;

  return (
    <AppStateContext.Provider
      value={{
        ingredients,
        setIngredients,
        equipment,
        setEquipment,
        activityLevel,
        setActivityLevel,
        timeConstraintMin,
        setTimeConstraintMin,
        recipeHistory,
        addRecipeToHistory,
        removeRecipeFromHistory,
        clearRecipeHistory,
        todayCheckIn,
        checkInOpen,
        openCheckIn: () => setCheckInOpen(true),
        closeCheckIn: () => setCheckInOpen(false),
        submitCheckIn,
        skipCheckIn,
        goal,
        needsGoalConfirmation,
        setGoal,
        confirmGoal,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
