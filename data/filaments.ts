/**
 * Filament master data — edit this list to match stock on hand.
 * Users can only pick colors defined here (id, name, hex).
 */
import type { Filament } from "@/lib/types"

export const FILAMENTS: Filament[] = [
  { id: "pla-black", name: "PLA Black", hex: "#1A1A1A" },
  { id: "pla-white", name: "PLA White", hex: "#F5F5F5" },
  { id: "pla-red", name: "PLA Red", hex: "#C62828" },
  { id: "pla-blue", name: "PLA Blue", hex: "#1565C0" },
  { id: "pla-yellow", name: "PLA Yellow", hex: "#F9A825" },
]
