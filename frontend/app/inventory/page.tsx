"use client";

import IngredientForm from "@/components/IngredientForm";
import EquipmentForm from "@/components/EquipmentForm";
import { useAppState } from "@/lib/AppStateContext";

export default function InventoryPage() {
  const { ingredients, setIngredients, equipment, setEquipment } = useAppState();

  return (
    <div>
      <IngredientForm ingredients={ingredients} onChange={setIngredients} />
      <EquipmentForm equipment={equipment} onChange={setEquipment} />
    </div>
  );
}
