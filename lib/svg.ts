import { resolveKeycapLayers } from "@/lib/colors"
import { KEYCAP_CHAR_DATA_URI } from "@/lib/keycap-char-data"
import { KEYCAP_ICON_DATA_URI } from "@/lib/keycap-icon-data"
import type { CanvasOrientation, ColorMode, Keycap } from "@/lib/types"

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

function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  if (h.length !== 6) return [0, 0, 0]
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

function legendGlyphUri(key: Keycap): string | undefined {
  if (!key.legendType || !key.legendValue) return undefined
  if (key.legendType === "char") return KEYCAP_CHAR_DATA_URI[key.legendValue]
  if (key.legendType === "icon") return KEYCAP_ICON_DATA_URI[key.legendValue]
  return undefined
}

function legendMarkup(
  key: Keycap,
  cx: number,
  cy: number,
  ink: string,
  filterId: string,
): string {
  if (!key.legendType || !key.legendValue) return ""
  const dataUri = legendGlyphUri(key)
  if (dataUri) {
    const glyphSize = 40
    const x = cx - glyphSize / 2
    const y = cy - glyphSize / 2
    return `<image href="${dataUri}" x="${x}" y="${y}" width="${glyphSize}" height="${glyphSize}" filter="url(#${filterId})" />`
  }
  return `<text x="${cx}" y="${cy}" fill="${ink}" font-family="'Baloo 2', ui-rounded, system-ui, sans-serif" font-size="44" font-weight="800" text-anchor="middle" dominant-baseline="central">${escapeXml(key.legendValue)}</text>`
}

export type SvgSetOptions = {
  mode: ColorMode
  colorAId: string
  colorBId: string | null
  legendColorId?: string | null
  orientation?: CanvasOrientation
}

export function buildSetSvg(
  keycaps: Keycap[],
  options: SvgSetOptions,
): string {
  const orientation = options.orientation ?? "horizontal"
  const cols =
    orientation === "vertical"
      ? 1
      : Math.max(1, Math.min(8, keycaps.length || 1))
  const rows = Math.max(1, Math.ceil((keycaps.length || 1) / cols))
  const width = PAD * 2 + cols * KEY + (cols - 1) * GAP
  const height = PAD * 2 + rows * KEY + (rows - 1) * GAP

  const legendInks = new Map<string, string>()
  for (const key of keycaps) {
    if (!legendGlyphUri(key)) continue
    const layers = resolveKeycapLayers(
      options.mode,
      key.colorId,
      options.colorAId,
      options.colorBId,
      options.legendColorId ?? null,
    )
    const ink = layers.legendHex.toLowerCase()
    if (!legendInks.has(ink)) {
      legendInks.set(ink, `recolor-${legendInks.size}`)
    }
  }

  const recolorFilters = [...legendInks.entries()]
    .map(([hex, id]) => {
      const [r, g, b] = hexToRgb01(hex)
      return `<filter id="${id}" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
    <feColorMatrix type="matrix" values="0 0 0 0 ${r.toFixed(4)}
      0 0 0 0 ${g.toFixed(4)}
      0 0 0 0 ${b.toFixed(4)}
      0 0 0 1 0"/>
  </filter>`
    })
    .join("\n  ")

  const defs = `<defs>
  <pattern id="wood" patternUnits="userSpaceOnUse" width="48" height="48">
    <rect width="48" height="48" fill="#e8dcc8"/>
    <path d="M0 8h48M0 20h48M0 32h48M0 44h48" stroke="#d4c4a8" stroke-width="1.2" opacity="0.55"/>
    <path d="M0 14h48M0 26h48M0 38h48" stroke="#cbb892" stroke-width="0.6" opacity="0.35"/>
  </pattern>
  <linearGradient id="capHighlight" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
    <stop offset="45%" stop-color="#ffffff" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </linearGradient>
  <filter id="keyShadow" x="-20%" y="-15%" width="140%" height="150%">
    <feDropShadow dx="2" dy="3" stdDeviation="2.2" flood-color="#000000" flood-opacity="0.28"/>
  </filter>
  ${recolorFilters}
</defs>`

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
        options.legendColorId ?? null,
      )
      const lidX = x + LID_INSET
      const lidY = y + LID_INSET
      const lidSize = KEY - LID_INSET * 2
      const cx = x + KEY / 2
      const cy = y + KEY / 2
      const filterId =
        legendInks.get(layers.legendHex.toLowerCase()) ?? "recolor-0"
      return `<g filter="url(#keyShadow)">
  <rect x="${x}" y="${y}" width="${KEY}" height="${KEY}" rx="${CAP_RADIUS}" fill="${layers.capHex}"/>
  <rect x="${x}" y="${y}" width="${KEY}" height="${KEY}" rx="${CAP_RADIUS}" fill="url(#capHighlight)"/>
  <rect x="${lidX}" y="${lidY}" width="${lidSize}" height="${lidSize}" rx="${LID_RADIUS}" fill="${layers.lidHex}"/>
  ${legendMarkup(key, cx, cy, layers.legendHex, filterId)}
</g>`
    })
    .join("\n")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${defs}
<rect width="${width}" height="${height}" fill="url(#wood)"/>
${bodies}
</svg>`
}
