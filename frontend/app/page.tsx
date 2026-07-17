"use client";

import { useState } from "react";
import ActivityPicker from "@/components/ActivityPicker";
import CookMode from "@/components/CookMode";
import TicketSkeleton from "@/components/TicketSkeleton";
import { generateRecipe } from "@/lib/backend";
import { useAppState } from "@/lib/AppStateContext";
import { Recipe } from "@/lib/types";
import { daysSince, freshnessLabel } from "@/lib/dateUtils";

export default function KitchenPage() {
  const {
    ingredients,
    equipment,
    activityLevel,
    setActivityLevel,
    timeConstraintMin,
    setTimeConstraintMin,
    addRecipeToHistory,
    todayCheckIn,
    openCheckIn,
    goal,
  } = useAppState();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function buildSleepContext(): string | undefined {
    if (!todayCheckIn || todayCheckIn.skipped) return undefined;
    const parts: string[] = [];
    if (todayCheckIn.sleepHours != null) parts.push(`slept ${todayCheckIn.sleepHours}h`);
    if (todayCheckIn.sleepQuality != null) parts.push(`sleep quality ${todayCheckIn.sleepQuality}/4`);
    if (todayCheckIn.feeling) parts.push(`feeling: ${todayCheckIn.feeling}`);
    if (todayCheckIn.foodChanges) parts.push(`food changes today: ${todayCheckIn.foodChanges}`);
    return parts.length > 0 ? parts.join(", ") : undefined;
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const result = (await generateRecipe({
        ingredients: ingredients.map((i) => ({
          name: `${i.name} (${freshnessLabel(daysSince(i.dateAdded), i.category, i.frozen).text})`,
        })),
        equipment: equipment.map((e) => ({
          name: e.name,
          category: e.category,
          capabilities: e.capabilities,
        })),
        time_constraint_min: timeConstraintMin,
        activity_level: activityLevel,
        sleep_context: buildSleepContext(),
        goal_context: goal
          ? goal.goal === "custom"
            ? `goal: custom — ${goal.customGuidance ?? goal.customDescription}`
            : `goal: ${goal.goal}`
          : undefined,
      })) as Recipe;

      setRecipe(result);
      addRecipeToHistory({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        recipe: result,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {todayCheckIn && !todayCheckIn.skipped && (
        <div className="flex items-center justify-between text-xs text-ink/50 mb-4 border border-ink/10 px-3 py-2">
          <span>
            Today: {todayCheckIn.sleepHours}h sleep · quality {todayCheckIn.sleepQuality}/4
            {todayCheckIn.feeling && ` · feeling: ${todayCheckIn.feeling}`}
          </span>
          <button onClick={openCheckIn} className="underline hover:text-stamp shrink-0 ml-2">
            edit
          </button>
        </div>
      )}
      {todayCheckIn?.skipped && (
        <div className="flex items-center justify-between text-xs text-ink/40 mb-4">
          <span>Skipped today's check-in</span>
          <button onClick={openCheckIn} className="underline hover:text-stamp">
            add one
          </button>
        </div>
      )}

      {ingredients.length === 0 && (
        <p className="text-sm text-ink/50 mb-4">
          No ingredients yet — add some on the{" "}
          <a href="/inventory" className="underline hover:text-stamp">
            Inventory
          </a>{" "}
          tab first.
        </p>
      )}

      <ActivityPicker
        activityLevel={activityLevel}
        onActivityChange={setActivityLevel}
        timeConstraintMin={timeConstraintMin}
        onTimeChange={setTimeConstraintMin}
      />

      <button
        onClick={handleGenerate}
        disabled={loading || ingredients.length === 0}
        className="mt-4 w-full py-3 bg-ink text-paper text-sm uppercase tracking-[0.2em] font-bold hover:bg-stamp disabled:opacity-30 disabled:hover:bg-ink transition-colors"
      >
        {loading ? "Firing..." : "Send to kitchen"}
      </button>

      {error && (
        <p className="mt-3 text-sm text-stamp border border-stamp/40 px-3 py-2 bg-stamp/5">
          {error}
        </p>
      )}
      {loading && <TicketSkeleton />}
      {!loading && recipe && <CookMode recipe={recipe} />}
    </div>
  );
}
