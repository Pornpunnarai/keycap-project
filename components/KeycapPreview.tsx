"use client"

import { resolveKeycapLayers } from "@/lib/colors"
import { getIconComponent } from "@/lib/icon-registry"
import type { ColorMode, Keycap } from "@/lib/types"

type Props = {
  keycaps: Keycap[]
  selectedKeycapId: string | null
  onSelect: (id: string) => void
  mode: ColorMode
  colorAId: string
  colorBId: string | null
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
    return (
      <span className="text-2xl font-bold" style={{ color: ink }}>
        {keycap.legendValue}
      </span>
    )
  }
  const Icon = getIconComponent(keycap.legendValue)
  if (!Icon) {
    return (
      <span className="text-[10px]" style={{ color: ink }}>
        {keycap.legendValue}
      </span>
    )
  }
  return <Icon size={26} color={ink} strokeWidth={2.25} />
}

export function KeycapPreview({
  keycaps,
  selectedKeycapId,
  onSelect,
  mode,
  colorAId,
  colorBId,
}: Props) {
  return (
    <div className="flex flex-wrap content-start justify-center gap-3">
      {keycaps.map((key) => {
        const layers = resolveKeycapLayers(
          mode,
          key.colorId,
          colorAId,
          colorBId,
        )
        const selected = key.id === selectedKeycapId
        return (
          <button
            key={key.id}
            type="button"
            onClick={() => onSelect(key.id)}
            className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-[14px] shadow-sm ${
              selected
                ? "border-2 border-[var(--btn-selected-border)] ring-2 ring-[var(--btn-selected-ring)]"
                : "border-2 border-black/10"
            }`}
            style={{ backgroundColor: layers.capHex }}
            aria-pressed={selected}
            title="Cap / Lid / Legend"
          >
            {/* Lid (ฝา) */}
            <span
              className="absolute inset-[8px] flex items-center justify-center rounded-[10px] border border-black/10 shadow-inner"
              style={{ backgroundColor: layers.lidHex }}
            >
              <LegendView keycap={key} ink={layers.legendHex} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
