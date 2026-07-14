export type Ingredient = {
  id: string;
  name: string; // free text, e.g. "0.5-inch thick ribeye, added yesterday"
};

export type Equipment = {
  id: string;
  name: string;
  category: string; // 'pan' | 'appliance' | 'knife' | 'thermometer' | ...
  capabilities: Record<string, unknown>;
};

export type ActivityLevel = "heavy_workout" | "active_light" | "sedentary";

export type RecipeStep = {
  step_number: number;
  instruction: string;
  duration_seconds: number | null;
};

export type Recipe = {
  title: string;
  steps: RecipeStep[];
  macro_estimate: { calories: number | null; protein_g: number | null };
  equipment_used: string[];
};

export type RecipeHistoryEntry = {
  id: string;
  createdAt: string; // ISO timestamp
  recipe: Recipe;
};
