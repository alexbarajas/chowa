"use client";

import { useState } from "react";
import { useAppState } from "@/lib/AppStateContext";
import { GoalType } from "@/lib/types";
import { daysSince } from "@/lib/dateUtils";

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
];

export default function GoalsPage() {
  const { goal, needsGoalConfirmation, setGoal, confirmGoal } = useAppState();
  const [changing, setChanging] = useState(false);

  const showPicker = !goal || changing;

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

  const currentOption = GOAL_OPTIONS.find((o) => o.id === goal!.goal)!;
  const daysSinceConfirm = daysSince(goal!.lastConfirmedDate);

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

      <div className="border border-ink/15 bg-paper ticket-shadow">
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
    </div>
  );
}
