"use client"

import { FILAMENTS } from "@/data/filaments"

type Props = {
  label: string
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}

export function FilamentPicker({ label, value, onChange, disabled }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-neutral-700">{label}</span>
      <select
        className="rounded border border-neutral-300 bg-white px-2 py-1.5"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {FILAMENTS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </label>
  )
}
