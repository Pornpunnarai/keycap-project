"use client"

import { FILAMENTS } from "@/data/filaments"

type Props = {
  label: string
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}

export function FilamentPicker({ label, value, onChange, disabled }: Props) {
  const selected = FILAMENTS.find((f) => f.id === value)

  return (
    <div
      className={`flex flex-col gap-2 text-sm ${disabled ? "opacity-40" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-neutral-700">{label}</span>
        {selected && (
          <span className="truncate text-xs text-neutral-500">
            {selected.name}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label={label}>
        {FILAMENTS.map((f) => {
          const isSelected = f.id === value
          return (
            <button
              key={f.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              aria-label={f.name}
              title={f.name}
              disabled={disabled}
              onClick={() => onChange(f.id)}
              className={`h-8 w-8 rounded-full border-2 shadow-sm transition ${
                isSelected
                  ? "border-sky-500 ring-2 ring-sky-200"
                  : "border-black/15 hover:border-black/30"
              } disabled:cursor-not-allowed`}
              style={{ backgroundColor: f.hex }}
            />
          )
        })}
      </div>
    </div>
  )
}
