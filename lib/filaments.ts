import { FILAMENTS } from "@/data/filaments"
import type { Filament } from "@/lib/types"

export function getFilament(id: string): Filament | undefined {
  return FILAMENTS.find((f) => f.id === id)
}

export function resolveFilamentHex(colorId: string): string {
  return getFilament(colorId)?.hex ?? FILAMENTS[0].hex
}

export function defaultColorAId(): string {
  return FILAMENTS[0].id
}

export function defaultColorBId(): string | null {
  return FILAMENTS[1]?.id ?? null
}

/** Prefer black for separate legend ink; fall back if base is already black */
export function defaultLegendColorId(baseColorId: string): string {
  const black = FILAMENTS.find((f) => f.id === "pla-black")
  if (black && black.id !== baseColorId) return black.id
  return FILAMENTS.find((f) => f.id !== baseColorId)?.id ?? FILAMENTS[0].id
}

export function defaultBlackLegendColorId(): string {
  return FILAMENTS.find((f) => f.id === "pla-black")?.id ?? FILAMENTS[0].id
}
