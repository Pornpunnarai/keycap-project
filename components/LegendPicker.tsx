"use client"

import { CHAR_LEGENDS } from "@/data/characters"
import { KEYCAP_ICONS } from "@/data/icons"
import { getCharComponent } from "@/lib/char-registry"
import { getIconComponent } from "@/lib/icon-registry"
import type { LegendType } from "@/lib/types"

type Props = {
  legendType: LegendType | null
  legendValue: string | null
  onChange: (type: LegendType | null, value: string | null) => void
  onClearAll: () => void
  onClose: () => void
  disabled?: boolean
}

const tileClass = (selected: boolean, disabled?: boolean) =>
  `flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition ${
    selected
      ? "btn-selected text-cyan-900"
      : "border-2 border-teal-200 bg-teal-50 text-teal-900 shadow-sm hover:border-teal-400 hover:bg-teal-100 active:scale-95"
  } ${disabled ? "pointer-events-none opacity-40" : ""}`

export function LegendPicker({
  legendType,
  legendValue,
  onChange,
  onClearAll,
  onClose,
  disabled,
}: Props) {
  const blankSelected = legendType === null && legendValue === null

  return (
    <div
      className={`flex min-h-full flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 ${
        disabled ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            ตัวอักษร/ไอคอน
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {disabled
              ? "ยังไม่มีคีย์บนแคนวาส"
              : "เลือกแล้วเลื่อนไปคีย์ถัดไปอัตโนมัติ"}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            className="btn btn-danger text-xs disabled:opacity-40"
            disabled={disabled}
            onClick={onClearAll}
          >
            Clear
          </button>
          <button
            type="button"
            className="btn btn-secondary text-xs"
            onClick={onClose}
          >
            ปิด
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          ว่าง
        </span>
        <button
          type="button"
          title="ว่าง"
          aria-label="ว่าง"
          aria-pressed={blankSelected}
          disabled={disabled}
          className={tileClass(blankSelected, disabled)}
          onClick={() => onChange(null, null)}
        >
          <span className="text-sm font-semibold text-neutral-500">∅</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          ตัวอักษร
        </span>
        <div
          className="grid grid-cols-6 gap-1.5"
          role="listbox"
          aria-label="ตัวอักษร"
        >
          {CHAR_LEGENDS.map((c) => {
            const selected = legendType === "char" && legendValue === c
            const Char = getCharComponent(c)
            return (
              <button
                key={c}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={`ตัวอักษร ${c}`}
                title={c}
                disabled={disabled}
                className={tileClass(selected, disabled)}
                onClick={() => onChange("char", c)}
              >
                {Char ? (
                  <Char size={18} color="currentColor" />
                ) : (
                  <span className="legend-char text-base">{c}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          ไอคอน
        </span>
        <div
          className="grid grid-cols-5 gap-1.5"
          role="listbox"
          aria-label="ไอคอน"
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
                  <Icon size={18} color="currentColor" />
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
