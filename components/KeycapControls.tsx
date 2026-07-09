"use client"

import type { Dispatch, SetStateAction } from "react"
import { FilamentPicker } from "@/components/FilamentPicker"
import { LegendPicker } from "@/components/LegendPicker"
import { reapplyAlternateColors } from "@/lib/colors"
import { downloadSetPng, downloadSetSvg } from "@/lib/export"
import type { ColorMode, SetState } from "@/lib/types"

type Props = {
  state: SetState
  setState: Dispatch<SetStateAction<SetState>>
  onAdd: () => void
  onRemove: () => void
}

export function KeycapControls({ state, setState, onAdd, onRemove }: Props) {
  const selected =
    state.keycaps.find((k) => k.id === state.selectedKeycapId) ?? null
  const canReapply = state.mode === "two" && Boolean(state.colorBId)
  const canExport = state.keycaps.length > 0

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white"
          onClick={onAdd}
        >
          + Add key
        </button>
        <button
          type="button"
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40"
          onClick={onRemove}
          disabled={state.keycaps.length <= 1}
        >
          Remove selected
        </button>
      </div>

      <div className="flex gap-2 text-sm">
        {(["one", "two"] as ColorMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`rounded border px-3 py-1.5 ${state.mode === mode ? "bg-neutral-900 text-white" : "bg-white"}`}
            onClick={() => setState((s) => ({ ...s, mode }))}
          >
            {mode === "one" ? "1 color" : "2 colors"}
          </button>
        ))}
      </div>

      <FilamentPicker
        label="Color A"
        value={state.colorAId}
        onChange={(colorAId) => setState((s) => ({ ...s, colorAId }))}
      />
      <FilamentPicker
        label="Color B"
        value={state.colorBId ?? ""}
        disabled={state.mode !== "two"}
        onChange={(colorBId) => setState((s) => ({ ...s, colorBId }))}
      />

      <button
        type="button"
        className="rounded border border-amber-500 bg-amber-50 px-3 py-1.5 text-left text-sm text-amber-950 disabled:opacity-40"
        disabled={!canReapply}
        onClick={() => {
          if (!state.colorBId) return
          setState((s) => ({
            ...s,
            keycaps: reapplyAlternateColors(s.keycaps, s.colorAId, s.colorBId!),
          }))
        }}
      >
        Re-apply alternate colors
        <span className="mt-0.5 block text-xs font-normal text-amber-800">
          Overwrites per-key color overrides using A/B by order.
        </span>
      </button>

      {selected && (
        <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3">
          <p className="text-sm font-medium text-neutral-700">Selected key</p>
          <FilamentPicker
            label="Key color"
            value={selected.colorId}
            onChange={(colorId) =>
              setState((s) => ({
                ...s,
                keycaps: s.keycaps.map((k) =>
                  k.id === selected.id ? { ...k, colorId } : k,
                ),
              }))
            }
          />
          <LegendPicker
            legendType={selected.legendType}
            legendValue={selected.legendValue}
            onChange={(legendType, legendValue) =>
              setState((s) => ({
                ...s,
                keycaps: s.keycaps.map((k) =>
                  k.id === selected.id ? { ...k, legendType, legendValue } : k,
                ),
              }))
            }
          />
        </div>
      )}

      <div className="flex gap-2 border-t border-neutral-100 pt-3">
        <button
          type="button"
          className="rounded bg-sky-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          disabled={!canExport}
          onClick={() => downloadSetSvg(state.keycaps)}
        >
          Download SVG
        </button>
        <button
          type="button"
          className="rounded bg-sky-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          disabled={!canExport}
          onClick={() => void downloadSetPng(state.keycaps)}
        >
          Download PNG
        </button>
      </div>
    </div>
  )
}
