import type { LegendType } from "@/lib/types"

export const CHAR_LEGENDS: string[] = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  ..."0123456789".split(""),
]

export function isValidCharLegend(value: string): boolean {
  return /^[A-Z0-9]$/.test(value)
}

export function isValidLegend(
  legendType: LegendType | null,
  legendValue: string | null,
): boolean {
  if (legendType === null && legendValue === null) return true
  if (legendType === null || legendValue === null) return false
  if (legendType === "char") return isValidCharLegend(legendValue)
  if (legendType === "icon") return legendValue.length > 0
  return false
}
