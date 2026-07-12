import { describe, expect, it } from "vitest"
import {
  buildOrderUrl,
  decodeOrderParam,
  encodeOrderParam,
  stateToSharePayload,
  summarizeOrder,
} from "@/lib/share"
import type { SetState } from "@/lib/types"

const sample: SetState = {
  mode: "two",
  colorAId: "pla-black",
  colorBId: "pla-yellow",
  legendColorId: null,
  orientation: "horizontal",
  keycaps: [
    {
      id: "key-1",
      colorId: "pla-black",
      legendType: "char",
      legendValue: "J",
    },
    {
      id: "key-2",
      colorId: "pla-yellow",
      legendType: "char",
      legendValue: "I",
    },
    {
      id: "key-3",
      colorId: "pla-black",
      legendType: null,
      legendValue: null,
    },
  ],
  selectedKeycapId: "key-1",
}

describe("order share encode/decode", () => {
  it("round-trips set state without selected ids", () => {
    const encoded = encodeOrderParam(sample)
    const decoded = decodeOrderParam(encoded)
    expect(decoded).not.toBeNull()
    expect(decoded!.mode).toBe("two")
    expect(decoded!.colorAId).toBe("pla-black")
    expect(decoded!.colorBId).toBe("pla-yellow")
    expect(decoded!.orientation).toBe("horizontal")
    expect(decoded!.keycaps).toHaveLength(3)
    expect(decoded!.keycaps.map((k) => k.legendValue)).toEqual([
      "J",
      "I",
      null,
    ])
    expect(decoded!.keycaps[0].id).not.toBe("key-1")
    expect(decoded!.selectedKeycapId).toBe(decoded!.keycaps[0].id)
  })

  it("returns null for garbage input", () => {
    expect(decodeOrderParam("!!!")).toBeNull()
    expect(decodeOrderParam("")).toBeNull()
  })

  it("builds a shareable url with o param", () => {
    const url = buildOrderUrl("https://example.com", "/", sample)
    expect(url.startsWith("https://example.com/?o=")).toBe(true)
    const param = new URL(url).searchParams.get("o")
    expect(decodeOrderParam(param!)?.keycaps).toHaveLength(3)
  })

  it("summarizes order for quick check", () => {
    expect(summarizeOrder(sample)).toBe("2 สี · 3 คีย์ · แนวนอน")
  })

  it("omits selectedKeycapId from payload", () => {
    const payload = stateToSharePayload(sample)
    expect(payload).toEqual({
      v: 1,
      mode: "two",
      a: "pla-black",
      b: "pla-yellow",
      l: null,
      or: "h",
      k: [
        { c: "pla-black", t: "char", v: "J" },
        { c: "pla-yellow", t: "char", v: "I" },
        { c: "pla-black", t: null, v: null },
      ],
    })
  })

  it("round-trips separate legend color", () => {
    const withLegend: SetState = {
      ...sample,
      legendColorId: "pla-white",
    }
    const decoded = decodeOrderParam(encodeOrderParam(withLegend))
    expect(decoded?.legendColorId).toBe("pla-white")
  })

  it("round-trips vertical orientation", () => {
    const vertical: SetState = { ...sample, orientation: "vertical" }
    const decoded = decodeOrderParam(encodeOrderParam(vertical))
    expect(decoded?.orientation).toBe("vertical")
    expect(summarizeOrder(vertical)).toBe("2 สี · 3 คีย์ · แนวตั้ง")
  })
})
