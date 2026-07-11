# Pastel Button Colors — Design Spec

**Date:** 2026-07-11  
**Status:** Approved for planning  
**Approach:** CSS variables + utility classes in `globals.css`, applied across button groups

## Problem

Many configurator buttons use neutral gray/black styles and are hard to distinguish at a glance. Users want clearer, more colorful buttons without a loud or high-contrast look.

## Goals

- Make every interactive button group easier to scan via soft pastel colors.
- Keep a single source of truth for button colors (CSS variables + utility classes).
- Preserve existing layout, sizing, spacing, and disabled behavior.

## Non-goals

- Redesign layout, typography, or panel structure
- Change filament color swatches (they already show real filament hex)
- Add new hover/animation systems beyond current behavior
- Introduce a React `<Button>` component abstraction
- Dark-mode-specific pastel palette (follow existing light UI of the configurator panels)

## Decisions (from brainstorming)

| Decision | Choice |
|----------|--------|
| Visual direction | Soft pastel (light fill + colored border + darker text) |
| Scope | All button groups: action buttons, mode toggles, legend tiles, selected keycap ring |
| Implementation | Utility classes / CSS variables in `globals.css` (not per-button one-offs, not a Button component) |

## Architecture

### Color tokens (`:root` in `app/globals.css`)

Define pastel tokens per role, each with fill, border, and text (and optional ring for selected):

| Role | Token prefix | Hue | Used for |
|------|--------------|-----|----------|
| Primary | `--btn-primary-*` | teal | + Add key; active mode toggle |
| Secondary | `--btn-secondary-*` | pink | Remove; Swap A ↔ B |
| Danger | `--btn-danger-*` | soft red | Clear |
| Accent | `--btn-accent-*` | amber | Re-apply alternate |
| Export | `--btn-export-*` | soft blue | Download SVG / PNG |
| Selected | `--btn-selected-*` | cyan | Legend tile selected; keycap selected ring |
| Neutral (base) | `--btn-neutral-*` | soft gray | Inactive mode toggle / default `.btn` shell |

Exact hex values are chosen at implementation to match the approved pastel mockups (light fill, mid border, dark readable text). Contrast must remain readable on white panel backgrounds.

### Utility classes

| Class | Purpose |
|-------|---------|
| `.btn` | Shared shell: padding, radius, text size, neutral border/fill baseline |
| `.btn-primary` | Primary pastel fill/border/text |
| `.btn-secondary` | Secondary pastel |
| `.btn-danger` | Danger pastel |
| `.btn-accent` | Accent pastel |
| `.btn-export` | Export pastel |
| `.btn-selected` | Selected state for tiles / keycap chrome (border + fill + ring) |

Disabled state continues to use existing `disabled:opacity-*` / opacity patterns on the elements; no new disabled palette required.

## Component mapping

### `components/KeycapControls.tsx`

| Control | Classes |
|---------|---------|
| + Add key | `.btn .btn-primary` |
| Remove | `.btn .btn-secondary` |
| Clear | `.btn .btn-danger` |
| Mode toggle active | `.btn .btn-primary` |
| Mode toggle inactive | `.btn` |
| Swap A ↔ B | `.btn .btn-secondary` |
| Re-apply alternate | `.btn .btn-accent` |
| Download SVG | `.btn .btn-export` |
| Download PNG | `.btn .btn-export` |

Replace ad-hoc Tailwind color classes (`bg-neutral-900`, `bg-sky-600`, etc.) with the utility classes above. Keep layout utilities (`flex`, `mt-auto`, `text-left`, etc.) as Tailwind where needed.

### `components/LegendPicker.tsx`

Update `tileClass` so the selected state uses `.btn-selected` (or equivalent token-backed styles). Unselected tiles stay light with a soft neutral border; no strong gray/black chrome.

### `components/KeycapPreview.tsx`

Selected keycap border/ring uses the same selected cyan pastel tokens as legend tiles for visual consistency.

### Out of scope files

- `components/FilamentPicker.tsx` — swatches remain filament hex; selection ring may optionally align to `--btn-selected-*` only if trivial; do not recolor the swatch fills.
- `app/page.tsx`, `components/Configurator.tsx` — no layout changes.

## Behavior constraints

- Do not change button size, gap, or panel spacing.
- Do not change click handlers or disabled logic.
- No new hover effects beyond what already exists (or a light border darken if already present via Tailwind `hover:`).
- Configurator panels remain light (`bg-white`); pastel fills assume light backgrounds.

## Success criteria

- Action buttons are visually distinct by role without reading labels first.
- Mode toggles clearly show active vs inactive via pastel primary vs neutral.
- Legend and keycap selection use the same selected pastel language.
- All button colors are defined in `globals.css` tokens/classes, not scattered one-off hex in components.
- Existing export / add / remove / clear / re-apply flows still work unchanged.

## Implementation notes

- Prefer `@layer` or plain CSS next to existing cursor rules in `globals.css`.
- Tailwind `@theme` tokens are optional; plain CSS variables + classes are enough for this scope.
- After wiring classes, visually spot-check the controls panel and legend panel on desktop and a narrow viewport.
