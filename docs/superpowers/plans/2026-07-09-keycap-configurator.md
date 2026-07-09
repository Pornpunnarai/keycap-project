# Keycap Configurator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-only Next.js keycap configurator where users add keys one-by-one, pick filament colors from master data (1- or 2-color alternate + per-key override), assign Lucide icons or A–Z/0–9 legends, preview live, and download PNG/SVG.

**Architecture:** Single-page App Router app. Pure functions in `lib/` own color rules, legend validation, filament lookup, SVG generation, and export. React components hold `SetState` in client state and render preview + controls. No backend.

**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide React, Vitest

**Spec:** `docs/superpowers/specs/2026-07-09-keycap-configurator-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `data/filaments.ts` | Owner-edited filament master list |
| `lib/types.ts` | Shared types (`Filament`, `Keycap`, `SetState`, …) |
| `lib/filaments.ts` | Lookup by id + fallback to first filament |
| `lib/colors.ts` | Alternate color by index, re-apply, legend contrast |
| `lib/legend.ts` | Validate char legends (A–Z, 0–9) |
| `lib/keycap-set.ts` | Create initial state, add/remove key, apply color rules |
| `lib/svg.ts` | Build SVG string for the whole set |
| `lib/export.ts` | Trigger SVG/PNG downloads in the browser |
| `lib/id.ts` | Generate unique keycap ids |
| `components/KeycapPreview.tsx` | Clickable grid of keycaps |
| `components/KeycapControls.tsx` | Mode, filaments, add/remove, re-apply, legend, export |
| `components/FilamentPicker.tsx` | Select from master list only |
| `components/LegendPicker.tsx` | Icon vs char + value picker |
| `components/Configurator.tsx` | Client root: state + wire controls/preview |
| `app/layout.tsx` / `app/page.tsx` / `app/globals.css` | Shell |
| `lib/*.test.ts` | Unit tests for pure logic |

---

### Task 1: Scaffold Next.js + Vitest

**Files:**
- Create: project root via `create-next-app`
- Create: `vitest.config.ts`
- Modify: `package.json` (test script)

- [ ] **Step 1: Create the Next.js app in the repo root**

The repo already has `docs/` and `.git/`. Scaffold into a temp dir then move files up, or use create-next-app with `.` if it allows non-empty dirs.

Run from `/Users/sittikomprasert/Documents/keycap-project`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes
```

If create-next-app refuses non-empty directory:

```bash
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes
# then move web/* and web/.* into repo root (except .git), remove web/
```

Expected: `package.json`, `app/`, `tsconfig.json`, Tailwind configured.

- [ ] **Step 2: Install runtime + test deps**

```bash
npm install lucide-react
npm install -D vitest @vitejs/plugin-react jsdom
```

- [ ] **Step 3: Add Vitest config**

Create `vitest.config.ts`:

```ts
import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
```

- [ ] **Step 4: Add test script**

In `package.json` scripts, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify scaffold**

```bash
npm test
npm run build
```

Expected: Vitest exits 0 with no tests (or “no test files”); `next build` succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Vitest and Lucide"
```

---

### Task 2: Types + filament master data + lookup

**Files:**
- Create: `lib/types.ts`
- Create: `data/filaments.ts`
- Create: `lib/filaments.ts`
- Test: `lib/filaments.test.ts`

- [ ] **Step 1: Write the failing lookup tests**

Create `lib/filaments.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — modules not found / exports missing.

- [ ] **Step 3: Add types**

Create `lib/types.ts`:

```ts
export type Filament = {
  id: string
  name: string
  hex: string
}

export type LegendType = "icon" | "char"

export type Keycap = {
  id: string
  colorId: string
  legendType: LegendType | null
  legendValue: string | null
}

export type ColorMode = "one" | "two"

export type SetState = {
  mode: ColorMode
  colorAId: string
  colorBId: string | null
  keycaps: Keycap[]
  selectedKeycapId: string | null
}
```

- [ ] **Step 4: Add starter filament master data**

Create `data/filaments.ts` (owner replaces with real stock later):

```ts
import type { Filament } from "@/lib/types"

export const FILAMENTS: Filament[] = [
  { id: "pla-black", name: "PLA Black", hex: "#1A1A1A" },
  { id: "pla-white", name: "PLA White", hex: "#F5F5F5" },
  { id: "pla-red", name: "PLA Red", hex: "#C62828" },
  { id: "pla-blue", name: "PLA Blue", hex: "#1565C0" },
  { id: "pla-yellow", name: "PLA Yellow", hex: "#F9A825" },
]
```

- [ ] **Step 5: Implement lookup**

Create `lib/filaments.ts`:

```ts
import { FILAMENTS } from "@/data/filaments"
import type { Filament } from "@/lib/types"

export function getFilament(id: string): Filament | undefined {
  return FILAMENTS.find((f) => f.id === id)
}

export function resolveFilamentHex(colorId: string): string {
  return getFilament(colorId)?.hex ?? FILAMENTS[0].hex
}

export function defaultColorAId(): string {
  return FILAMENTS[0].id
}

export function defaultColorBId(): string | null {
  return FILAMENTS[1]?.id ?? null
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add lib/types.ts data/filaments.ts lib/filaments.ts lib/filaments.test.ts
git commit -m "feat: add filament master data and lookup helpers"
```

---

### Task 3: Color rules + legend contrast

**Files:**
- Create: `lib/colors.ts`
- Test: `lib/colors.test.ts`

- [ ] **Step 1: Write failing color tests**

Create `lib/colors.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `lib/colors` missing.

- [ ] **Step 3: Implement colors**

Create `lib/colors.ts`:

```ts
import type { Keycap } from "@/lib/types"

export function alternateColorId(
  index: number,
  colorAId: string,
  colorBId: string,
): string {
  return index % 2 === 0 ? colorAId : colorBId
}

export function reapplyAlternateColors(
  keycaps: Keycap[],
  colorAId: string,
  colorBId: string,
): Keycap[] {
  return keycaps.map((key, index) => ({
    ...key,
    colorId: alternateColorId(index, colorAId, colorBId),
  }))
}

/** Relative luminance 0–1 from #RRGGBB */
function luminance(hex: string): number {
  const h = hex.replace("#", "")
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const toLin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
}

