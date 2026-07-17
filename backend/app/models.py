from pydantic import BaseModel
from typing import Optional


class EquipmentItem(BaseModel):
    name: str
    category: str
    capabilities: dict = {}


class IngredientItem(BaseModel):
    name: str  # free text, e.g. "0.5-inch thick ribeye, added yesterday"


class RecipeRequest(BaseModel):
    ingredients: list[IngredientItem]
    equipment: list[EquipmentItem]
    time_constraint_min: int
    activity_level: Optional[str] = None  # 'heavy_workout' | 'active_light' | 'sedentary'
    sleep_context: Optional[str] = None  # e.g. "slept 6.5h, sleep quality 2/4, feeling: foggy"
    goal_context: Optional[str] = None  # e.g. "goal: recover" | "goal: maintain" | "goal: gain"


class RecipeStep(BaseModel):
    step_number: int
    instruction: str
    duration_seconds: Optional[int] = None


class MacroEstimate(BaseModel):
    calories: Optional[int] = None
    protein_g: Optional[int] = None


class RecipeResponse(BaseModel):
    title: str
    steps: list[RecipeStep]
    macro_estimate: MacroEstimate
    equipment_used: list[str]


class GoalRequest(BaseModel):
    description: str  # free text, e.g. "I want to look good for a wedding in October"


class GoalResponse(BaseModel):
    summary: str  # short goal name/title, e.g. "Lean out for October wedding"
    guidance: str  # 1-2 sentences of practical macro/food guidance, fed into recipe generation
