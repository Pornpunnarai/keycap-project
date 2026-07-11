"use client"

import { CHAR_LEGENDS } from "@/data/characters"
import { KEYCAP_ICONS } from "@/data/icons"
import { getIconComponent } from "@/lib/icon-registry"
import type { LegendType } from "@/lib/types"

type Props = {
  legendType: LegendType | null
  legendValue: string | null
  onChange: (type: LegendType | null, value: string | null) => void
  disabled?: boolean
}

const tileClass = (selected: boolean, disabled?: boolean) =>
  `flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
    selected
      ? "btn-selected"
      : "border-2 border-black/10 bg-white hover:border-black/25"
  } ${disabled ? "pointer-events-none opacity-40" : ""}`

export function LegendPicker({
  legendType,
  legendValue,
  onChange,
  disabled,
}: Props) {
  const blankSelected = legendType === null && legendValue === null

  return (
    <div
      className={`flex h-full flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 ${
        disabled ? "opacity-70" : ""
      }`}
    >
      <div>
        <h2 className="text-sm font-semibold text-neutral-900">Legend</h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          {disabled
            ? "Select a key on the canvas first"
            : "Tap a character or icon to apply"}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Blank
        </span>
        <button
          type="button"
          title="Blank"
          aria-label="Blank"
          aria-pressed={blankSelected}
          disabled={disabled}
          className={tileClass(blankSelected, disabled)}
          onClick={() => onChange(null, null)}
        >
          <span className="text-[10px] font-medium text-neutral-400">∅</span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Characters
        </span>
        <div
          className="grid grid-cols-6 gap-1.5 overflow-y-auto pr-1"
          role="listbox"
          aria-label="Characters"
        >
          {CHAR_LEGENDS.map((c) => {
            const selected = legendType === "char" && legendValue === c
            return (
              <button
                key={c}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={`Character ${c}`}
                title={c}
                disabled={disabled}
                className={tileClass(selected, disabled)}
                onClick={() => onChange("char", c)}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 border-t border-neutral-100 pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Icons
        </span>
        <div
          className="grid grid-cols-5 gap-1.5 overflow-y-auto pr-1"
          role="listbox"
          aria-label="Icons"
        >
          {KEYCAP_ICONS.map((icon) => {
            const selected = legendType === "icon" && legendValue === icon.id
            const Icon = getIconComponent(icon.id)
            return (
              <button
                key={icon.id}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={icon.name}
                title={icon.name}
                disabled={disabled}
                className={tileClass(selected, disabled)}
                onClick={() => onChange("icon", icon.id)}
              >
                {Icon ? (
                  <Icon size={18} strokeWidth={2.25} />
                ) : (
                  <span className="text-[9px]">{icon.id}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
