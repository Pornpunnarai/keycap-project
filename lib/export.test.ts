import { describe, expect, it } from "vitest"
import { buildExportBasename } from "@/lib/export"
import type { Keycap } from "@/lib/types"

describe("buildExportBasename", () => {
  it("builds keycap-NAME from character legends", () => {
    const keys: Keycap[] = [
      { id: "1", colorId: "a", legendType: "char", legendValue: "M" },
      { id: "2", colorId: "a", legendType: "char", legendValue: "O" },
      { id: "3", colorId: "a", legendType: "char", legendValue: "O" },
      { id: "4", colorId: "a", legendType: "char", legendValue: "K" },
    ]
    expect(buildExportBasename(keys)).toBe("keycap-MOOK")
  })

  it("skips blank and icon keys in the name", () => {
    const keys: Keycap[] = [
      { id: "1", colorId: "a", legendType: "char", legendValue: "J" },
      { id: "2", colorId: "a", legendType: null, legendValue: null },
      { id: "3", colorId: "a", legendType: "icon", legendValue: "Heart" },
      { id: "4", colorId: "a", legendType: "char", legendValue: "N" },
    ]
    expect(buildExportBasename(keys)).toBe("keycap-JN")
  })

  it("falls back when there are no characters", () => {
    const keys: Keycap[] = [
      { id: "1", colorId: "a", legendType: null, legendValue: null },
      { id: "2", colorId: "a", legendType: "icon", legendValue: "Star" },
    ]
    expect(buildExportBasename(keys)).toBe("keycap-set")
  })
})
