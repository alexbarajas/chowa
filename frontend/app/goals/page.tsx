"use client";

import { useState } from "react";
import { useAppState } from "@/lib/AppStateContext";
import { GoalType } from "@/lib/types";
import { daysSince } from "@/lib/dateUtils";
import { mostRecentCheckIn } from "@/lib/checkInStorage";
import { generateGoalSummary } from "@/lib/backend";

const GOAL_OPTIONS: { id: GoalType; label: string; description: string }[] = [
  {
    id: "recover",
    label: "Recover",
    description: "Coming back from heavy training or a rough stretch — prioritize protein, easy digestion, and rest-friendly meals.",
  },
  {
    id: "maintain",
    label: "Maintain",
    description: "Steady state — balanced macros, nothing aggressive in either direction.",
  },
  {
    id: "gain",
    label: "Gain",
    description: "Building muscle or strength — favor a calorie and protein surplus.",
  },
  {
    id: "cut",
    label: "Cut",
    description: "Losing fat while preserving strength — moderate calorie deficit, protein stays high.",
  },
];

export default function GoalsPage() {
  const { goal, needsGoalConfirmation, setGoal, confirmGoal, checkIns, recipeHistory } =
    useAppState();
  const [changing, setChanging] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const showPicker = !goal || changing;

  async function handleCustomGoal() {
    const trimmed = customText.trim();
    if (!trimmed) return;
    setCustomLoading(true);
    setCustomError(null);
    try {
      const { summary, guidance } = await generateGoalSummary(trimmed);
      setGoal("custom", { description: summary, guidance });
      setChanging(false);
      setCustomText("");
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : String(err));
    } finally {
      setCustomLoading(false);
    }
  }

  if (showPicker) {
    return (
      <div>
        <h2 className="text-xs tracking-[0.2em] uppercase font-bold mb-1">
          {goal ? "Change your goal" : "What's your goal right now?"}
        </h2>
        <p className="text-xs text-ink/50 mb-4">
          This is meant to be long-term — you won't be asked to re-pick it every session, but
          we'll check in roughly weekly to make sure it's still accurate.
        </p>
        <div className="space-y-3">
          {GOAL_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setGoal(option.id);
                setChanging(false);
              }}
              className="w-full text-left border border-ink/15 bg-paper ticket-shadow p-4 hover:border-stamp transition-colors"
            >
              <p className="text-sm font-bold uppercase tracking-wide mb-1">{option.label}</p>
              <p className="text-xs text-ink/60">{option.description}</p>
            </button>
          ))}

          <div className="border border-dashed border-ink/25 p-4">
            <p className="text-sm font-bold uppercase tracking-wide mb-1">Custom</p>
            <p className="text-xs text-ink/60 mb-3">
              Describe what you're going for — the AI will turn it into a short goal with
              practical guidance.
            </p>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. I want to look good and feel light for a wedding in October"
              rows={2}
              className="w-full bg-transparent border-b border-ink/30 px-1 py-1 text-sm placeholder:text-ink/35 focus:outline-none focus:border-stamp resize-none mb-3"
            />
            <button
              onClick={handleCustomGoal}
              disabled={customLoading || !customText.trim()}
              className="text-xs uppercase tracking-wide px-3 py-1.5 bg-ink text-paper hover:bg-stamp disabled:opacity-30 transition-colors"
            >
              {customLoading ? "Generating..." : "Generate goal"}
            </button>
            {customError && <p className="text-xs text-stamp mt-2">{customError}</p>}
          </div>
        </div>
        {goal && changing && (
          <button
            onClick={() => setChanging(false)}
            className="mt-3 text-xs uppercase tracking-wide text-ink/40 hover:text-ink"
          >
            cancel
          </button>
        )}
      </div>
    );
  }

  const currentOption =
    goal!.goal === "custom"
      ? { label: goal!.customDescription ?? "Custom goal", description: goal!.customGuidance ?? "" }
      : GOAL_OPTIONS.find((o) => o.id === goal!.goal)!;
  const daysSinceConfirm = daysSince(goal!.lastConfirmedDate);

  // "Then vs now" comparison — fall back to an empty baseline defensively,
  // in case older localStorage data predates this field (loadGoal backfills
  // this on load too, but this keeps the page itself from ever crashing on it).
  const baseline = goal!.baseline ?? {
    date: goal!.setDate,
    weight: null,
    feeling: "",
    sleepHours: null,
    sleepQuality: null,
    recipesCookedCount: 0,
  };
  const daysOnGoal = daysSince(baseline.date);
  const latest = mostRecentCheckIn(checkIns);
  const recipesSinceGoal = recipeHistory.length - baseline.recipesCookedCount;
  const weightDelta =
    baseline.weight != null && latest?.weight != null ? latest.weight - baseline.weight : null;

  return (
    <div>
      {needsGoalConfirmation && (
        <div className="border border-stamp/40 bg-stamp/5 px-4 py-3 mb-4 flex items-center justify-between gap-3">
          <p className="text-xs text-stamp">
            It's been {daysSinceConfirm} days — still working toward this goal?
          </p>
          <button
            onClick={confirmGoal}
            className="text-xs uppercase tracking-wide px-3 py-1.5 bg-stamp text-paper hover:bg-stampdark shrink-0"
          >
            Still my goal
          </button>
        </div>
      )}

      <div className="border border-ink/15 bg-paper ticket-shadow mb-4">
        <div className="flex items-baseline justify-between px-4 pt-3 pb-2 tear-line">
          <h2 className="text-xs tracking-[0.2em] uppercase font-bold">Current goal</h2>
          <span className="text-xs text-ink/40">
            confirmed {daysSinceConfirm === 0 ? "today" : `${daysSinceConfirm}d ago`}
          </span>
        </div>
        <div className="p-4">
          <p className="text-lg font-bold uppercase tracking-wide mb-1">{currentOption.label}</p>
          <p className="text-sm text-ink/60 mb-4">{currentOption.description}</p>
          <div className="flex gap-2">
            {!needsGoalConfirmation && (
              <button
                onClick={confirmGoal}
                className="text-xs uppercase tracking-wide px-3 py-1.5 border border-ink/30 hover:bg-ink hover:text-paper transition-colors"
              >
                Still my goal
              </button>
            )}
            <button
              onClick={() => setChanging(true)}
              className="text-xs uppercase tracking-wide px-3 py-1.5 border border-ink/30 hover:bg-ink hover:text-paper transition-colors"
            >
              Change goal
            </button>
          </div>
        </div>
      </div>

      <div className="border border-ink/15 bg-paper ticket-shadow">
        <div className="flex items-baseline justify-between px-4 pt-3 pb-2 tear-line">
          <h2 className="text-xs tracking-[0.2em] uppercase font-bold">Then vs now</h2>
          <span className="text-xs text-ink/40">
            {daysOnGoal === 0 ? "started today" : `day ${daysOnGoal}`}
          </span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-dashed divide-ink/15">
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-2">
              Started {baseline.date}
            </p>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/50">Weight</dt>
                <dd>{baseline.weight != null ? baseline.weight : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/50">Sleep</dt>
                <dd>{baseline.sleepHours != null ? `${baseline.sleepHours}h` : "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink/50 shrink-0">Feeling</dt>
                <dd className="text-right">{baseline.feeling || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/50">Recipes cooked</dt>
                <dd>{baseline.recipesCookedCount}</dd>
              </div>
            </dl>
          </div>
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-2">Now</p>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/50">Weight</dt>
                <dd>
                  {latest?.weight != null ? latest.weight : "—"}
                  {weightDelta != null && (
                    <span className={`ml-1 text-xs ${weightDelta === 0 ? "text-ink/40" : "text-stamp"}`}>
                      ({weightDelta > 0 ? "+" : ""}
                      {weightDelta.toFixed(1)})
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/50">Sleep</dt>
                <dd>{latest?.sleepHours != null ? `${latest.sleepHours}h` : "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-ink/50 shrink-0">Feeling</dt>
                <dd className="text-right">{latest?.feeling || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/50">Recipes cooked</dt>
                <dd>
                  {recipeHistory.length}
                  {recipesSinceGoal > 0 && (
                    <span className="text-stamp text-xs ml-1">(+{recipesSinceGoal})</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
