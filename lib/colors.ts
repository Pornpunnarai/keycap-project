import type { Keycap } from "@/lib/types"

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
