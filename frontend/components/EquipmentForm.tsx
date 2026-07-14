"use client";

import { useState } from "react";
import { Equipment } from "@/lib/types";

type Props = {
  equipment: Equipment[];
  onChange: (equipment: Equipment[]) => void;
};

const CATEGORIES = ["pan", "appliance", "knife", "thermometer", "other"];

export default function EquipmentForm({ equipment, onChange }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [capabilitiesDraft, setCapabilitiesDraft] = useState("");

  function addEquipment() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    let capabilities: Record<string, unknown> = {};
    if (capabilitiesDraft.trim()) {
      try {
        capabilities = JSON.parse(capabilitiesDraft);
      } catch {
        capabilities = { note: capabilitiesDraft.trim() };
      }
    }

    onChange([
      ...equipment,
      { id: crypto.randomUUID(), name: trimmedName, category, capabilities },
    ]);
    setName("");
    setCapabilitiesDraft("");
  }

  function removeEquipment(id: string) {
    onChange(equipment.filter((e) => e.id !== id));
  }

  return (
    <section className="border border-ink/15 bg-paper ticket-shadow mt-4">
      <div className="flex items-baseline justify-between px-4 pt-3 pb-2 tear-line">
        <h2 className="text-xs tracking-[0.2em] uppercase font-bold">Equipment</h2>
        <span className="text-xs text-ink/50">{equipment.length} listed</span>
      </div>

      <div className="flex flex-wrap gap-2 p-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="De Buyer Mineral B 11in"
          className="flex-1 min-w-[180px] bg-transparent border-b border-ink/30 px-1 py-1 text-sm placeholder:text-ink/35 focus:outline-none focus:border-stamp"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-transparent border-b border-ink/30 px-1 py-1 text-sm uppercase tracking-wide focus:outline-none focus:border-stamp"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          value={capabilitiesDraft}
          onChange={(e) => setCapabilitiesDraft(e.target.value)}
          placeholder='{"material":"carbon_steel"}'
          className="flex-[2] min-w-[220px] bg-transparent border-b border-ink/30 px-1 py-1 text-sm placeholder:text-ink/35 focus:outline-none focus:border-stamp"
        />
        <button
          onClick={addEquipment}
          className="text-xs uppercase tracking-wide px-3 py-1 border border-ink/30 hover:bg-ink hover:text-paper transition-colors"
        >
          Add
        </button>
      </div>

      {equipment.length > 0 && (
        <ul className="px-4 pb-4 -mt-1 space-y-1">
          {equipment.map((item, idx) => (
            <li
              key={item.id}
              className="flex items-start justify-between text-sm py-1 border-b border-dashed border-ink/15 last:border-none gap-2"
            >
              <span>
                <span className="text-ink/40 mr-2">{String(idx + 1).padStart(2, "0")}</span>
                <strong>{item.name}</strong>
                <span className="text-ink/50"> · {item.category}</span>
                {Object.keys(item.capabilities).length > 0 && (
                  <span className="text-ink/40"> · {JSON.stringify(item.capabilities)}</span>
                )}
              </span>
              <button
                onClick={() => removeEquipment(item.id)}
                className="text-ink/40 hover:text-stamp text-xs uppercase tracking-wide shrink-0"
              >
                remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
