import { resolveKeycapLayers } from "@/lib/colors"
import type { ColorMode, Keycap } from "@/lib/types"

const KEY = 72
const GAP = 14
const PAD = 16
const CAP_RADIUS = 12
const LID_INSET = 8
const LID_RADIUS = 8

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function legendMarkup(
  key: Keycap,
  cx: number,
  cy: number,
  ink: string,
): string {
  if (!key.legendType || !key.legendValue) return ""
  if (key.legendType === "char") {
    return `<text x="${cx}" y="${cy}" fill="${ink}" font-family="system-ui,sans-serif" font-size="26" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(key.legendValue)}</text>`
  }
  return `<text x="${cx}" y="${cy}" fill="${ink}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle" dominant-baseline="central">${escapeXml(key.legendValue)}</text>`
}

export type SvgSetOptions = {
  mode: ColorMode
  colorAId: string
  colorBId: string | null
}

export function buildSetSvg(
  keycaps: Keycap[],
  options: SvgSetOptions,
): string {
  const cols = Math.max(1, Math.min(8, keycaps.length || 1))
  const rows = Math.max(1, Math.ceil((keycaps.length || 1) / cols))
  const width = PAD * 2 + cols * KEY + (cols - 1) * GAP
  const height = PAD * 2 + rows * KEY + (rows - 1) * GAP

  const bodies = keycaps
    .map((key, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = PAD + col * (KEY + GAP)
      const y = PAD + row * (KEY + GAP)
      const layers = resolveKeycapLayers(
        options.mode,
        key.colorId,
        options.colorAId,
        options.colorBId,
      )
      const lidX = x + LID_INSET
      const lidY = y + LID_INSET
      const lidSize = KEY - LID_INSET * 2
      const cx = x + KEY / 2
      const cy = y + KEY / 2
      return `<g>
  <rect x="${x}" y="${y}" width="${KEY}" height="${KEY}" rx="${CAP_RADIUS}" fill="${layers.capHex}" stroke="#00000022" stroke-width="1"/>
  <rect x="${lidX}" y="${lidY}" width="${lidSize}" height="${lidSize}" rx="${LID_RADIUS}" fill="${layers.lidHex}" stroke="#00000018" stroke-width="1"/>
  ${legendMarkup(key, cx, cy, layers.legendHex)}
</g>`
    })
    .join("\n")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${bodies}
</svg>`
}
