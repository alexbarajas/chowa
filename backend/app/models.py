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
