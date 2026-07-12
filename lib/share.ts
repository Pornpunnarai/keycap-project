import { createId } from "@/lib/id"
import type {
  CanvasOrientation,
  ColorMode,
  Keycap,
  LegendType,
  SetState,
} from "@/lib/types"

export type SharePayloadV1 = {
  v: 1
  mode: ColorMode
  a: string
  b: string | null
  /** Optional separate legend color */
  l?: string | null
  /** Layout: h = horizontal, v = vertical */
  or?: "h" | "v"
  k: Array<{
    c: string
    t: LegendType | null
    v: string | null
  }>
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(bytes).toString("base64")
  return base64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "")
}

function base64UrlToBytes(param: string): Uint8Array | null {
  const padded = param.replaceAll("-", "+").replaceAll("_", "/")
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4))
  const base64 = padded + pad
  try {
    const binary =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("binary")
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

export function stateToSharePayload(state: SetState): SharePayloadV1 {
  return {
    v: 1,
    mode: state.mode,
    a: state.colorAId,
    b: state.colorBId,
    l: state.legendColorId,
    or: state.orientation === "vertical" ? "v" : "h",
    k: state.keycaps.map((key) => ({
      c: key.colorId,
      t: key.legendType,
      v: key.legendValue,
    })),
  }
}

export function sharePayloadToState(payload: SharePayloadV1): SetState | null {
  if (payload.v !== 1) return null
  if (payload.mode !== "one" && payload.mode !== "two") return null
  if (typeof payload.a !== "string" || payload.a.length === 0) return null
  if (payload.b !== null && typeof payload.b !== "string") return null
  if (
    payload.l !== undefined &&
    payload.l !== null &&
    typeof payload.l !== "string"
  ) {
    return null
  }
  if (
    payload.or !== undefined &&
    payload.or !== "h" &&
    payload.or !== "v"
  ) {
    return null
  }
  if (!Array.isArray(payload.k) || payload.k.length === 0) return null

  const legendColorId =
    typeof payload.l === "string" && payload.l.length > 0
      ? payload.l === payload.a
        ? null
        : payload.l
      : null

  const orientation: CanvasOrientation =
    payload.or === "v" ? "vertical" : "horizontal"

  const keycaps: Keycap[] = []
  for (const item of payload.k) {
    if (!item || typeof item.c !== "string" || item.c.length === 0) return null
    const legendType =
      item.t === "char" || item.t === "icon" || item.t === null ? item.t : null
    const legendValue =
      legendType === null
        ? null
        : typeof item.v === "string"
          ? item.v
          : null
    if (legendType && !legendValue) return null
    keycaps.push({
      id: createId(),
      colorId: item.c,
      legendType,
      legendValue,
    })
  }

  return {
    mode: payload.mode,
    colorAId: payload.a,
    colorBId: payload.b,
    legendColorId,
    orientation,
    keycaps,
    selectedKeycapId: keycaps[0]?.id ?? null,
  }
}

export function encodeOrderParam(state: SetState): string {
  const json = JSON.stringify(stateToSharePayload(state))
  return bytesToBase64Url(new TextEncoder().encode(json))
}

export function decodeOrderParam(param: string): SetState | null {
  if (!param) return null
  const bytes = base64UrlToBytes(param)
  if (!bytes) return null
  try {
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json) as SharePayloadV1
    return sharePayloadToState(parsed)
  } catch {
    return null
  }
}

export function buildOrderUrl(
  origin: string,
  pathname: string,
  state: SetState,
): string {
  const url = new URL(pathname || "/", origin)
  url.searchParams.set("o", encodeOrderParam(state))
  return url.toString()
}

export function summarizeOrder(state: SetState): string {
  const modeLabel = state.mode === "one" ? "1 สี" : "2 สี"
  const layoutLabel =
    state.orientation === "vertical" ? "แนวตั้ง" : "แนวนอน"
  return `${modeLabel} · ${state.keycaps.length} คีย์ · ${layoutLabel}`
}