export function legendInkForHex(hex: string): string {
  return luminance(hex) < 0.45 ? "#FFFFFF" : "#111111"
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/colors.ts lib/colors.test.ts
git commit -m "feat: add alternate color rules and legend contrast"
```

---

### Task 4: Legend validation

**Files:**
- Create: `lib/legend.ts`
- Test: `lib/legend.test.ts`

- [ ] **Step 1: Write failing legend tests**

Create `lib/legend.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `lib/legend` missing.

- [ ] **Step 3: Implement legend helpers**

Create `lib/legend.ts`:

```ts
import type { LegendType } from "@/lib/types"

export const CHAR_LEGENDS: string[] = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  ..."0123456789".split(""),
]

export function isValidCharLegend(value: string): boolean {
  return /^[A-Z0-9]$/.test(value)
}

export function isValidLegend(
  legendType: LegendType | null,
  legendValue: string | null,
): boolean {
  if (legendType === null && legendValue === null) return true
  if (legendType === null || legendValue === null) return false
  if (legendType === "char") return isValidCharLegend(legendValue)
  if (legendType === "icon") return legendValue.length > 0
  return false
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/legend.ts lib/legend.test.ts
git commit -m "feat: add legend validation for icons and A-Z/0-9"
```

---

### Task 5: Set state helpers (create / add / remove / color apply)

**Files:**
- Create: `lib/id.ts`
- Create: `lib/keycap-set.ts`
- Test: `lib/keycap-set.test.ts`

- [ ] **Step 1: Write failing set-state tests**

Create `lib/keycap-set.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import { FILAMENTS } from "@/data/filaments"
import {
  addKeycap,
  createInitialSetState,
  removeSelectedKeycap,
  colorIdForNewKey,
} from "@/lib/keycap-set"

describe("createInitialSetState", () => {
  it("starts with one blank selected keycap using color A", () => {
    const state = createInitialSetState()
    expect(state.mode).toBe("one")
    expect(state.colorAId).toBe(FILAMENTS[0].id)
    expect(state.colorBId).toBe(FILAMENTS[1].id)
    expect(state.keycaps).toHaveLength(1)
    expect(state.keycaps[0].legendType).toBeNull()
    expect(state.selectedKeycapId).toBe(state.keycaps[0].id)
  })
})

describe("colorIdForNewKey", () => {
  it("uses A in one mode", () => {
    expect(colorIdForNewKey("one", 5, "a", "b")).toBe("a")
  })

  it("alternates in two mode", () => {
    expect(colorIdForNewKey("two", 0, "a", "b")).toBe("a")
    expect(colorIdForNewKey("two", 1, "a", "b")).toBe("b")
  })
})

describe("addKeycap / removeSelectedKeycap", () => {
  it("adds a key with mode-based color and selects it", () => {
    let state = createInitialSetState()
    state = { ...state, mode: "two", colorAId: "pla-black", colorBId: "pla-white" }
    state = addKeycap(state)
    expect(state.keycaps).toHaveLength(2)
    expect(state.keycaps[1].colorId).toBe("pla-white")
    expect(state.selectedKeycapId).toBe(state.keycaps[1].id)
  })

  it("removes selected key and selects neighbor", () => {
    let state = createInitialSetState()
    state = addKeycap(state)
    const removeId = state.keycaps[0].id
    state = { ...state, selectedKeycapId: removeId }
    state = removeSelectedKeycap(state)
    expect(state.keycaps).toHaveLength(1)
    expect(state.keycaps[0].id).not.toBe(removeId)
    expect(state.selectedKeycapId).toBe(state.keycaps[0].id)
  })

  it("does not remove the last keycap", () => {
    let state = createInitialSetState()
    const onlyId = state.keycaps[0].id
    state = removeSelectedKeycap(state)
    expect(state.keycaps).toHaveLength(1)
    expect(state.keycaps[0].id).toBe(onlyId)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — modules missing.

- [ ] **Step 3: Implement id + keycap-set**

Create `lib/id.ts`:

```ts
export function createId(prefix = "key"): string {
  return `${prefix}-${crypto.randomUUID()}`
}
```

Create `lib/keycap-set.ts`:

```ts
import { alternateColorId } from "@/lib/colors"
import { defaultColorAId, defaultColorBId } from "@/lib/filaments"
import { createId } from "@/lib/id"
import type { ColorMode, Keycap, SetState } from "@/lib/types"

export function colorIdForNewKey(
  mode: ColorMode,
  index: number,
  colorAId: string,
  colorBId: string | null,
): string {
  if (mode === "one" || !colorBId) return colorAId
  return alternateColorId(index, colorAId, colorBId)
}

function blankKeycap(colorId: string): Keycap {
  return {
    id: createId(),
    colorId,
    legendType: null,
    legendValue: null,
  }
}

export function createInitialSetState(): SetState {
  const colorAId = defaultColorAId()
  const key = blankKeycap(colorAId)
  return {
    mode: "one",
    colorAId,
    colorBId: defaultColorBId(),
    keycaps: [key],
    selectedKeycapId: key.id,
  }
}

export function addKeycap(state: SetState): SetState {
  const index = state.keycaps.length
  const colorId = colorIdForNewKey(
    state.mode,
    index,
    state.colorAId,
    state.colorBId,
  )
  const key = blankKeycap(colorId)
  return {
    ...state,
    keycaps: [...state.keycaps, key],
    selectedKeycapId: key.id,
  }
}

export function removeSelectedKeycap(state: SetState): SetState {
  if (state.keycaps.length <= 1 || !state.selectedKeycapId) return state
  const index = state.keycaps.findIndex((k) => k.id === state.selectedKeycapId)
  if (index < 0) return state
  const keycaps = state.keycaps.filter((k) => k.id !== state.selectedKeycapId)
  const nextSelected =
    keycaps[Math.min(index, keycaps.length - 1)]?.id ?? null
  return { ...state, keycaps, selectedKeycapId: nextSelected }
}

export function updateSelectedKeycap(
  state: SetState,
  patch: Partial<Pick<Keycap, "colorId" | "legendType" | "legendValue">>,
): SetState {
  if (!state.selectedKeycapId) return state
  return {
    ...state,
    keycaps: state.keycaps.map((k) =>
      k.id === state.selectedKeycapId ? { ...k, ...patch } : k,
    ),
  }
}
```

Note: Node 20+/modern browsers provide `crypto.randomUUID`. Vitest in Node supports it. If a test environment lacks it, polyfill in the test file — do not change the API.

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/id.ts lib/keycap-set.ts lib/keycap-set.test.ts
git commit -m "feat: add keycap set state helpers"
```

---

### Task 6: SVG builder

**Files:**
- Create: `lib/svg.ts`
- Test: `lib/svg.test.ts`

- [ ] **Step 1: Write failing SVG tests**

Create `lib/svg.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `buildSetSvg` missing.

- [ ] **Step 3: Implement SVG builder**

Create `lib/svg.ts`:

```ts
import { legendInkForHex } from "@/lib/colors"
import { resolveFilamentHex } from "@/lib/filaments"
import type { Keycap } from "@/lib/types"

const KEY = 64
const GAP = 12
const PAD = 16
const RADIUS = 10

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function legendMarkup(
  key: Keycap,
  cx: number,
  cy: number,
  ink: string,
): string {
  if (!key.legendType || !key.legendValue) return ""
  if (key.legendType === "char") {
    return `<text x="${cx}" y="${cy}" fill="${ink}" font-family="system-ui,sans-serif" font-size="28" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(key.legendValue)}</text>`
  }
  // Icon: render name as text placeholder in SVG export v1 so export stays dependency-free.
  // Preview UI uses Lucide React; export uses the icon name centered as text.
  return `<text x="${cx}" y="${cy}" fill="${ink}" font-family="system-ui,sans-serif" font-size="10" text-anchor="middle" dominant-baseline="central">${escapeXml(key.legendValue)}</text>`
}

export function buildSetSvg(keycaps: Keycap[]): string {
  const cols = Math.max(1, Math.min(8, keycaps.length || 1))
  const rows = Math.max(1, Math.ceil((keycaps.length || 1) / cols))
  const width = PAD * 2 + cols * KEY + (cols - 1) * GAP
  const height = PAD * 2 + rows * KEY + (rows - 1) * GAP

  const bodies = keycaps
    .map((key, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = PAD + col * (KEY + GAP)
      const y = PAD + row * (KEY + GAP)
      const fill = resolveFilamentHex(key.colorId)
      const ink = legendInkForHex(fill)
      const cx = x + KEY / 2
      const cy = y + KEY / 2
      return `<g>
  <rect x="${x}" y="${y}" width="${KEY}" height="${KEY}" rx="${RADIUS}" fill="${fill}" stroke="#00000022" stroke-width="1"/>
  ${legendMarkup(key, cx, cy, ink)}
</g>`
    })
    .join("\n")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${bodies}
</svg>`
}
```

**Icon export note (intentional v1):** SVG export labels icons by Lucide name as text so `lib/svg.ts` stays pure and testable without bundling icon paths. The on-screen preview uses real Lucide icons. If icon-path SVG export is needed later, add a separate mapper task — out of scope for this plan unless product requires it before ship.

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/svg.ts lib/svg.test.ts
git commit -m "feat: build set SVG from keycap state"
```

---

### Task 7: Browser export helpers

**Files:**
- Create: `lib/export.ts`

No unit test for DOM download in v1 (manual verify). Keep helpers tiny.

- [ ] **Step 1: Implement download helpers**

Create `lib/export.ts`:

```ts
import { buildSetSvg } from "@/lib/svg"
import type { Keycap } from "@/lib/types"

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadSetSvg(keycaps: Keycap[], filename = "keycap-set.svg") {
  const svg = buildSetSvg(keycaps)
  downloadBlob(filename, new Blob([svg], { type: "image/svg+xml;charset=utf-8" }))
}

export async function downloadSetPng(
  keycaps: Keycap[],
  filename = "keycap-set.png",
  scale = 2,
): Promise<void> {
  const svg = buildSetSvg(keycaps)
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("Failed to load SVG for PNG export"))
      img.src = url
    })
    const canvas = document.createElement("canvas")
    canvas.width = img.width * scale
    canvas.height = img.height * scale
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas unsupported")
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    ctx.drawImage(img, 0, 0)
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("PNG encode failed"))),
        "image/png",
      )
    })
    downloadBlob(filename, pngBlob)
  } finally {
    URL.revokeObjectURL(url)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/export.ts
git commit -m "feat: add SVG and PNG download helpers"
```

---

### Task 8: UI components + page

**Files:**
- Create: `components/FilamentPicker.tsx`
- Create: `components/LegendPicker.tsx`
- Create: `components/KeycapPreview.tsx`
- Create: `components/KeycapControls.tsx`
- Create: `components/Configurator.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css` (only if needed for base styles)

- [ ] **Step 1: FilamentPicker**

Create `components/FilamentPicker.tsx`:

```tsx
"use client"

import { FILAMENTS } from "@/data/filaments"

type Props = {
  label: string
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}

export function FilamentPicker({ label, value, onChange, disabled }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-neutral-700">{label}</span>
      <select
        className="rounded border border-neutral-300 bg-white px-2 py-1.5"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {FILAMENTS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </label>
  )
}
```

- [ ] **Step 2: LegendPicker**

Create `components/LegendPicker.tsx`:

```tsx
"use client"

import * as LucideIcons from "lucide-react"
import { CHAR_LEGENDS } from "@/lib/legend"
import type { LegendType } from "@/lib/types"

const ICON_NAMES = Object.keys(LucideIcons).filter(
  (name) =>
    name !== "default" &&
    name !== "createLucideIcon" &&
    name !== "icons" &&
    /^[A-Z]/.test(name),
) as string[]

type Props = {
  legendType: LegendType | null
  legendValue: string | null
  onChange: (type: LegendType | null, value: string | null) => void
}

export function LegendPicker({ legendType, legendValue, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          className={`rounded border px-2 py-1 ${legendType === null ? "bg-neutral-900 text-white" : "bg-white"}`}
          onClick={() => onChange(null, null)}
        >
          Blank
        </button>
        <button
          type="button"
          className={`rounded border px-2 py-1 ${legendType === "char" ? "bg-neutral-900 text-white" : "bg-white"}`}
          onClick={() => onChange("char", legendType === "char" && legendValue ? legendValue : "A")}
        >
          Character
        </button>
        <button
          type="button"
          className={`rounded border px-2 py-1 ${legendType === "icon" ? "bg-neutral-900 text-white" : "bg-white"}`}
          onClick={() =>
            onChange(
              "icon",
              legendType === "icon" && legendValue ? legendValue : "ArrowUp",
            )
          }
        >
          Icon
        </button>
      </div>

      {legendType === "char" && (
        <select
          className="rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          value={legendValue ?? "A"}
          onChange={(e) => onChange("char", e.target.value)}
        >
          {CHAR_LEGENDS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      {legendType === "icon" && (
        <select
          className="rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm"
          value={legendValue ?? "ArrowUp"}
          onChange={(e) => onChange("icon", e.target.value)}
        >
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
```

If importing all of `lucide-react` hurts bundle size during build, switch `ICON_NAMES` to a curated array of ~40 common names and import icons individually in the preview — keep picker working either way.

- [ ] **Step 3: KeycapPreview**

Create `components/KeycapPreview.tsx`:

```tsx
"use client"

import * as LucideIcons from "lucide-react"
import { legendInkForHex } from "@/lib/colors"
import { resolveFilamentHex } from "@/lib/filaments"
import type { Keycap } from "@/lib/types"
import type { LucideIcon } from "lucide-react"

type Props = {
  keycaps: Keycap[]
  selectedKeycapId: string | null
  onSelect: (id: string) => void
}

function LegendView({
  keycap,
  ink,
}: {
  keycap: Keycap
  ink: string
}) {
  if (!keycap.legendType || !keycap.legendValue) return null
  if (keycap.legendType === "char") {
    return (
      <span className="text-2xl font-bold" style={{ color: ink }}>
        {keycap.legendValue}
      </span>
    )
  }
  const Icon = (LucideIcons as Record<string, LucideIcon | undefined>)[
    keycap.legendValue
  ]
  if (!Icon) {
    return (
      <span className="text-[10px]" style={{ color: ink }}>
        {keycap.legendValue}
      </span>
    )
  }
  return <Icon size={28} color={ink} strokeWidth={2.25} />
}

export function KeycapPreview({
  keycaps,
  selectedKeycapId,
  onSelect,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      {keycaps.map((key) => {
        const fill = resolveFilamentHex(key.colorId)
        const ink = legendInkForHex(fill)
        const selected = key.id === selectedKeycapId
        return (
          <button
            key={key.id}
            type="button"
            onClick={() => onSelect(key.id)}
            className={`flex h-16 w-16 items-center justify-center rounded-xl border-2 shadow-sm ${
              selected ? "border-sky-500 ring-2 ring-sky-200" : "border-black/10"
            }`}
            style={{ backgroundColor: fill }}
            aria-pressed={selected}
          >
            <LegendView keycap={key} ink={ink} />
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: KeycapControls**

Create `components/KeycapControls.tsx`:

```tsx
"use client"

import { FilamentPicker } from "@/components/FilamentPicker"
import { LegendPicker } from "@/components/LegendPicker"
import { reapplyAlternateColors } from "@/lib/colors"
import { downloadSetPng, downloadSetSvg } from "@/lib/export"
import type { ColorMode, SetState } from "@/lib/types"

type Props = {
  state: SetState
  setState: React.Dispatch<React.SetStateAction<SetState>>
  onAdd: () => void
  onRemove: () => void
}

export function KeycapControls({ state, setState, onAdd, onRemove }: Props) {
  const selected =
    state.keycaps.find((k) => k.id === state.selectedKeycapId) ?? null
  const canReapply = state.mode === "two" && Boolean(state.colorBId)
  const canExport = state.keycaps.length > 0

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex gap-2">
        <button type="button" className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white" onClick={onAdd}>
          + Add key
        </button>
        <button
          type="button"
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40"
          onClick={onRemove}
          disabled={state.keycaps.length <= 1}
        >
          Remove selected
        </button>
      </div>

      <div className="flex gap-2 text-sm">
        {(["one", "two"] as ColorMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`rounded border px-3 py-1.5 ${state.mode === mode ? "bg-neutral-900 text-white" : "bg-white"}`}
            onClick={() => setState((s) => ({ ...s, mode }))}
          >
            {mode === "one" ? "1 color" : "2 colors"}
          </button>
        ))}
      </div>

      <FilamentPicker
        label="Color A"
        value={state.colorAId}
        onChange={(colorAId) => setState((s) => ({ ...s, colorAId }))}
      />
      <FilamentPicker
        label="Color B"
        value={state.colorBId ?? ""}
        disabled={state.mode !== "two"}
        onChange={(colorBId) => setState((s) => ({ ...s, colorBId }))}
      />

      <button
        type="button"
        className="rounded border border-amber-500 bg-amber-50 px-3 py-1.5 text-left text-sm text-amber-950 disabled:opacity-40"
        disabled={!canReapply}
        onClick={() => {
          if (!state.colorBId) return
          setState((s) => ({
            ...s,
            keycaps: reapplyAlternateColors(s.keycaps, s.colorAId, s.colorBId!),
          }))
        }}
      >
        Re-apply alternate colors
        <span className="mt-0.5 block text-xs font-normal text-amber-800">
          Overwrites per-key color overrides using A/B by order.
        </span>
      </button>

      {selected && (
        <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3">
          <p className="text-sm font-medium text-neutral-700">Selected key</p>
          <FilamentPicker
            label="Key color"
            value={selected.colorId}
            onChange={(colorId) =>
              setState((s) => ({
                ...s,
                keycaps: s.keycaps.map((k) =>
                  k.id === selected.id ? { ...k, colorId } : k,
                ),
              }))
            }
          />
          <LegendPicker
            legendType={selected.legendType}
            legendValue={selected.legendValue}
            onChange={(legendType, legendValue) =>
              setState((s) => ({
                ...s,
                keycaps: s.keycaps.map((k) =>
                  k.id === selected.id ? { ...k, legendType, legendValue } : k,
                ),
              }))
            }
          />
        </div>
      )}

      <div className="flex gap-2 border-t border-neutral-100 pt-3">
        <button
          type="button"
          className="rounded bg-sky-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          disabled={!canExport}
          onClick={() => downloadSetSvg(state.keycaps)}
        >
          Download SVG
        </button>
        <button
          type="button"
          className="rounded bg-sky-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          disabled={!canExport}
          onClick={() => void downloadSetPng(state.keycaps)}
        >
          Download PNG
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Configurator root**

Create `components/Configurator.tsx`:

```tsx
"use client"

import { useState } from "react"
import { KeycapControls } from "@/components/KeycapControls"
import { KeycapPreview } from "@/components/KeycapPreview"
import {
  addKeycap,
  createInitialSetState,
  removeSelectedKeycap,
} from "@/lib/keycap-set"

export function Configurator() {
  const [state, setState] = useState(createInitialSetState)

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:flex-row">
      <div className="md:w-80 md:shrink-0">
        <KeycapControls
          state={state}
          setState={setState}
          onAdd={() => setState((s) => addKeycap(s))}
          onRemove={() => setState((s) => removeSelectedKeycap(s))}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-neutral-900">
          Keycap configurator
        </h1>
        <p className="mb-4 text-sm text-neutral-600">
          Add keys, pick filament colors, set icons or characters, then download.
        </p>
        <KeycapPreview
          keycaps={state.keycaps}
          selectedKeycapId={state.selectedKeycapId}
          onSelect={(id) => setState((s) => ({ ...s, selectedKeycapId: id }))}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Wire page + layout**

Replace `app/page.tsx`:

```tsx
import { Configurator } from "@/components/Configurator"

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-100">
      <Configurator />
    </main>
  )
}
```

Update `app/layout.tsx` metadata title/description to “Keycap Configurator” / “Mock custom keycap sets with filament colors and legends.”

- [ ] **Step 7: Run app and manual check**

```bash
npm run dev
```

Manual checklist:

1. Page loads with one blank key selected  
2. Add keys in 1-color and 2-color modes — colors follow rules  
3. Re-apply alternate overwrites overrides (warning visible)  
4. Set char A–Z/0–9 and a Lucide icon on different keys  
5. Download SVG and PNG; open files and confirm layout/colors  

Also:

```bash
npm test
npm run build
```

Expected: tests pass; production build succeeds.

- [ ] **Step 8: Commit**

```bash
git add components app
git commit -m "feat: add keycap configurator UI with preview and export"
```

---

### Task 9: Polish owner filament docs + final verify

**Files:**
- Modify: `data/filaments.ts` (comment at top for owner)
- Optional: short note in README if create-next-app added one — keep minimal

- [ ] **Step 1: Document how to edit filaments**

At top of `data/filaments.ts`:

```ts
/**
 * Filament master data — edit this list to match stock on hand.
 * Users can only pick colors defined here (id, name, hex).
 */
```

- [ ] **Step 2: Final verification**

```bash
npm test
npm run build
```

Expected: all unit tests green; build OK.

- [ ] **Step 3: Commit**

```bash
git add data/filaments.ts
git commit -m "docs: note how to maintain filament master data"
```

---

## Spec coverage self-check

| Spec requirement | Task |
|------------------|------|
| Add/remove keys one at a time; start with one blank selected | 5, 8 |
| Filament master data only (no free picker) | 2, 8 |
| 1 / 2 color modes + alternate + re-apply + per-key override | 3, 5, 8 |
| Legend: Lucide icon or A–Z / 0–9; blank allowed | 4, 8 |
| Legend contrast auto | 3, 6, 8 |
| Live preview | 8 |
| Download PNG + SVG (whole set) | 6, 7, 8 |
| No backend / session-only | all |
| Unit tests for color, legend, filament fallback | 2–5 |
| Invalid colorId fallback | 2, 6 |

## Known v1 tradeoff

SVG/PNG **export** draws icon legends as the Lucide **name text**, while on-screen preview shows real Lucide icons. Accept for v1 unless product blocks on true icon paths in export — then add a follow-up task to embed SVG paths.
