import pytest

from app.llm import _extract_json, _mock_recipe
from app.models import EquipmentItem, IngredientItem, RecipeRequest


def test_extract_json_plain():
    assert _extract_json('{"a": 1}') == {"a": 1}


def test_extract_json_with_markdown_fences():
    text = '```json\n{"a": 1}\n```'
    assert _extract_json(text) == {"a": 1}


def test_extract_json_with_surrounding_text():
    text = 'Here you go:\n{"a": 1}\nHope that helps!'
    assert _extract_json(text) == {"a": 1}


def test_extract_json_invalid_raises():
    with pytest.raises(ValueError):
        _extract_json("not json at all")


def test_mock_recipe_uses_ingredients_and_equipment():
    request = RecipeRequest(
        ingredients=[IngredientItem(name="ribeye")],
        equipment=[EquipmentItem(name="carbon steel pan", category="pan")],
        time_constraint_min=20,
    )
    recipe = _mock_recipe(request)
    assert "ribeye" in recipe.title
    assert recipe.equipment_used == ["carbon steel pan"]
    assert len(recipe.steps) == 3


def test_mock_recipe_handles_no_equipment():
    request = RecipeRequest(
        ingredients=[IngredientItem(name="eggs")],
        equipment=[],
        time_constraint_min=10,
    )
    recipe = _mock_recipe(request)
    assert recipe.equipment_used == []
