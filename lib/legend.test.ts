import { describe, expect, it } from "vitest"
import { CHAR_LEGENDS, isValidCharLegend, isValidLegend } from "@/lib/legend"

describe("CHAR_LEGENDS", () => {
  it("includes A-Z and 0-9 only", () => {
    expect(CHAR_LEGENDS).toContain("A")
    expect(CHAR_LEGENDS).toContain("Z")
    expect(CHAR_LEGENDS).toContain("0")
    expect(CHAR_LEGENDS).toContain("9")
    expect(CHAR_LEGENDS).not.toContain("a")
    expect(CHAR_LEGENDS).toHaveLength(36)
  })
})

describe("isValidCharLegend", () => {
  it("accepts A-Z and 0-9", () => {
    expect(isValidCharLegend("A")).toBe(true)
    expect(isValidCharLegend("9")).toBe(true)
  })

  it("rejects lowercase and other chars", () => {
    expect(isValidCharLegend("a")).toBe(false)
    expect(isValidCharLegend("!")).toBe(false)
    expect(isValidCharLegend("")).toBe(false)
  })
})

describe("isValidLegend", () => {
  it("allows null blank legend", () => {
    expect(isValidLegend(null, null)).toBe(true)
  })

  it("requires matching type and value", () => {
    expect(isValidLegend("char", "B")).toBe(true)
    expect(isValidLegend("char", "b")).toBe(false)
    expect(isValidLegend("icon", "ArrowUp")).toBe(true)
    expect(isValidLegend("icon", "")).toBe(false)
    expect(isValidLegend("char", null)).toBe(false)
  })
})
