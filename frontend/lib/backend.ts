const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export type RecipeRequest = {
  ingredients: { name: string }[];
  equipment: { name: string; category: string; capabilities?: Record<string, unknown> }[];
  time_constraint_min: number;
  activity_level?: string;
  sleep_context?: string;
  goal_context?: string;
};

export async function generateRecipe(payload: RecipeRequest) {
  const res = await fetch(`${BACKEND_URL}/generate-recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Recipe generation failed: ${res.status}`);
  }

  return res.json();
}
