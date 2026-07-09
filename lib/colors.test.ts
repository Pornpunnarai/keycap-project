import { describe, expect, it } from "vitest"
import {
  alternateColorId,
  legendInkForHex,
  reapplyAlternateColors,
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
