import { legendInkForHex } from "@/lib/colors"
import { resolveFilamentHex } from "@/lib/filaments"
import type { Keycap } from "@/lib/types"

const KEY = 64
const GAP = 12
const PAD = 16
const RADIUS = 10

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
    return `<text x="${cx}" y="${cy}" fill="${ink}" font-family="system-ui,sans-serif" font-size="28" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(key.legendValue)}</text>`
  }
  // Icon: render name as text placeholder in SVG export v1 so export stays dependency-free.
  // Preview UI uses Lucide React; export uses the icon name centered as text.
  return `<text x="${cx}" y="${cy}" fill="${ink}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle" dominant-baseline="central">${escapeXml(key.legendValue)}</text>`
}

export function buildSetSvg(keycaps: Keycap[]): string {
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
      const fill = resolveFilamentHex(key.colorId)
      const ink = legendInkForHex(fill)
      const cx = x + KEY / 2
      const cy = y + KEY / 2
      return `<g>
  <rect x="${x}" y="${y}" width="${KEY}" height="${KEY}" rx="${RADIUS}" fill="${fill}" stroke="#00000022" stroke-width="1"/>
  ${legendMarkup(key, cx, cy, ink)}
</g>`
    })
    .join("\n")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${bodies}
</svg>`
}
