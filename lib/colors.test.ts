import { describe, expect, it } from "vitest"
import { FILAMENTS } from "@/data/filaments"
import {
  alternateColorId,
  legendInkForHex,
  oppositeColorId,
  reapplyAlternateColors,
  resolveKeycapLayers,
} from "@/lib/colors"
import type { Keycap } from "@/lib/types"

describe("alternateColorId", () => {
  it("uses A for even index and B for odd index", () => {
    expect(alternateColorId(0, "a", "b")).toBe("a")
    expect(alternateColorId(1, "a", "b")).toBe("b")
    expect(alternateColorId(2, "a", "b")).toBe("a")
  })
})

describe("reapplyAlternateColors", () => {
  it("rewrites every key color by index", () => {
    const keys: Keycap[] = [
      { id: "1", colorId: "x", legendType: null, legendValue: null },
      { id: "2", colorId: "y", legendType: null, legendValue: null },
      { id: "3", colorId: "z", legendType: null, legendValue: null },
    ]
    const next = reapplyAlternateColors(keys, "a", "b")
    expect(next.map((k) => k.colorId)).toEqual(["a", "b", "a"])
  })
})

describe("legendInkForHex", () => {
  it("returns light ink on dark filament", () => {
    expect(legendInkForHex("#1A1A1A")).toBe("#FFFFFF")
  })

  it("returns dark ink on light filament", () => {
    expect(legendInkForHex("#F5F5F5")).toBe("#111111")
  })
})

describe("oppositeColorId", () => {
  it("swaps A and B", () => {
    expect(oppositeColorId("a", "a", "b")).toBe("b")
    expect(oppositeColorId("b", "a", "b")).toBe("a")
  })
})

describe("resolveKeycapLayers", () => {
  it("uses Cap A / Lid B / Legend A in two-color mode", () => {
    const a = FILAMENTS[0]
    const b = FILAMENTS[2]
    expect(resolveKeycapLayers("two", a.id, a.id, b.id)).toEqual({
      capHex: a.hex,
      lidHex: b.hex,
      legendHex: a.hex,
    })
    expect(resolveKeycapLayers("two", b.id, a.id, b.id)).toEqual({
      capHex: b.hex,
      lidHex: a.hex,
      legendHex: b.hex,
    })
  })

  it("uses Cap A / Lid B / Legend A in one-color mode", () => {
    const a = FILAMENTS.find((f) => f.id === "pla-black")!
    const b = FILAMENTS.find((f) => f.id === "pla-white")!
    const layers = resolveKeycapLayers("one", "ignored", a.id, b.id)
    expect(layers).toEqual({
      capHex: a.hex,
      lidHex: b.hex,
      legendHex: a.hex,
    })
  })

  it("falls back lid to A when B is unset in one-color mode", () => {
    const a = FILAMENTS.find((f) => f.id === "pla-black")!
    const layers = resolveKeycapLayers("one", "ignored", a.id, null)
    expect(layers).toEqual({
      capHex: a.hex,
      lidHex: a.hex,
      legendHex: a.hex,
    })
  })

  it("uses override legend color when set", () => {
    const a = FILAMENTS.find((f) => f.id === "pla-black")!
    const legend = FILAMENTS.find((f) => f.id === "pla-white")!
    const layers = resolveKeycapLayers("one", "ignored", a.id, null, legend.id)
    expect(layers.legendHex).toBe(legend.hex)
    expect(layers.capHex).toBe(a.hex)
  })
})
