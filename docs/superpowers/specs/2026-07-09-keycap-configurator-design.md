# Keycap Configurator — Design Spec

**Date:** 2026-07-09  
**Status:** Approved for planning  
**Approach:** Lightweight single-page web app (no backend in v1)

## Problem

Designing custom keycap sets means repeatedly changing colors and legends in a design program. The owner and customers need a simple way to try combinations (count, filament colors, icons/characters) and export a preview image without opening design software for every iteration.

## Goals

- Let users assemble a custom keycap set one key at a time.
- Choose colors only from a filament master list the owner maintains.
- Support 1-color or 2-color modes, with automatic alternating colors and per-key overrides.
- Put a legend on each key: Lucide icon **or** English character (A–Z, 0–9).
- Live preview + download as PNG or SVG.
- Usable by both the owner (internal) and customers (public link).

## Non-goals (v1)

- User accounts, server-side save, shareable config links
- Free-form typed text beyond A–Z / 0–9
- Custom icon upload
- Multiple keycap profiles/shapes
- Ordering / checkout
- Backend API

## Users

| User | Need |
|------|------|
| Owner | Maintain filament colors; quickly mock sets; export for design work |
| Customer | Try combinations in the browser; download preview |

## Product behavior

### Layout

Single page:

- **Controls panel** — count, color mode, filament pickers, legend picker, export
- **Preview** — grid/row of keycaps; click to select a key

### Count

- On load: one blank keycap, already selected.
- Add/remove keys one at a time (customize per key, not fixed pack sizes).

### Colors (filament master data)

- Colors come from a project config file (e.g. `data/filaments.ts`), not a free color picker.
- Each entry: `{ id, name, hex }` — owner adds filaments they stock.
- Users may only pick colors present in master data.

**Modes:**

- **1 color** — all new keys use color A; user can still override per key from master list.
- **2 colors** — pick color A and B from master list; new keys alternate A, B, A, B…; “Re-apply alternate” reapplies A/B by index across the set (overrides are replaced — UI must state this clearly).

### Legend

Per key, choose one:

- **Icon** — from Lucide React (full library in v1; curate a subset later if needed).
- **Character** — A–Z (uppercase only) or 0–9.

Keys may have no legend (blank).

Legend contrast: automatically pick light or dark legend color from filament brightness so icons/chars stay readable.

### Export

- **SVG** — generated from set state (sharp, editable).
- **PNG** — rasterized from the same artwork at a fixed scale (e.g. 2×).
- One file for the whole set (grid/row of all keys), not one file per key in v1.

### Persistence

- In-memory / browser session only. Refresh resets. Acceptable for v1.

## Data model

```ts
type Filament = {
  id: string
  name: string
  hex: string // e.g. "#C62828"
}

type LegendType = "icon" | "char"

type Keycap = {
  id: string
  colorId: string // Filament.id
  legendType: LegendType | null
  legendValue: string | null // Lucide icon name, or "A"–"Z" / "0"–"9"
}

type SetState = {
  mode: "one" | "two"
  colorAId: string
  colorBId: string | null // required when mode === "two"
  keycaps: Keycap[]
  selectedKeycapId: string | null
}
```

### Color apply rules

1. Adding a key in `one` mode → `colorId = colorAId`.
2. Adding a key in `two` mode → alternate by index: even → A, odd → B (0-based).
3. “Re-apply alternate” in `two` mode → rewrite every key’s `colorId` by the same index rule.
4. Per-key color change → set that key’s `colorId` only; does not change mode or A/B defaults.
5. Switching mode `two` → `one` does not auto-rewrite existing keys until user re-applies or edits; new keys use A only.
6. Invalid `colorId` (removed from master) → fall back to first filament in master list when rendering/exporting.

## Architecture

```
app/                  # Next.js App Router — main configurator page
components/           # Preview, controls, filament/legend pickers, export buttons
data/filaments.ts     # Filament master data (owner-edited)
lib/                  # Alternate-color logic, SVG builder, PNG export helpers
```

**Stack:** Next.js (App Router) + React + TypeScript + Tailwind CSS + Lucide React.

**Export pipeline:**

1. Build SVG string/DOM from `SetState` + filament lookup.
2. SVG download → blob download.
3. PNG download → draw SVG to canvas → PNG blob download.

No server required for export.

## UI flow

1. Open page → one blank keycap selected.
2. Choose mode 1/2 → pick filament A (and B).
3. Add keys as needed → colors follow mode rules.
4. Select a key → choose legend type → pick icon or character; optionally override color.
5. Optionally “Re-apply alternate” in 2-color mode.
6. Download PNG and/or SVG.

## Error / edge cases

- Missing color A (or B in two-mode): default pickers to first (and second) filament in master; block “Re-apply alternate” if B missing in two-mode.
- Empty legend: render blank keycap surface.
- Empty set: disable export; show short empty state.
- Very large sets: allow add without hard cap in v1; preview scrolls/wraps. Revisit if performance becomes an issue.

## Testing (v1)

**Unit**

- Alternate coloring by index for 2-color mode
- Re-apply overwrites per-key colors as specified
- Legend validation: icon name vs A–Z / 0–9 only
- Filament lookup / fallback for unknown `colorId`

**Manual**

- Add/remove keys, select key, change color/legend
- 1-color and 2-color flows including re-apply
- Download PNG and SVG; open in a design tool and confirm layout/colors/legends

## Success criteria

- Owner can encode real filament stock as master data and users cannot pick other colors.
- A set can be mocked with mixed icons and A–Z/0–9 legends without opening design software.
- Exported PNG/SVG matches the on-screen preview closely enough to use as a design reference.

## Future (out of scope now)

- Shareable URL / short code for a set
- Owner admin UI to edit filaments without code
- Curated Lucide subset / custom SVG icons
- Per-key file export, multiple profiles, order handoff
