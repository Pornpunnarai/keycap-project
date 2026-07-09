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
  it("returns an svg with cap and lid rects per keycap", () => {
    const svg = buildSetSvg(keys, {
      mode: "one",
      colorAId: "pla-red",
      colorBId: "pla-black",
    })
    expect(svg.startsWith("<svg")).toBe(true)
    expect(svg).toContain("</svg>")
    expect((svg.match(/<rect/g) ?? []).length).toBeGreaterThanOrEqual(4)
    expect(svg).toContain(">A</text>")
    expect(svg).toContain("#C62828")
  })

  it("draws Cap A / Lid B / Legend A in two-color mode", () => {
    const svg = buildSetSvg(
      [
        {
          id: "1",
          colorId: "pla-red",
          legendType: "char",
          legendValue: "X",
        },
      ],
      {
        mode: "two",
        colorAId: "pla-red",
        colorBId: "pla-black",
      },
    )
    // Cap red, lid black, legend red (same as cap)
    expect(svg).toContain('fill="#C62828"')
    expect(svg).toContain('fill="#1A1A1A"')
    expect(svg).toContain(">X</text>")
    expect(svg).toMatch(/fill="#C62828"[^>]*>X<\/text>|fill="#C62828"/)
  })

  it("returns empty-set friendly svg for no keys", () => {
    const svg = buildSetSvg([], {
      mode: "one",
      colorAId: "pla-black",
      colorBId: null,
    })
    expect(svg.startsWith("<svg")).toBe(true)
  })
})
