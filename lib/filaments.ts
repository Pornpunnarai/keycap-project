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
