import { describe, expect, it } from "vitest"
import { FILAMENTS } from "@/data/filaments"
import {
  addKeycap,
  createInitialSetState,
  removeSelectedKeycap,
  colorIdForNewKey,
} from "@/lib/keycap-set"

describe("createInitialSetState", () => {
  it("starts with one blank selected keycap using color A", () => {
    const state = createInitialSetState()
    expect(state.mode).toBe("one")
    expect(state.colorAId).toBe(FILAMENTS[0].id)
    expect(state.colorBId).toBe(FILAMENTS[1].id)
    expect(state.legendColorId).toBeNull()
    expect(state.orientation).toBe("horizontal")
    expect(state.keycaps).toHaveLength(1)
    expect(state.keycaps[0].legendType).toBeNull()
    expect(state.selectedKeycapId).toBe(state.keycaps[0].id)
  })
})

describe("colorIdForNewKey", () => {
  it("uses A in one mode", () => {
    expect(colorIdForNewKey("one", 5, "a", "b")).toBe("a")
  })

  it("alternates in two mode", () => {
    expect(colorIdForNewKey("two", 0, "a", "b")).toBe("a")
    expect(colorIdForNewKey("two", 1, "a", "b")).toBe("b")
  })
})

describe("addKeycap / removeSelectedKeycap", () => {
  it("adds a key with mode-based color and selects it", () => {
    let state = createInitialSetState()
    state = { ...state, mode: "two", colorAId: "pla-black", colorBId: "pla-white" }
    state = addKeycap(state)
    expect(state.keycaps).toHaveLength(2)
    expect(state.keycaps[1].colorId).toBe("pla-white")
    expect(state.selectedKeycapId).toBe(state.keycaps[1].id)
  })

  it("removes selected key and selects neighbor", () => {
    let state = createInitialSetState()
    state = addKeycap(state)
    const removeId = state.keycaps[0].id
    state = { ...state, selectedKeycapId: removeId }
    state = removeSelectedKeycap(state)
    expect(state.keycaps).toHaveLength(1)
    expect(state.keycaps[0].id).not.toBe(removeId)
    expect(state.selectedKeycapId).toBe(state.keycaps[0].id)
  })

  it("does not remove the last keycap", () => {
    let state = createInitialSetState()
    const onlyId = state.keycaps[0].id
    state = removeSelectedKeycap(state)
    expect(state.keycaps).toHaveLength(1)
    expect(state.keycaps[0].id).toBe(onlyId)
  })
})
