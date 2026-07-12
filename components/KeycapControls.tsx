"use client"

import { useState, type Dispatch, type SetStateAction } from "react"
import { FilamentPicker } from "@/components/FilamentPicker"
import { reapplyAlternateColors } from "@/lib/colors"
import { downloadSetPng, downloadSetSvg } from "@/lib/export"
import { defaultBlackLegendColorId, defaultLegendColorId } from "@/lib/filaments"
import { buildOrderUrl, summarizeOrder } from "@/lib/share"
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
  const [copyStatus, setCopyStatus] = useState<"idle" | "ok" | "err">("idle")
  const canExport = state.keycaps.length > 0
  const exportOptions = {
    mode: state.mode,
    colorAId: state.colorAId,
    colorBId: state.colorBId,
    legendColorId: state.legendColorId,
    orientation: state.orientation,
  }
  const orderSummary = summarizeOrder(state)

  async function copyOrderLink() {
    try {
      const url = buildOrderUrl(
        window.location.origin,
        window.location.pathname,
        state,
      )
      await navigator.clipboard.writeText(url)
      setCopyStatus("ok")
      window.setTimeout(() => setCopyStatus("idle"), 2000)
    } catch {
      setCopyStatus("err")
      window.setTimeout(() => setCopyStatus("idle"), 2500)
    }
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
    <div className="flex min-h-full flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4">
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
        label={
          state.legendColorId
            ? "สี A · ฐาน"
            : "สี A · ฐาน + ตัวอักษร"
        }
        value={state.colorAId}
        onChange={(colorAId) =>
          setState((s) => {
            const legendColorId =
              s.legendColorId && s.legendColorId === colorAId
                ? null
                : s.legendColorId
            if (s.mode === "two" && s.colorBId) {
              return {
                ...s,
                colorAId,
                legendColorId,
                keycaps: reapplyAlternateColors(s.keycaps, colorAId, s.colorBId),
              }
            }
            return {
              ...s,
              colorAId,
              legendColorId,
              keycaps: s.keycaps.map((k) => ({ ...k, colorId: colorAId })),
            }
          })
        }
      />

      {state.mode === "one" ? (
        <FilamentPicker
          label="สีฝา"
          value={state.colorBId ?? ""}
          onChange={(colorBId) => setState((s) => ({ ...s, colorBId }))}
        />
      ) : (
        <>
          <FilamentPicker
            label="สี B · ฝา"
            value={state.colorBId ?? ""}
            onChange={(colorBId) =>
              setState((s) => ({
                ...s,
                colorBId,
                keycaps: reapplyAlternateColors(s.keycaps, s.colorAId, colorBId),
              }))
            }
          />

          <button
            type="button"
            className="btn btn-secondary disabled:opacity-40"
            disabled={!state.colorBId}
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
                  legendColorId:
                    s.legendColorId && s.legendColorId === colorAId
                      ? null
                      : s.legendColorId,
                  keycaps: reapplyAlternateColors(s.keycaps, colorAId, colorBId),
                }
              })
            }}
          >
            สลับ A ↔ B
          </button>
        </>
      )}

      {state.legendColorId ? (
        <>
          <FilamentPicker
            label="สี key · ตัวอักษร/ไอคอน"
            value={state.legendColorId}
            onChange={(legendColorId) =>
              setState((s) => ({
                ...s,
                legendColorId:
                  legendColorId === s.colorAId ? null : legendColorId,
              }))
            }
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-export disabled:opacity-40"
              disabled={state.colorAId === defaultBlackLegendColorId()}
              onClick={() =>
                setState((s) => {
                  const blackId = defaultBlackLegendColorId()
                  return {
                    ...s,
                    legendColorId: blackId === s.colorAId ? null : blackId,
                  }
                })
              }
            >
              Default
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setState((s) => ({ ...s, legendColorId: null }))}
            >
              ลบสี key
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          className="btn btn-export"
          onClick={() =>
            setState((s) => ({
              ...s,
              legendColorId: defaultLegendColorId(s.colorAId),
            }))
          }
        >
          เพิ่มสี key ใหม่
        </button>
      )}

      <div className="mt-auto flex flex-col gap-2 border-t border-neutral-100 pt-3">
        <button
          type="button"
          className="btn btn-accent disabled:opacity-40"
          disabled={!canExport}
          onClick={() => void copyOrderLink()}
        >
          {copyStatus === "ok"
            ? "คัดลอกลิงก์แล้ว"
            : copyStatus === "err"
              ? "คัดลอกไม่สำเร็จ"
              : "คัดลอกลิงก์ออเดอร์"}
        </button>
        <p className="text-xs text-neutral-500">{orderSummary}</p>
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
