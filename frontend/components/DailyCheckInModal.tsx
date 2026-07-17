"use client";

import { useRef, useState } from "react";
import { useAppState } from "@/lib/AppStateContext";
import { useClickOutside } from "@/lib/useClickOutside";

const SLEEP_QUALITY = [
  { value: 1, label: "Rough" },
  { value: 2, label: "Okay" },
  { value: 3, label: "Good" },
  { value: 4, label: "Great" },
];

export default function DailyCheckInModal() {
  const { checkInOpen, closeCheckIn, submitCheckIn, skipCheckIn, todayCheckIn } = useAppState();

  const [weight, setWeight] = useState<number | "">(todayCheckIn?.weight ?? "");
  const [sleepHours, setSleepHours] = useState(todayCheckIn?.sleepHours ?? 7);
  const [sleepQuality, setSleepQuality] = useState(todayCheckIn?.sleepQuality ?? 3);
  const [feeling, setFeeling] = useState(todayCheckIn?.feeling ?? "");
  const [foodChanges, setFoodChanges] = useState(todayCheckIn?.foodChanges ?? "");

  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => {
    if (checkInOpen) closeCheckIn();
  });

  if (!checkInOpen) return null;

  function handleSubmit() {
    submitCheckIn({
      weight: weight === "" ? null : weight,
      sleepHours,
      sleepQuality,
      feeling,
      foodChanges,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <div
        ref={modalRef}
        className="bg-paper text-ink border border-ink/20 ticket-shadow w-full max-w-sm ticket-fade-in"
      >
        <div className="tear-line px-4 pt-3 pb-2 flex justify-between items-baseline">
          <h2 className="text-xs tracking-[0.2em] uppercase font-bold">Morning check-in</h2>
          <button onClick={closeCheckIn} className="text-ink/40 hover:text-stamp text-xs uppercase tracking-wide">
            close
          </button>
        </div>

        <div className="p-4 space-y-4">
          <label className="block text-xs uppercase tracking-wide text-ink/60">
            Weight today (optional)
            <input
              type="number"
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 178.4"
              className="mt-1 w-full bg-transparent border-b border-ink/30 px-1 py-1 text-sm text-ink normal-case placeholder:text-ink/35 focus:outline-none focus:border-stamp"
            />
          </label>

          <label className="block text-xs uppercase tracking-wide text-ink/60">
            Hours slept
            <input
              type="number"
              step={0.5}
              min={0}
              max={16}
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="mt-1 w-full bg-transparent border-b border-ink/30 px-1 py-1 text-sm text-ink normal-case focus:outline-none focus:border-stamp"
            />
          </label>

          <div>
            <p className="text-xs uppercase tracking-wide text-ink/60 mb-1.5">Sleep quality</p>
            <div className="flex gap-1.5">
              {SLEEP_QUALITY.map((q) => (
                <button
                  key={q.value}
                  onClick={() => setSleepQuality(q.value)}
                  className={`flex-1 text-xs uppercase tracking-wide py-1.5 border transition-colors ${
                    sleepQuality === q.value
                      ? "bg-ink text-paper border-ink font-bold"
                      : "border-ink/25 text-ink/50 hover:text-ink hover:border-ink/50"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block text-xs uppercase tracking-wide text-ink/60">
            How are you feeling?
            <input
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="e.g. a bit sore, mostly good"
              className="mt-1 w-full bg-transparent border-b border-ink/30 px-1 py-1 text-sm normal-case text-ink placeholder:text-ink/35 focus:outline-none focus:border-stamp"
            />
          </label>

          <label className="block text-xs uppercase tracking-wide text-ink/60">
            Any food changes since yesterday?
            <textarea
              value={foodChanges}
              onChange={(e) => setFoodChanges(e.target.value)}
              placeholder="e.g. used up the salmon, picked up more eggs"
              rows={2}
              className="mt-1 w-full bg-transparent border-b border-ink/30 px-1 py-1 text-sm normal-case text-ink placeholder:text-ink/35 focus:outline-none focus:border-stamp resize-none"
            />
          </label>
        </div>

        <div className="flex border-t border-dashed border-ink/15">
          <button
            onClick={skipCheckIn}
            className="flex-1 text-xs uppercase tracking-wide py-3 text-ink/50 hover:text-ink transition-colors"
          >
            Skip today
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 text-xs uppercase tracking-wide py-3 bg-ink text-paper hover:bg-stamp transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
