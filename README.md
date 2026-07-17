# Chowa (調和)

Intelligent culinary & wellness companion — cooks with the ingredients and equipment you actually have, tailored to how much time and energy you have.

## Structure

```
chowa/
├── frontend/    Next.js app — Kitchen / Inventory / Recipes tabs, theming, auth UI shell
├── backend/     FastAPI service — LLM-powered recipe generation, with tests
└── supabase/    Database schema (not wired up yet — see below)
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

## Testing

Backend has a small pytest suite covering the LLM JSON-parsing logic and the `/generate-recipe` endpoint (run in mock mode, so it never hits a real LLM). Run it from `backend/`, with the venv active:

```bash
cd backend
source venv/bin/activate
python -m pytest -q
```

Worth running before each commit — cheap insurance that a prompt or refactor didn't silently break something. If `pytest` ever complains about missing modules (`fastapi`, `anthropic`, etc.), it usually means the venv isn't active — check with `which python`; it should point inside `backend/venv/`.

No frontend test suite yet — the UI is still changing shape often enough that tests would mostly be testing things about to be rewritten. Worth adding once the core screens settle.

## LLM provider

Not decided yet — leaning Gemini over Anthropic, to be settled later. Until then, `backend/app/llm.py` returns a mock recipe (title prefixed `[MOCK]`) whenever `ANTHROPIC_API_KEY` isn't set in `backend/.env`, so the full UI loop can be built and tested without being blocked on that decision.

## Theming

Light / Dark / System, switchable from the nav bar (persists via `localStorage`). All colors are CSS variables (`--color-paper`, `--color-ink`, `--color-rail`, `--color-stamp`, `--color-stampdark`), defined in `app/globals.css` under `:root` (light) and `[data-theme="dark"]`. Components reference the Tailwind tokens (`bg-paper`, `text-ink`, etc.) rather than literal colors, so adding another theme later just means adding another `[data-theme="..."]` block — no component changes needed. Extra accent color options (beyond light/dark) could be layered in later as a separate personalization setting.

## Current MVP scope

- Ingredient input is free text (e.g. "0.5-inch thick ribeye, added yesterday") — no rigid picker. The LLM normalizes this at generation time.
- No deterministic sear-timing/macro math yet — that logic is intentionally left to the LLM prompt for now. Worth hardcoding later once you see recurring mistakes.
- Everything runs on local React state via `lib/AppStateContext.tsx` — no persistence yet, refreshing the page resets it. This is intentional while the UI is still being shaped; see the Supabase section below for when that changes.
- `components/ProfileMenu.tsx` is a UI shell only right now (sign in / sign up tabs, disabled inputs) — no real accounts yet.

## Not needed yet: Supabase

Everything currently runs on local React state — no database required to build/test the UI. This stops being optional once more than one person uses the app (in-memory state means a refresh wipes everything), so treat it as the next major milestone once the UI feels right. When we do wire it up:
1. Create a project at supabase.com.
2. Run `supabase/schema.sql` in the SQL editor.
3. Grab your project URL + anon key (Settings → API) for the frontend, and the service role key for the backend.
4. Wire `ProfileMenu.tsx` to `supabase.auth`, and connect `profiles.id` to the authenticated user.

## Future: smarter, more automatic inventory

Planned, not built — the category picker and frozen checkbox added now are the manual version of this; both ideas below would reduce user effort over time rather than replace what exists:

- **Auto-categorize on add**: infer an ingredient's category (and maybe a default freshness window) from its free-text name instead of asking the user to pick it every time. Needs either an LLM call per ingredient add or a lightweight local lookup table — worth deciding which once real usage shows how often people actually change the auto-guess.
- **Learn quality patterns over time**: if the app notices a user consistently logs lower- or higher-quality ingredients (e.g. based on brand/cut mentioned, or explicit feedback), let that bias recommendations and freshness assumptions accordingly. This needs real usage history to be worth anything — revisit once Supabase persistence exists and there's actual data to learn from.

## Future: goal-based health coaching

Partially built — `app/goals/page.tsx` covers:
- Long-term goal selection: Recover / Maintain / Gain / Cut, or a **Custom** goal where you describe it in free text and `POST /generate-goal` (mock-aware, same pattern as recipes) turns it into a short summary + practical guidance.
- A **baseline snapshot** captured the moment a goal is set (weight/feeling/sleep from that day's check-in, plus how many recipes had been generated so far), shown against current values as a "Then vs now" comparison — the point being to make progress visible enough that using the app regularly feels worth it.
- A ~weekly reconfirmation nudge, and `goal_context` feeding into recipe generation exactly as discussed (goal is the dominant signal; sleep/activity adjust within it, not override it).

All of this is stored in `localStorage` for now — `supabase/schema.sql` has matching columns on `profiles` (`goal`, `goal_custom_description`, `goal_custom_guidance`, `goal_baseline` as jsonb) and check-in fields folded into `activity_logs` for when this moves off localStorage.

Still not built — this is the fuller version of the "digital nutritionist" idea from the original brief:

- Macro targets beyond the current placeholder: carbs, protein, **and sodium**.
- Correlate specific food choices (e.g. a large rice dinner, late-night snacks) with next-day weight/water-retention patterns.
- Prioritize using fridge inventory before it spoils, and flag when something is best eaten soon for quality/taste, not just before it goes bad.
- Recommendations should be genuinely goal-directed — "eat this to get closer to your goal," not just "here's something you can make" — while still making good use of what's already in the fridge.
- Recipe/recommendation copy should read like a direct, analytical coach — a peer, not a neutral tracker. This is a prompt/voice decision as much as a data one; revisit when writing the recipe-generation system prompt.

## Commit plan

Checkpoints so far, and what's next — commit at each one so history stays readable:

- [x] `chore: scaffold project structure`
- [x] `feat: ticket-style design system for core UI`
- [x] `feat: profile menu shell + goal-based health coaching plan`
- [x] `feat: tab navigation with shared app state`
- [x] `test: backend unit tests for JSON extraction and recipe endpoint`
- [x] `feat: light/dark/system theming`
- [ ] `feat: supabase auth + equipment/ingredient CRUD` — once the frontend can log in and manage inventory for real
- [ ] `feat: real LLM provider wired in` — once Anthropic vs. Gemini is decided and a real key is calling it
- [ ] `feat: activity log + goal-based recommendations` — the digital nutritionist piece
- [ ] `feat: lemonsqueezy plus tier` — monetization, once the core loop works end to end

Commit smaller and more often than this if it's more natural — these are just the natural "it works now" milestones.
