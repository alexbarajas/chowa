export type IngredientCategory = "protein" | "produce" | "dairy" | "pantry" | "other";

export type Ingredient = {
  id: string;
  name: string; // free text, e.g. "0.5-inch thick ribeye"
  dateAdded: string; // ISO date string, e.g. "2026-07-14"
  category: IngredientCategory;
  frozen: boolean;
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

export type DailyCheckIn = {
  date: string; // ISO date string
  skipped: boolean;
  weight: number | null;
  sleepHours: number | null;
  sleepQuality: number | null; // 1 (rough) – 4 (great)
  feeling: string;
  foodChanges: string;
};

export type GoalType = "recover" | "maintain" | "gain" | "cut" | "custom";

export type GoalBaseline = {
  date: string; // ISO date the baseline was captured
  weight: number | null;
  feeling: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  recipesCookedCount: number; // recipeHistory.length at the moment the goal was set
};

export type GoalState = {
  goal: GoalType;
  customDescription?: string; // only for goal === "custom" — the AI-generated summary
  customGuidance?: string; // only for goal === "custom" — short guidance fed into recipe generation
  setDate: string; // ISO date the goal was set or last changed
  lastConfirmedDate: string; // ISO date of the last "yes, still my goal" confirmation
  baseline: GoalBaseline;
};
