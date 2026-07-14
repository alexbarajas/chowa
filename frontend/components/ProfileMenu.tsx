"use client";

import { useRef, useState } from "react";
import { useClickOutside } from "@/lib/useClickOutside";

// UI shell only — not wired to real auth yet. Once Supabase is in place,
// this becomes a real sign-in/sign-up form backed by supabase.auth.
export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setOpen(false));

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs uppercase tracking-wide px-3 py-1.5 border border-ink/30 hover:bg-ink hover:text-paper transition-colors"
      >
        Profile
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-paper border border-ink/20 ticket-shadow z-10">
          <div className="flex tear-line">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 text-xs uppercase tracking-wide py-2 ${
                mode === "signin" ? "bg-ink text-paper" : "text-ink/50"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 text-xs uppercase tracking-wide py-2 ${
                mode === "signup" ? "bg-ink text-paper" : "text-ink/50"
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="p-4 space-y-3">
            <input
              type="email"
              placeholder="email"
              disabled
              className="w-full bg-transparent border-b border-ink/30 px-1 py-1 text-sm placeholder:text-ink/35"
            />
            <input
              type="password"
              placeholder="password"
              disabled
              className="w-full bg-transparent border-b border-ink/30 px-1 py-1 text-sm placeholder:text-ink/35"
            />
            <button
              disabled
              className="w-full text-xs uppercase tracking-wide py-2 bg-ink/20 text-ink/40 cursor-not-allowed"
            >
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
            <p className="text-[10px] text-ink/40 leading-relaxed">
              Not wired up yet — this becomes real once we add Supabase auth.
              For now, everything runs as a single local guest session.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
