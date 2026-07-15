"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileMenu from "@/components/ProfileMenu";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const TABS = [
  { href: "/", label: "Kitchen" },
  { href: "/inventory", label: "Inventory" },
  { href: "/recipes", label: "Recipes" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b-2 border-ink bg-paper">
      <div className="max-w-xl mx-auto px-4 pt-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CHOWA</h1>
          <p className="text-xs text-ink/50 tracking-wide">cook what you have · 調和</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <ProfileMenu />
        </div>
      </div>
      <nav className="max-w-xl mx-auto px-4 flex gap-1 mt-3">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`text-xs uppercase tracking-wide px-3 py-2 border-b-2 -mb-[2px] transition-colors ${
                active
                  ? "border-stamp text-ink font-bold"
                  : "border-transparent text-ink/50 hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
