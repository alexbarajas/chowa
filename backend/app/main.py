from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.llm import generate_recipe
from app.models import RecipeRequest, RecipeResponse

app = FastAPI(title="Chowa backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # add your deployed frontend URL later
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate-recipe", response_model=RecipeResponse)
def generate_recipe_endpoint(request: RecipeRequest):
    try:
        return generate_recipe(request)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Recipe generation failed: {e}")
