"use client";

import { useState } from "react";
import IngredientForm from "@/components/IngredientForm";
import EquipmentForm from "@/components/EquipmentForm";
import ActivityPicker from "@/components/ActivityPicker";
import CookMode from "@/components/CookMode";
import ProfileMenu from "@/components/ProfileMenu";
import { generateRecipe } from "@/lib/backend";
import { ActivityLevel, Equipment, Ingredient, Recipe } from "@/lib/types";

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("active_light");
  const [timeConstraintMin, setTimeConstraintMin] = useState(20);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const result = await generateRecipe({
        ingredients: ingredients.map((i) => ({ name: i.name })),
        equipment: equipment.map((e) => ({
          name: e.name,
          category: e.category,
          capabilities: e.capabilities,
        })),
        time_constraint_min: timeConstraintMin,
        activity_level: activityLevel,
      });
      setRecipe(result as Recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-xl mx-auto px-4 py-10">
        <header className="mb-6 flex items-end justify-between border-b-2 border-ink pb-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CHOWA</h1>
            <p className="text-xs text-ink/50 tracking-wide">
              cook what you have · 調和
            </p>
          </div>
          <ProfileMenu />
        </header>

        <IngredientForm ingredients={ingredients} onChange={setIngredients} />
        <EquipmentForm equipment={equipment} onChange={setEquipment} />
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
        {recipe && <CookMode recipe={recipe} />}
      </div>
    </main>
  );
}
