"use client";

import { Recipe } from "@/lib/types";

type Props = {
  recipe: Recipe;
};

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes === 0) return `${remaining}s`;
  return remaining === 0 ? `${minutes}m` : `${minutes}m ${remaining}s`;
}

export default function CookMode({ recipe }: Props) {
  return (
    <div className="mt-6">
      {/* Perforated tear-line, as if this ticket was just pulled off the rail */}
      <div className="perforated-top h-4" />
      <div className="bg-ink text-paper px-5 pt-4 pb-5 ticket-shadow">
        <div className="flex items-center justify-between border-b border-dashed border-paper/25 pb-3">
          <span className="text-[10px] tracking-[0.3em] uppercase text-paper/50">
            Order up
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase bg-stamp text-paper px-2 py-1 -rotate-2 inline-block">
            Fire
          </span>
        </div>

        <h2 className="text-lg font-bold mt-3 mb-1 tracking-tight">{recipe.title}</h2>
        <p className="text-xs text-paper/60 mb-4">
          {recipe.equipment_used.join(" · ") || "no equipment listed"}
          {recipe.macro_estimate.calories != null &&
            ` · ${recipe.macro_estimate.calories} kcal`}
          {recipe.macro_estimate.protein_g != null &&
            ` · ${recipe.macro_estimate.protein_g}g protein`}
        </p>

        <ol className="space-y-2">
          {recipe.steps.map((step) => (
            <li
              key={step.step_number}
              className="flex justify-between gap-4 text-sm border-b border-dashed border-paper/15 pb-2 last:border-none"
            >
              <span>
                <span className="text-paper/40 mr-2">
                  {String(step.step_number).padStart(2, "0")}
                </span>
                {step.instruction}
              </span>
              {step.duration_seconds != null && (
                <span className="shrink-0 text-stamp font-bold whitespace-nowrap">
                  {formatDuration(step.duration_seconds)}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
