"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  ActivityLevel,
  DailyCheckIn,
  Equipment,
  Ingredient,
  RecipeHistoryEntry,
} from "@/lib/types";
import { todayIsoDate } from "@/lib/dateUtils";
import { loadCheckIns, saveCheckIn } from "@/lib/checkInStorage";

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

  // On first mount, load saved check-ins and auto-open the modal if
  // today doesn't have one yet.
  useEffect(() => {
    const loaded = loadCheckIns();
    setCheckIns(loaded);
    if (!loaded[todayIsoDate()]) {
      setCheckInOpen(true);
    }
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
