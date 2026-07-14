"use client";

import { ActivityLevel } from "@/lib/types";

type Props = {
  activityLevel: ActivityLevel;
  onActivityChange: (level: ActivityLevel) => void;
  timeConstraintMin: number;
  onTimeChange: (minutes: number) => void;
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  heavy_workout: "Heavy workout",
  active_light: "Active but chill",
  sedentary: "Didn't do much",
};

export default function ActivityPicker({
  activityLevel,
  onActivityChange,
  timeConstraintMin,
  onTimeChange,
}: Props) {
  return (
    <section className="border border-ink/15 bg-paper ticket-shadow mt-4">
      <div className="px-4 pt-3 pb-2 tear-line">
        <h2 className="text-xs tracking-[0.2em] uppercase font-bold">Right now</h2>
      </div>
      <div className="flex flex-wrap gap-6 p-4">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-ink/60">
          Activity level
          <select
            value={activityLevel}
            onChange={(e) => onActivityChange(e.target.value as ActivityLevel)}
            className="bg-transparent border-b border-ink/30 px-1 py-1 text-sm text-ink normal-case tracking-normal focus:outline-none focus:border-stamp"
          >
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-ink/60">
          Time available (min)
          <input
            type="number"
            min={1}
            value={timeConstraintMin}
            onChange={(e) => onTimeChange(Number(e.target.value))}
            className="bg-transparent border-b border-ink/30 px-1 py-1 text-sm text-ink w-24 focus:outline-none focus:border-stamp"
          />
        </label>
      </div>
    </section>
  );
}
