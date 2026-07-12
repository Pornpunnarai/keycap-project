import { alternateColorId } from "@/lib/colors"
import { defaultColorAId, defaultColorBId } from "@/lib/filaments"
import { createId } from "@/lib/id"
import type { ColorMode, Keycap, SetState } from "@/lib/types"

export function colorIdForNewKey(
  mode: ColorMode,
  index: number,
  colorAId: string,
  colorBId: string | null,
): string {
  if (mode === "one" || !colorBId) return colorAId
  return alternateColorId(index, colorAId, colorBId)
}

function blankKeycap(colorId: string): Keycap {
  return {
    id: createId(),
    colorId,
    legendType: null,
    legendValue: null,
  }
}

export function createInitialSetState(): SetState {
  const colorAId = defaultColorAId()
  const key = blankKeycap(colorAId)
  return {
    mode: "one",
    colorAId,
    colorBId: defaultColorBId(),
    legendColorId: null,
    orientation: "horizontal",
    keycaps: [key],
    selectedKeycapId: key.id,
  }
}

export function addKeycap(state: SetState): SetState {
  const index = state.keycaps.length
  const colorId = colorIdForNewKey(
    state.mode,
    index,
    state.colorAId,
    state.colorBId,
  )
  const key = blankKeycap(colorId)
  return {
    ...state,
    keycaps: [...state.keycaps, key],
    selectedKeycapId: key.id,
  }
}

export function removeSelectedKeycap(state: SetState): SetState {
  if (state.keycaps.length <= 1 || !state.selectedKeycapId) return state
  const index = state.keycaps.findIndex((k) => k.id === state.selectedKeycapId)
  if (index < 0) return state
  const keycaps = state.keycaps.filter((k) => k.id !== state.selectedKeycapId)
  const nextSelected =
    keycaps[Math.min(index, keycaps.length - 1)]?.id ?? null
  return { ...state, keycaps, selectedKeycapId: nextSelected }
}

export function updateSelectedKeycap(
  state: SetState,
  patch: Partial<Pick<Keycap, "colorId" | "legendType" | "legendValue">>,
): SetState {
  if (!state.selectedKeycapId) return state
  return {
    ...state,
    keycaps: state.keycaps.map((k) =>
      k.id === state.selectedKeycapId ? { ...k, ...patch } : k,
    ),
  }
}
