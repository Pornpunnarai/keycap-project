"use client"

import { useState } from "react"
import { KeycapControls } from "@/components/KeycapControls"
import { KeycapPreview } from "@/components/KeycapPreview"
import { LegendPicker } from "@/components/LegendPicker"
import {
  addKeycap,
  createInitialSetState,
  removeSelectedKeycap,
} from "@/lib/keycap-set"

export function Configurator() {
  const [state, setState] = useState(createInitialSetState)
  const selected =
    state.keycaps.find((k) => k.id === state.selectedKeycapId) ?? null

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-3 py-4 lg:h-screen lg:gap-0 lg:px-4 lg:py-4">
      <header className="shrink-0 px-1 pb-2 lg:pb-3">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900 lg:text-2xl">
          Keycap configurator
        </h1>
        <p className="text-sm text-neutral-600">
          Left: colors · Center: canvas · Right: characters & icons
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-4">
        {/* Left tools */}
        <aside className="w-full shrink-0 lg:w-72 lg:overflow-y-auto">
          <KeycapControls
            state={state}
            setState={setState}
            onAdd={() => setState((s) => addKeycap(s))}
            onRemove={() => setState((s) => removeSelectedKeycap(s))}
            onClear={() =>
              setState((s) => {
                const next = createInitialSetState()
                return {
                  ...next,
                  mode: s.mode,
                  colorAId: s.colorAId,
                  colorBId: s.colorBId,
                  keycaps: next.keycaps.map((k) => ({
                    ...k,
                    colorId: s.colorAId,
                  })),
                }
              })
            }
          />
        </aside>

        {/* Center canvas */}
        <section className="wood-surface flex min-h-[280px] min-w-0 flex-1 flex-col rounded-xl border border-neutral-200 p-4 lg:overflow-auto">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Canvas
            </span>
            <span className="text-xs text-neutral-500">
              {state.keycaps.length} key
              {state.keycaps.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex flex-1 items-start justify-center">
            <KeycapPreview
              keycaps={state.keycaps}
              selectedKeycapId={state.selectedKeycapId}
              mode={state.mode}
              colorAId={state.colorAId}
              colorBId={state.colorBId}
              onSelect={(id) =>
                setState((s) => ({ ...s, selectedKeycapId: id }))
              }
            />
          </div>
        </section>

        {/* Right legend palette */}
        <aside className="w-full shrink-0 lg:w-80 lg:overflow-hidden">
          <LegendPicker
            legendType={selected?.legendType ?? null}
            legendValue={selected?.legendValue ?? null}
            disabled={!selected}
            onChange={(legendType, legendValue) => {
              if (!selected) return
              setState((s) => ({
                ...s,
                keycaps: s.keycaps.map((k) =>
                  k.id === selected.id ? { ...k, legendType, legendValue } : k,
                ),
              }))
            }}
          />
        </aside>
      </div>
    </div>
  )
}
