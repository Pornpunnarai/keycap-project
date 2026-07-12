import { resolveFilamentHex } from "@/lib/filaments"
import type { ColorMode, Keycap } from "@/lib/types"

export function alternateColorId(
  index: number,
  colorAId: string,
  colorBId: string,
): string {
  return index % 2 === 0 ? colorAId : colorBId
}

export function reapplyAlternateColors(
  keycaps: Keycap[],
  colorAId: string,
  colorBId: string,
): Keycap[] {
  return keycaps.map((key, index) => ({
    ...key,
    colorId: alternateColorId(index, colorAId, colorBId),
  }))
}

/** Cap A → other is B, Cap B → other is A */
export function oppositeColorId(
  capColorId: string,
  colorAId: string,
  colorBId: string,
): string {
  return capColorId === colorAId ? colorBId : colorAId
}

/** Relative luminance 0–1 from #RRGGBB */
function luminance(hex: string): number {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const toLin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
}

export function legendInkForHex(hex: string): string {
  return luminance(hex) < 0.45 ? "#FFFFFF" : "#111111"
}

export type KeycapLayerColors = {
  /** Base / stem / "ตูด" */
  capHex: string
  /** Top cover / "ฝา" */
  lidHex: string
  /** Character or icon on the lid */
  legendHex: string
}

/**
 * Two-color: Cap A → Lid B → Legend A (and Cap B → Lid A → Legend B).
 * One-color: Cap + default Legend = A; Lid = B (falls back to A if B unset).
 * Optional legendColorId overrides legend ink for the whole set.
 */
export function resolveKeycapLayers(
  mode: ColorMode,
  capColorId: string,
  colorAId: string,
  colorBId: string | null,
  legendColorId: string | null = null,
): KeycapLayerColors {
  if (mode === "two" && colorBId) {
    const capHex = resolveFilamentHex(capColorId)
    const lidHex = resolveFilamentHex(
      oppositeColorId(capColorId, colorAId, colorBId),
    )
    return {
      capHex,
      lidHex,
      legendHex: legendColorId
        ? resolveFilamentHex(legendColorId)
        : capHex,
    }
  }

  const capHex = resolveFilamentHex(colorAId)
  const lidHex = resolveFilamentHex(colorBId ?? colorAId)
  return {
    capHex,
    lidHex,
    legendHex: legendColorId
      ? resolveFilamentHex(legendColorId)
      : capHex,
  }
}
