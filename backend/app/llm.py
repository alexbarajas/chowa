import json
import os
import re

from anthropic import Anthropic

from app.models import GoalRequest, GoalResponse, RecipeRequest, RecipeResponse

client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are a precise cooking assistant. Given a list of \
ingredients (free text, may include cut/thickness/age), a list of kitchen \
equipment (with capability details), a time constraint in minutes, an \
optional activity level, and optional sleep/how-they're-feeling context, \
produce ONE recipe.

Respond with ONLY a JSON object, no preamble, no markdown fences. Shape:
{
  "title": string,
  "steps": [{"step_number": int, "instruction": string, "duration_seconds": int or null}],
  "macro_estimate": {"calories": int or null, "protein_g": int or null},
  "equipment_used": [string]
}

Rules:
- Only use ingredients and equipment actually provided.
- Instructions must respect any equipment capability details given \
(e.g. a specific holding temperature, a pan material affecting heat behavior).
- Total active + wait time across steps must fit within the time constraint.
- If activity_level is "heavy_workout", bias toward higher protein / recovery-friendly choices.
- If an ingredient's name includes an age/freshness note (e.g. "use soon"), prioritize using it over less time-sensitive items.
- If sleep_context indicates poor or short sleep, bias toward lighter, hydrating, easier-to-digest \
choices, and go easy on heavy or very fatty foods. If it indicates good sleep and high activity, \
recovery-focused suggestions are fine as normal. Don't mention sleep explicitly in the recipe title.
- If goal_context is "goal: recover", prioritize protein and easy digestion over volume. If "goal: gain", \
bias toward a calorie and protein surplus. If "goal: cut", bias toward a moderate calorie deficit while \
keeping protein high to preserve muscle. If "goal: maintain", keep macros balanced without pushing \
either direction. If goal_context starts with "goal: custom", follow the specific guidance given in it. \
The goal is the dominant, longer-term signal — sleep and activity level should adjust the recipe within \
that goal, not override it.
"""


def _extract_json(text: str) -> dict:
    """Pull a JSON object out of an LLM response, tolerating minor formatting noise."""
    text = text.strip()
    text = re.sub(r"^```(json)?", "", text)
    text = re.sub(r"```$", "", text)
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Fallback: grab the largest {...} block in the response
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))

    raise ValueError(f"Could not parse JSON from LLM response: {text[:200]}")


def _mock_recipe(request: RecipeRequest) -> RecipeResponse:
    """Used when no LLM API key is configured yet, so the UI/UX can be built
    and tested without being blocked on a provider decision (Anthropic vs Gemini)."""
    ingredient_names = [i.name for i in request.ingredients] or ["whatever's on hand"]
    equipment_names = [e.name for e in request.equipment]

    sleep_note = f" Sleep context noted: {request.sleep_context}." if request.sleep_context else ""
    goal_note = f" Goal context noted: {request.goal_context}." if request.goal_context else ""

    return RecipeResponse(
        title=f"[MOCK] Quick plate with {ingredient_names[0]}",
        steps=[
            {
                "step_number": 1,
                "instruction": f"Prep {', '.join(ingredient_names)}.",
                "duration_seconds": 120,
            },
            {
                "step_number": 2,
                "instruction": (
                    f"Cook using {equipment_names[0]}."
                    if equipment_names
                    else "Cook using whatever pan you've got."
                ),
                "duration_seconds": min(request.time_constraint_min * 60 - 180, 600),
            },
            {
                "step_number": 3,
                "instruction": (
                    "Plate and serve. (This is placeholder mock data — set "
                    f"ANTHROPIC_API_KEY or swap in Gemini to get real recipes.{sleep_note}{goal_note})"
                ),
                "duration_seconds": None,
            },
        ],
        macro_estimate={"calories": 550, "protein_g": 40},
        equipment_used=equipment_names,
    )


def generate_recipe(request: RecipeRequest) -> RecipeResponse:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return _mock_recipe(request)

    user_prompt = {
        "ingredients": [i.name for i in request.ingredients],
        "equipment": [
            {"name": e.name, "category": e.category, "capabilities": e.capabilities}
            for e in request.equipment
        ],
        "time_constraint_min": request.time_constraint_min,
        "activity_level": request.activity_level,
        "sleep_context": request.sleep_context,
        "goal_context": request.goal_context,
    }

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": json.dumps(user_prompt)}],
    )

    raw_text = "".join(
        block.text for block in response.content if block.type == "text"
    )
    parsed = _extract_json(raw_text)
    return RecipeResponse(**parsed)


GOAL_SYSTEM_PROMPT = """You turn a person's free-text description of what they \
want into a short, structured nutrition/cooking goal.

Respond with ONLY a JSON object, no preamble, no markdown fences. Shape:
{
  "summary": string,   // a short goal name/title, under 8 words
  "guidance": string   // 1-2 sentences of practical food/macro guidance a recipe generator can use
}

The guidance should be concrete enough to bias food choices (e.g. "moderate calorie deficit, \
keep protein high, limit late-night carbs") rather than vague encouragement.
"""


def _mock_goal(request: GoalRequest) -> GoalResponse:
    """Used when no LLM API key is configured yet."""
    return GoalResponse(
        summary=f"[MOCK] Custom goal: {request.description[:40]}",
        guidance=(
            "Placeholder guidance — set ANTHROPIC_API_KEY or swap in Gemini to get a "
            "real AI-generated goal summary."
        ),
    )


def generate_goal_summary(request: GoalRequest) -> GoalResponse:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return _mock_goal(request)

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        system=GOAL_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": request.description}],
    )

    raw_text = "".join(block.text for block in response.content if block.type == "text")
    parsed = _extract_json(raw_text)
    return GoalResponse(**parsed)
