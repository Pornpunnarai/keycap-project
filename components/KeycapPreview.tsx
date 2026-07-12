"use client"

import { resolveKeycapLayers } from "@/lib/colors"
import { getCharComponent } from "@/lib/char-registry"
import { getIconComponent } from "@/lib/icon-registry"
import type { CanvasOrientation, ColorMode, Keycap } from "@/lib/types"

export type { CanvasOrientation }

type Props = {
  keycaps: Keycap[]
  selectedKeycapId?: string | null
  onSelect?: (id: string) => void
  mode: ColorMode
  colorAId: string
  colorBId: string | null
  legendColorId?: string | null
  orientation?: CanvasOrientation
}

function LegendView({
  keycap,
  ink,
}: {
  keycap: Keycap
  ink: string
}) {
  if (!keycap.legendType || !keycap.legendValue) return null
  if (keycap.legendType === "char") {
    const Char = getCharComponent(keycap.legendValue)
    if (Char) {
      return (
        <span className="legend-icon legend-icon-canvas">
          <Char size={40} color={ink} />
        </span>
      )
    }
    return (
      <span className="legend-char legend-char-canvas" style={{ color: ink }}>
        {keycap.legendValue}
      </span>
    )
  }
  const Icon = getIconComponent(keycap.legendValue)
  if (!Icon) {
    return (
      <span className="legend-char text-[10px]" style={{ color: ink }}>
        {keycap.legendValue}
      </span>
    )
  }
  return (
    <span className="legend-icon legend-icon-canvas">
      <Icon size={40} color={ink} />
    </span>
  )
}

export function KeycapPreview({
  keycaps,
  selectedKeycapId = null,
  onSelect,
  mode,
  colorAId,
  colorBId,
  legendColorId = null,
  orientation = "horizontal",
}: Props) {
  const layoutClass =
    orientation === "vertical"
      ? "flex flex-col items-center gap-3"
      : "flex flex-row flex-wrap content-start justify-center gap-3"

  return (
    <div className={layoutClass}>
      {keycaps.map((key) => {
        const layers = resolveKeycapLayers(
          mode,
          key.colorId,
          colorAId,
          colorBId,
          legendColorId,
        )
        const selected = key.id === selectedKeycapId
        return (
          <button
            key={key.id}
            type="button"
            onClick={() => onSelect?.(key.id)}
            className={`keycap-shell relative flex h-[72px] w-[72px] items-center justify-center rounded-[14px] border-0 ${
              selected ? "ring-2 ring-[var(--btn-selected-ring)]" : ""
            }`}
            style={{ backgroundColor: layers.capHex }}
            aria-pressed={selected}
            title="ฐาน / ฝา / ตัวอักษร"
          >
            <span
              className="keycap-lid absolute inset-[6px] rounded-[10px]"
              style={{ backgroundColor: layers.lidHex }}
            >
              <span className="keycap-legend">
                <LegendView keycap={key} ink={layers.legendHex} />
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
