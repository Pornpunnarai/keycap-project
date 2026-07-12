"use client"

import { useEffect, useState } from "react"
import { KeycapControls } from "@/components/KeycapControls"
import { KeycapPreview } from "@/components/KeycapPreview"
import { LegendPicker } from "@/components/LegendPicker"
import {
  addKeycap,
  createInitialSetState,
  removeSelectedKeycap,
} from "@/lib/keycap-set"
import { decodeOrderParam } from "@/lib/share"
import type { CanvasOrientation, LegendType } from "@/lib/types"

export function Configurator() {
  const [state, setState] = useState(createInitialSetState)
  const [legendOpen, setLegendOpen] = useState(false)
  const [orderLoadError, setOrderLoadError] = useState<string | null>(null)
  const selected =
    state.keycaps.find((k) => k.id === state.selectedKeycapId) ?? null

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("o")
    if (!param) return
    const decoded = decodeOrderParam(param)
    if (decoded) {
      setState(decoded)
      setLegendOpen(true)
      setOrderLoadError(null)
    } else {
      setOrderLoadError("ลิงก์ออเดอร์ไม่ถูกต้อง — เริ่มชุดใหม่แทน")
    }
  }, [])

  function openLegendPanel() {
    setLegendOpen(true)
    setState((s) => ({
      ...s,
      selectedKeycapId: s.keycaps[0]?.id ?? null,
    }))
  }

  function applyLegend(
    legendType: LegendType | null,
    legendValue: string | null,
  ) {
    setState((s) => {
      const currentId = s.selectedKeycapId
      if (!currentId) return s
      const index = s.keycaps.findIndex((k) => k.id === currentId)
      if (index < 0) return s
      const nextId = s.keycaps[index + 1]?.id ?? currentId
      return {
        ...s,
        selectedKeycapId: nextId,
        keycaps: s.keycaps.map((k) =>
          k.id === currentId ? { ...k, legendType, legendValue } : k,
        ),
      }
    })
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-3 py-4 lg:h-screen lg:gap-0 lg:px-4 lg:py-4">
      <header className="shrink-0 px-1 pb-2 lg:pb-3">
        <h1 className="text-xl font-semibold tracking-wide text-neutral-900 lg:text-2xl">
          ตัวจัดชุดคีย์แคป
        </h1>
        <p className="text-sm text-neutral-600">
          ซ้าย: สี · กลาง: แคนวาส · ขวา: ตัวอักษรและไอคอน
        </p>
        {orderLoadError && (
          <p className="mt-1 text-sm text-red-700">{orderLoadError}</p>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-4">
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
                  legendColorId: s.legendColorId,
                  orientation: s.orientation,
                  keycaps: next.keycaps.map((k) => ({
                    ...k,
                    colorId: s.colorAId,
                  })),
                }
              })
            }
          />
        </aside>

        <section className="wood-surface flex min-h-[280px] min-w-0 flex-1 flex-col rounded-xl border border-neutral-200 p-4 lg:overflow-auto">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              แคนวาส
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">
                {state.keycaps.length} คีย์
              </span>
              <div className="flex gap-1.5 text-xs">
                {(
                  [
                    ["horizontal", "แนวนอน"],
                    ["vertical", "แนวตั้ง"],
                  ] as const satisfies ReadonlyArray<
                    readonly [CanvasOrientation, string]
                  >
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`btn ${
                      state.orientation === value
                        ? "btn-primary"
                        : "btn-secondary"
                    }`}
                    aria-pressed={state.orientation === value}
                    onClick={() =>
                      setState((s) => ({ ...s, orientation: value }))
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-1 items-start justify-center pt-2">
            <KeycapPreview
              keycaps={state.keycaps}
              selectedKeycapId={state.selectedKeycapId}
              mode={state.mode}
              colorAId={state.colorAId}
              colorBId={state.colorBId}
              legendColorId={state.legendColorId}
              orientation={state.orientation}
              onSelect={(id) =>
                setState((s) => ({ ...s, selectedKeycapId: id }))
              }
            />
          </div>
        </section>

        <aside className="w-full shrink-0 lg:w-80 lg:overflow-y-auto">
          {legendOpen ? (
            <LegendPicker
              legendType={selected?.legendType ?? null}
              legendValue={selected?.legendValue ?? null}
              disabled={state.keycaps.length === 0}
              onClose={() => setLegendOpen(false)}
              onChange={applyLegend}
              onClearAll={() =>
                setState((s) => ({
                  ...s,
                  selectedKeycapId: s.keycaps[0]?.id ?? null,
                  keycaps: s.keycaps.map((k) => ({
                    ...k,
                    legendType: null,
                    legendValue: null,
                  })),
                }))
              }
            />
          ) : (
            <div className="flex h-full flex-col items-stretch justify-center gap-3 rounded-xl border border-neutral-200 bg-white p-4">
              <p className="text-center text-sm text-neutral-700">
                ใส่ตัวอักษรหรือไอคอนลงคีย์ทีละตัว แล้วเลื่อนไปคีย์ถัดไปอัตโนมัติ
              </p>
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={openLegendPanel}
              >
                ใส่ตัวอักษร / ไอคอน
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
