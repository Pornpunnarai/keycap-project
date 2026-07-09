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

  it("uses same filament for cap/lid and contrast legend in one-color mode", () => {
    const layers = resolveKeycapLayers("one", "pla-black", "pla-black", null)
    expect(layers.capHex).toBe("#1A1A1A")
    expect(layers.lidHex).toBe("#1A1A1A")
    expect(layers.legendHex).toBe("#FFFFFF")
  })
})
