import { describe, expect, it } from "vitest"
import { resolveFilamentHex } from "@/lib/filaments"
import { buildSetSvg } from "@/lib/svg"
import type { Keycap } from "@/lib/types"

const redHex = resolveFilamentHex("pla-red")
const blackHex = resolveFilamentHex("pla-black")

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
    expect(svg).toContain("<image href=\"data:image/png;base64,")
    expect(svg).toContain('filter="url(#recolor-0)"')
    expect(svg).toContain(redHex)
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
    // Cap red, lid black, legend red (same as cap) via recolor filter
    expect(svg).toContain(`fill="${redHex}"`)
    expect(svg).toContain(`fill="${blackHex}"`)
    expect(svg).toContain("<image href=\"data:image/png;base64,")
    expect(svg).toContain('id="recolor-0"')
    expect(svg).toMatch(/0 0 0 0 0\.\d+/) // feColorMatrix RGB channels
  })

  it("returns empty-set friendly svg for no keys", () => {
    const svg = buildSetSvg([], {
      mode: "one",
      colorAId: "pla-black",
      colorBId: null,
    })
    expect(svg.startsWith("<svg")).toBe(true)
  })

  it("includes wood background and depth defs for dimensional export", () => {
    const svg = buildSetSvg(keys, {
      mode: "one",
      colorAId: "pla-red",
      colorBId: "pla-black",
    })
    expect(svg).toContain('id="wood"')
    expect(svg).toContain('id="keyShadow"')
    expect(svg).toContain('id="capHighlight"')
    expect(svg).toContain('fill="url(#wood)"')
    expect(svg).toContain('filter="url(#keyShadow)"')
  })

  it("lays out vertical orientation as a single column", () => {
    const svg = buildSetSvg(keys, {
      mode: "one",
      colorAId: "pla-red",
      colorBId: "pla-black",
      orientation: "vertical",
    })
    expect(svg).toContain('width="104"')
    expect(svg).toContain('height="190"')
  })

  it("lays out horizontal orientation in a row", () => {
    const svg = buildSetSvg(keys, {
      mode: "one",
      colorAId: "pla-red",
      colorBId: "pla-black",
      orientation: "horizontal",
    })
    expect(svg).toContain('width="190"')
    expect(svg).toContain('height="104"')
  })
})
