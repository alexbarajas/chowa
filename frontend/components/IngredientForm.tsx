"use client";

import { useState } from "react";
import { Ingredient } from "@/lib/types";
import { daysSince, freshnessLabel, todayIsoDate } from "@/lib/dateUtils";

type Props = {
  ingredients: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
};

export default function IngredientForm({ ingredients, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [dateAdded, setDateAdded] = useState(todayIsoDate());

  function addIngredient() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...ingredients, { id: crypto.randomUUID(), name: trimmed, dateAdded }]);
    setDraft("");
    setDateAdded(todayIsoDate());
  }

  function removeIngredient(id: string) {
    onChange(ingredients.filter((i) => i.id !== id));
  }

  // Oldest first — surfaces what needs to be used soonest
  const sorted = [...ingredients].sort((a, b) => a.dateAdded.localeCompare(b.dateAdded));

  return (
    <section className="border border-ink/15 bg-paper ticket-shadow">
      <div className="flex items-baseline justify-between px-4 pt-3 pb-2 tear-line">
        <h2 className="text-xs tracking-[0.2em] uppercase font-bold">Ingredients</h2>
        <span className="text-xs text-ink/50">{ingredients.length} on hand</span>
      </div>

      <div className="flex flex-wrap gap-2 p-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addIngredient()}
          placeholder="0.5-inch thick ribeye"
          className="flex-1 min-w-[180px] bg-transparent border-b border-ink/30 px-1 py-1 text-sm placeholder:text-ink/35 focus:outline-none focus:border-stamp"
        />
        <input
          type="date"
          value={dateAdded}
          max={todayIsoDate()}
          onChange={(e) => setDateAdded(e.target.value)}
          className="bg-transparent border-b border-ink/30 px-1 py-1 text-sm focus:outline-none focus:border-stamp"
        />
        <button
          onClick={addIngredient}
          className="text-xs uppercase tracking-wide px-3 py-1 border border-ink/30 hover:bg-ink hover:text-paper transition-colors"
        >
          Add
        </button>
      </div>

      {sorted.length > 0 && (
        <ul className="px-4 pb-4 -mt-1 space-y-1">
          {sorted.map((ingredient, idx) => {
            const days = daysSince(ingredient.dateAdded);
            const freshness = freshnessLabel(days);
            return (
              <li
                key={ingredient.id}
                className="flex items-center justify-between text-sm py-1 border-b border-dashed border-ink/15 last:border-none gap-2"
              >
                <span>
                  <span className="text-ink/40 mr-2">{String(idx + 1).padStart(2, "0")}</span>
                  {ingredient.name}
                  <span
                    className={`ml-2 text-xs ${
                      freshness.urgent ? "text-stamp font-bold" : "text-ink/40"
                    }`}
                  >
                    · {freshness.text}
                  </span>
                </span>
                <button
                  onClick={() => removeIngredient(ingredient.id)}
                  className="text-ink/40 hover:text-stamp text-xs uppercase tracking-wide shrink-0"
                >
                  remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
