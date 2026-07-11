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
          className="btn btn-primary"
          onClick={onAdd}
        >
          + เพิ่มคีย์
        </button>
        <button
          type="button"
          className="btn btn-secondary disabled:opacity-40"
          onClick={onRemove}
          disabled={state.keycaps.length <= 1}
        >
          ลบ
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={onClear}
        >
          ล้าง
        </button>
      </div>

      <div className="flex gap-2 text-sm">
        {(["one", "two"] as ColorMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`btn ${state.mode === mode ? "btn-primary" : ""}`}
            onClick={() => setMode(mode)}
          >
            {mode === "one" ? "1 สี" : "2 สี"}
          </button>
        ))}
      </div>

      <FilamentPicker
        label="สี A · ฐาน + ตัวอักษร"
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
        label="สี B · ฝา"
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
          3 ชั้น: ฐาน A → ฝา B → ตัวอักษร A สลับเมื่อฐานเป็น B สีต่อคีย์ถูกล็อก
        </p>
      )}

      <button
        type="button"
        className="btn btn-secondary disabled:opacity-40"
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
        สลับ A ↔ B
      </button>

      <button
        type="button"
        className="btn btn-accent text-left disabled:opacity-40"
        disabled={!canReapply}
        onClick={() => {
          if (!state.colorBId) return
          setState((s) => ({
            ...s,
            keycaps: reapplyAlternateColors(s.keycaps, s.colorAId, s.colorBId!),
          }))
        }}
      >
        จัดสีสลับใหม่
        <span className="mt-0.5 block text-xs font-normal opacity-80">
          สีฐานเรียงตามลำดับ A/B
        </span>
      </button>

      {selected && state.mode === "one" && (
        <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3">
          <p className="text-sm font-medium text-neutral-700">คีย์ที่เลือก</p>
          <FilamentPicker
            label="สีคีย์"
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
          className="btn btn-export disabled:opacity-40"
          disabled={!canExport}
          onClick={() => downloadSetSvg(state.keycaps, exportOptions)}
        >
          ดาวน์โหลด SVG
        </button>
        <button
          type="button"
          className="btn btn-export disabled:opacity-40"
          disabled={!canExport}
          onClick={() => void downloadSetPng(state.keycaps, exportOptions)}
        >
          ดาวน์โหลด PNG
        </button>
      </div>
    </div>
  )
}
