import { describe, expect, it } from "vitest"
import { FILAMENTS } from "@/data/filaments"
import { getFilament, resolveFilamentHex } from "@/lib/filaments"

describe("getFilament", () => {
  it("returns filament by id", () => {
    const first = FILAMENTS[0]
    expect(getFilament(first.id)).toEqual(first)
  })

  it("returns undefined for unknown id", () => {
    expect(getFilament("missing")).toBeUndefined()
  })
})

describe("resolveFilamentHex", () => {
  it("returns hex for known id", () => {
    const first = FILAMENTS[0]
    expect(resolveFilamentHex(first.id)).toBe(first.hex)
  })

  it("falls back to first filament hex for unknown id", () => {
    expect(resolveFilamentHex("missing")).toBe(FILAMENTS[0].hex)
  })
})
