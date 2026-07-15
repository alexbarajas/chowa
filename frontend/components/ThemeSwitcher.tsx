"use client";

import { useRef, useState } from "react";
import { ThemeChoice, useTheme } from "@/lib/ThemeContext";
import { useClickOutside } from "@/lib/useClickOutside";

const OPTIONS: { id: ThemeChoice; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setOpen(false));

  const currentLabel = OPTIONS.find((o) => o.id === theme)?.label ?? "Theme";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs uppercase tracking-wide px-3 py-1.5 border border-ink/30 hover:bg-ink hover:text-paper transition-colors"
      >
        {currentLabel}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-paper border border-ink/20 ticket-shadow z-10">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setTheme(option.id);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between text-left text-xs uppercase tracking-wide px-3 py-2 border-b border-dashed border-ink/15 last:border-none ${
                theme === option.id ? "font-bold" : "text-ink/60 hover:text-ink"
              }`}
            >
              {option.label}
              {theme === option.id && <span className="text-stamp">●</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
