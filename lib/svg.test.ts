import { describe, expect, it } from "vitest"
import { buildSetSvg } from "@/lib/svg"
import type { Keycap } from "@/lib/types"

const keys: Keycap[] = [
  {
    id: "1",
    colorId: "pla-red",
    legendType: "char",
    legendValue: "A",
  },
  {
    id: "2",
    colorId: "pla-black",
    legendType: null,
    legendValue: null,
  },
]

describe("buildSetSvg", () => {
  it("returns an svg with one rect per keycap", () => {
    const svg = buildSetSvg(keys)
    expect(svg.startsWith("<svg")).toBe(true)
    expect(svg).toContain("</svg>")
    expect((svg.match(/<rect/g) ?? []).length).toBeGreaterThanOrEqual(2)
    expect(svg).toContain(">A</text>")
    expect(svg).toContain("#C62828")
  })

  it("returns empty-set friendly svg for no keys", () => {
    const svg = buildSetSvg([])
    expect(svg.startsWith("<svg")).toBe(true)
  })
})
