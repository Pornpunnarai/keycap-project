"use client"

import type { Dispatch, SetStateAction } from "react"
import { FilamentPicker } from "@/components/FilamentPicker"
import { reapplyAlternateColors } from "@/lib/colors"
import { downloadSetPng, downloadSetSvg } from "@/lib/export"
import type { ColorMode, SetState } from "@/lib/types"

type Props = {
  state: SetState
  setState: Dispatch<SetStateAction<SetState>>
  onAdd: () => void
  onRemove: () => void
  onClear: () => void
}

export function KeycapControls({
  state,
  setState,
  onAdd,
  onRemove,
  onClear,
}: Props) {
  const selected =
    state.keycaps.find((k) => k.id === state.selectedKeycapId) ?? null
  const canReapply = state.mode === "two" && Boolean(state.colorBId)
  const canExport = state.keycaps.length > 0
  const exportOptions = {
    mode: state.mode,
    colorAId: state.colorAId,
    colorBId: state.colorBId,
  }

  function setMode(mode: ColorMode) {
    setState((s) => {
      if (mode === "two" && s.colorBId) {
        return {
          ...s,
          mode,
          keycaps: reapplyAlternateColors(s.keycaps, s.colorAId, s.colorBId),
        }
      }
      return { ...s, mode }
    })
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
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
          Remove
        </button>
        <button
          type="button"
          className="rounded border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-800"
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      <div className="flex gap-2 text-sm">
        {(["one", "two"] as ColorMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`rounded border px-3 py-1.5 ${state.mode === mode ? "bg-neutral-900 text-white" : "bg-white"}`}
            onClick={() => setMode(mode)}
          >
            {mode === "one" ? "1 color" : "2 colors"}
          </button>
        ))}
      </div>

      <FilamentPicker
        label="Color A · Cap + Legend"
        value={state.colorAId}
        onChange={(colorAId) =>
          setState((s) => {
            if (s.mode === "two" && s.colorBId) {
              return {
                ...s,
                colorAId,
                keycaps: reapplyAlternateColors(s.keycaps, colorAId, s.colorBId),
              }
            }
            return {
              ...s,
              colorAId,
              keycaps: s.keycaps.map((k) => ({ ...k, colorId: colorAId })),
            }
          })
        }
      />
      <FilamentPicker
        label="Color B · Lid"
        value={state.colorBId ?? ""}
        disabled={state.mode !== "two"}
        onChange={(colorBId) =>
          setState((s) => {
            if (s.mode === "two") {
              return {
                ...s,
                colorBId,
                keycaps: reapplyAlternateColors(s.keycaps, s.colorAId, colorBId),
              }
            }
            return { ...s, colorBId }
          })
        }
      />

      {state.mode === "two" && (
        <p className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          3 layers: Cap (base) A → Lid B → Legend A. Swaps when cap is B.
          Per-key color is locked.
        </p>
      )}

      <button
        type="button"
        className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
        disabled={state.mode !== "two" || !state.colorBId}
        onClick={() => {
          if (!state.colorBId) return
          setState((s) => {
            if (!s.colorBId) return s
            const colorAId = s.colorBId
            const colorBId = s.colorAId
            return {
              ...s,
              colorAId,
              colorBId,
              keycaps: reapplyAlternateColors(s.keycaps, colorAId, colorBId),
            }
          })
        }}
      >
        Swap A ↔ B
      </button>

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
        Re-apply alternate
        <span className="mt-0.5 block text-xs font-normal text-amber-800">
          Cap colors follow A/B by order.
        </span>
      </button>

      {selected && state.mode === "one" && (
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
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2 border-t border-neutral-100 pt-3">
        <button
          type="button"
          className="rounded bg-sky-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          disabled={!canExport}
          onClick={() => downloadSetSvg(state.keycaps, exportOptions)}
        >
          Download SVG
        </button>
        <button
          type="button"
          className="rounded bg-sky-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          disabled={!canExport}
          onClick={() => void downloadSetPng(state.keycaps, exportOptions)}
        >
          Download PNG
        </button>
      </div>
    </div>
  )
}
