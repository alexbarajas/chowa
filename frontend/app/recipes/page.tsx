"use client";

import CookMode from "@/components/CookMode";
import { useAppState } from "@/lib/AppStateContext";

export default function RecipesPage() {
  const { recipeHistory, removeRecipeFromHistory, clearRecipeHistory } = useAppState();

  if (recipeHistory.length === 0) {
    return (
      <div className="border border-dashed border-ink/25 p-6 text-center text-sm text-ink/50">
        No recipes yet — head to the Kitchen tab and generate one.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            if (confirm("Clear all recipe history? This can't be undone.")) {
              clearRecipeHistory();
            }
          }}
          className="text-xs uppercase tracking-wide text-ink/40 hover:text-stamp"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-8">
        {recipeHistory.map((entry) => (
          <div key={entry.id} className="relative">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase tracking-widest text-ink/40">
                {new Date(entry.createdAt).toLocaleString()}
              </p>
              <button
                onClick={() => removeRecipeFromHistory(entry.id)}
                className="text-[10px] uppercase tracking-widest text-ink/40 hover:text-stamp"
              >
                remove
              </button>
            </div>
            <CookMode recipe={entry.recipe} />
          </div>
        ))}
      </div>
    </div>
  );
}
