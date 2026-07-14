# Chowa (調和)

Intelligent culinary & wellness companion — cooks with the ingredients and equipment you actually have, tailored to how much time and energy you have.

## Structure

```
chowa/
├── frontend/    Next.js app (inventory UI, cook mode, auth via Supabase)
├── backend/     FastAPI service (LLM-powered recipe generation)
└── supabase/    Database schema
```

## Local setup

### One-time setup

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # fill in keys later — see "LLM provider" below

# Frontend
cd ../frontend
npm install
cp .env.example .env.local
```

### Every time you want to run it

From the repo root:

```bash
./dev.sh
```

Starts both the backend (`http://localhost:8000`) and frontend (`http://localhost:3000`) together, and stops both on Ctrl+C. Check `http://localhost:8000/health` if something seems off — it should return `{"status":"ok"}`.

### Supabase (not needed yet)

Everything currently runs on local React state — no database required to build/test the UI. When we do wire up persistence:

1. Create a project at supabase.com.
2. Run `supabase/schema.sql` in the SQL editor.
3. Grab your project URL + anon key (Settings → API) for the frontend, and the service role key for the backend.

## LLM provider

Not decided yet — leaning Gemini over Anthropic, to be settled later. Until then, `backend/app/llm.py` returns a mock recipe (title prefixed `[MOCK]`) whenever `ANTHROPIC_API_KEY` isn't set in `backend/.env`, so the full UI loop can be built and tested without being blocked on that decision.

## Current MVP scope

- Ingredient input is free text (e.g. "0.5-inch thick ribeye, added yesterday") — no rigid picker. The LLM normalizes this at generation time.
- No deterministic sear-timing/macro math yet — that logic is intentionally left to the LLM prompt for now. Worth hardcoding later once you see recurring mistakes.
- Auth, inventory CRUD, and equipment CRUD will go straight through Supabase from the frontend once we get there. Only recipe generation goes through the FastAPI backend.

## Future: goal-based health coaching

Planned, not yet built — this is the fuller version of the "digital nutritionist" idea from the original brief, and the reason `activity_logs` exists. Fold in once we're back working on the backend:

- **User-set goal**: recover / maintain / gain strength (or similar), used to bias every recommendation. This is meant to be long-term and stable — not re-declared every session — but the app should periodically (roughly weekly) check in and ask if it's still accurate. Day-to-day recommendations should still be able to flex around it based on shorter-term factors (holidays, recent adherence, how the person says they've been feeling) without changing the underlying goal itself.
- Track actual daily body weight, not just an activity-level category.
- Log the previous day's food and physical activity, not just "how do you feel right now."
- Macro targets beyond the current placeholder: carbs, protein, **and sodium**.
- Correlate specific food choices (e.g. a large rice dinner, late-night snacks) with next-day weight/water-retention patterns.
- Prioritize using fridge inventory before it spoils, and flag when something is best eaten soon for quality/taste, not just before it goes bad.
- Recommendations should be genuinely goal-directed — "eat this to get closer to your goal," not just "here's something you can make" — while still making good use of what's already in the fridge.
- Recipe/recommendation copy should read like a direct, analytical coach — a peer, not a neutral tracker. This is a prompt/voice decision as much as a data one; revisit when writing the recipe-generation system prompt.

## Auth / profiles

`components/ProfileMenu.tsx` is a UI shell only right now (sign in / sign up tabs, disabled inputs) — no real accounts yet, everything runs as a single local guest session. Once Supabase is in place, wire this to `supabase.auth` and connect `profiles.id` to the authenticated user.

## Commit plan

Suggested checkpoints as you build — commit at each one so history stays readable:

1. `chore: scaffold project structure` — this initial commit (frontend/backend skeletons, schema, README)
2. `feat: supabase auth + equipment/ingredient CRUD` — once the frontend can log in and manage inventory
3. `feat: recipe generation endpoint` — once `/generate-recipe` in the backend actually calls the LLM and returns parsed JSON
4. `feat: cook mode UI` — once the frontend can call the backend and render step-by-step instructions
5. `feat: activity log + recovery recommendations` — the digital nutritionist piece
6. `feat: lemonsqueezy plus tier` — monetization, once the core loop works end to end

Commit smaller and more often than this if it's more natural — these are just the natural "it works now" milestones.
