"use client"

import { KEYCAP_ICON_NAMES } from "@/lib/icons"
import { CHAR_LEGENDS } from "@/lib/legend"
import type { LegendType } from "@/lib/types"

type Props = {
  legendType: LegendType | null
  legendValue: string | null
  onChange: (type: LegendType | null, value: string | null) => void
}

export function LegendPicker({ legendType, legendValue, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          className={`rounded border px-2 py-1 ${legendType === null ? "bg-neutral-900 text-white" : "bg-white"}`}
          onClick={() => onChange(null, null)}
        >
          Blank
        </button>
        <button
          type="button"
          className={`rounded border px-2 py-1 ${legendType === "char" ? "bg-neutral-900 text-white" : "bg-white"}`}
          onClick={() =>
            onChange(
              "char",
              legendType === "char" && legendValue ? legendValue : "A",
            )
          }
        >
          Character
        </button>
        <button
          type="button"
          className={`rounded border px-2 py-1 ${legendType === "icon" ? "bg-neutral-900 text-white" : "bg-white"}`}
          onClick={() =>
            onChange(
              "icon",
              legendType === "icon" && legendValue ? legendValue : "ArrowUp",
            )
          }
        >
          Icon
        </button>
      </div>

      {legendType === "char" && (
        <select
          className="rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          value={legendValue ?? "A"}
          onChange={(e) => onChange("char", e.target.value)}
        >
          {CHAR_LEGENDS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      {legendType === "icon" && (
        <select
          className="rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          value={legendValue ?? "ArrowUp"}
          onChange={(e) => onChange("icon", e.target.value)}
        >
          {KEYCAP_ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
