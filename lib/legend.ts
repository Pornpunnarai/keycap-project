import { CHAR_LEGENDS } from "@/data/characters"
import { KEYCAP_ICON_IDS } from "@/data/icons"
import type { LegendType } from "@/lib/types"

export { CHAR_LEGENDS }

export function isValidCharLegend(value: string): boolean {
  return CHAR_LEGENDS.includes(value)
}

export function isValidLegend(
  legendType: LegendType | null,
  legendValue: string | null,
): boolean {
  if (legendType === null && legendValue === null) return true
  if (legendType === null || legendValue === null) return false
  if (legendType === "char") return isValidCharLegend(legendValue)
  if (legendType === "icon") {
    return (
      legendValue.length > 0 &&
      (KEYCAP_ICON_IDS as readonly string[]).includes(legendValue)
    )
  }
  return false
}
