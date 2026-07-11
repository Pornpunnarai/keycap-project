# Dimensional Keycap Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make keycaps look dimensional (cap highlight, inset lid, soft drop shadow) on a light wood surface in both the on-screen preview and SVG/PNG exports.

**Architecture:** Add shared CSS variables for depth lighting. Enhance `KeycapPreview` with layered shadows/gradients and swap the canvas checkerboard for a wood-tone surface. Update `buildSetSvg` with matching SVG defs (wood pattern, soft shadow filter, cap highlight) so PNG export inherits the same look. Keep color/legend logic unchanged.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, SVG string builder, Vitest

**Spec:** `docs/superpowers/specs/2026-07-11-dimensional-keycap-preview-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `app/globals.css` | Depth/wood CSS variables + optional `.keycap-*` helpers |
| `components/KeycapPreview.tsx` | Dimensional cap/lid chrome |
| `components/Configurator.tsx` | Canvas wood surface behind preview |
| `lib/svg.ts` | SVG defs + dimensional key markup + wood background |
| `lib/svg.test.ts` | Assert depth defs + colors still resolve correctly |

---

### Task 1: Failing SVG tests for depth defs

**Files:**
- Modify: `lib/svg.test.ts`

- [ ] **Step 1: Add failing assertions for dimensional SVG features**

Append a new test (keep existing tests intact):

```ts
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
```

- [ ] **Step 2: Run the new test and confirm it fails**

```bash
npm test -- lib/svg.test.ts
```

Expected: FAIL — missing `id="wood"` / shadow defs in current SVG.

- [ ] **Step 3: Commit the failing test**

```bash
git add lib/svg.test.ts
git commit -m "$(cat <<'EOF'
test: require dimensional SVG defs for keycap export

EOF
)"
```

---

### Task 2: Implement dimensional SVG export

**Files:**
- Modify: `lib/svg.ts`

- [ ] **Step 1: Replace `buildSetSvg` with dimensional markup**

Keep existing constants (`KEY`, `GAP`, `PAD`, radii, insets) and helpers. Increase outer SVG size slightly if needed so shadows are not clipped — prefer keeping `PAD = 16` first; only bump if shadows clip in visual check.

Replace the body of `buildSetSvg` so the returned SVG includes defs + wood background + shadowed keys:

```ts
export function buildSetSvg(
  keycaps: Keycap[],
  options: SvgSetOptions,
): string {
  const cols = Math.max(1, Math.min(8, keycaps.length || 1))
  const rows = Math.max(1, Math.ceil((keycaps.length || 1) / cols))
  const width = PAD * 2 + cols * KEY + (cols - 1) * GAP
  const height = PAD * 2 + rows * KEY + (rows - 1) * GAP

  const defs = `<defs>
  <pattern id="wood" patternUnits="userSpaceOnUse" width="48" height="48">
    <rect width="48" height="48" fill="#e8dcc8"/>
    <path d="M0 8h48M0 20h48M0 32h48M0 44h48" stroke="#d4c4a8" stroke-width="1.2" opacity="0.55"/>
    <path d="M0 14h48M0 26h48M0 38h48" stroke="#cbb892" stroke-width="0.6" opacity="0.35"/>
  </pattern>
  <linearGradient id="capHighlight" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
    <stop offset="45%" stop-color="#ffffff" stop-opacity="0"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
  </linearGradient>
  <filter id="keyShadow" x="-20%" y="-15%" width="140%" height="150%">
    <feDropShadow dx="2" dy="3" stdDeviation="2.2" flood-color="#000000" flood-opacity="0.28"/>
  </filter>
</defs>`

  const bodies = keycaps
    .map((key, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = PAD + col * (KEY + GAP)
      const y = PAD + row * (KEY + GAP)
      const layers = resolveKeycapLayers(
        options.mode,
        key.colorId,
        options.colorAId,
        options.colorBId,
      )
      const lidX = x + LID_INSET
      const lidY = y + LID_INSET
      const lidSize = KEY - LID_INSET * 2
      const cx = x + KEY / 2
      const cy = y + KEY / 2
      return `<g filter="url(#keyShadow)">
  <rect x="${x}" y="${y}" width="${KEY}" height="${KEY}" rx="${CAP_RADIUS}" fill="${layers.capHex}"/>
  <rect x="${x}" y="${y}" width="${KEY}" height="${KEY}" rx="${CAP_RADIUS}" fill="url(#capHighlight)"/>
  <rect x="${lidX}" y="${lidY}" width="${lidSize}" height="${lidSize}" rx="${LID_RADIUS}" fill="${layers.lidHex}" stroke="#00000022" stroke-width="1"/>
  <rect x="${lidX}" y="${lidY}" width="${lidSize}" height="${lidSize}" rx="${LID_RADIUS}" fill="#000000" opacity="0.08"/>
  ${legendMarkup(key, cx, cy, layers.legendHex)}
</g>`
    })
    .join("\n")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${defs}
<rect width="${width}" height="${height}" fill="url(#wood)"/>
${bodies}
</svg>`
}
```

Notes:
- Cap solid fill remains `layers.capHex` so color assertions still pass.
- Highlight overlay uses `capHighlight` gradient (top-left light feel via top→bottom white-to-dark).
- Lid gets a very light dark overlay rect for recessed feel; keep legend after overlays so text stays readable. If the dark overlay washes legend, remove the full-lid dark overlay and instead use only a darker bottom stroke (`stroke="#00000033"`).

- [ ] **Step 2: Run SVG tests**

```bash
npm test -- lib/svg.test.ts
```

Expected: all PASS (including new depth defs test and existing color tests).

If color tests fail because overlay rects confuse fill matching, keep solid `fill="${layers.capHex}"` / `fill="${layers.lidHex}"` on the primary rects (as above) — overlays use separate fills (`url(#capHighlight)` / `#000000`).

- [ ] **Step 3: Run full suite**

```bash
npm test
```

Expected: 25+ tests PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/svg.ts lib/svg.test.ts
git commit -m "$(cat <<'EOF'
feat: add wood surface and depth effects to SVG export

EOF
)"
```

---

### Task 3: CSS depth tokens + dimensional KeycapPreview

**Files:**
- Modify: `app/globals.css`
- Modify: `components/KeycapPreview.tsx`

- [ ] **Step 1: Add depth CSS variables and helpers to `app/globals.css`**

Append after existing button utilities (do not remove pastel button tokens):

```css
:root {
  --keycap-shadow: 2px 4px 10px rgba(0, 0, 0, 0.22),
    0 1px 2px rgba(0, 0, 0, 0.12);
  --keycap-highlight: linear-gradient(
    160deg,
    rgba(255, 255, 255, 0.34) 0%,
    rgba(255, 255, 255, 0.08) 38%,
    rgba(0, 0, 0, 0.08) 100%
  );
  --keycap-lid-inset: inset 0 2px 4px rgba(0, 0, 0, 0.18),
    inset 0 -1px 2px rgba(255, 255, 255, 0.18);
  --wood-base: #e8dcc8;
  --wood-grain-a: #d4c4a8;
  --wood-grain-b: #cbb892;
}

.keycap-shell {
  box-shadow: var(--keycap-shadow);
  isolation: isolate;
}

.keycap-shell::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--keycap-highlight);
  pointer-events: none;
  z-index: 1;
}

.keycap-lid {
  box-shadow: var(--keycap-lid-inset);
  z-index: 2;
}

.keycap-legend {
  position: relative;
  z-index: 3;
}

.wood-surface {
  background-color: var(--wood-base);
  background-image:
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 11px,
      var(--wood-grain-a) 11px,
      var(--wood-grain-a) 12px
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 7px,
      color-mix(in srgb, var(--wood-grain-b) 40%, transparent) 7px,
      color-mix(in srgb, var(--wood-grain-b) 40%, transparent) 8px
    );
}
```

If `:root` merge is cleaner, fold the new vars into the existing `:root` block instead of a second one.

- [ ] **Step 2: Update `KeycapPreview` to use depth classes**

Replace the keycap button/lid markup classes while keeping handlers and layer colors:

```tsx
          <button
            key={key.id}
            type="button"
            onClick={() => onSelect(key.id)}
            className={`keycap-shell relative flex h-[72px] w-[72px] items-center justify-center rounded-[14px] ${
              selected
                ? "border-2 border-[var(--btn-selected-border)] ring-2 ring-[var(--btn-selected-ring)]"
                : "border-2 border-black/10"
            }`}
            style={{ backgroundColor: layers.capHex }}
            aria-pressed={selected}
            title="Cap / Lid / Legend"
          >
            <span
              className="keycap-lid absolute inset-[8px] flex items-center justify-center rounded-[10px] border border-black/10"
              style={{ backgroundColor: layers.lidHex }}
            >
              <span className="keycap-legend">
                <LegendView keycap={key} ink={layers.legendHex} />
              </span>
            </span>
          </button>
```

Remove the old flat `shadow-sm` / `shadow-inner` that conflict with the new depth classes.

- [ ] **Step 3: Spot-check classes exist**

```bash
rg -n "keycap-shell|keycap-lid|wood-surface|--keycap-shadow" app/globals.css components/KeycapPreview.tsx
```

Expected: matches in both files for shell/lid/shadow; wood class may only be in CSS until Task 4.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css components/KeycapPreview.tsx
git commit -m "$(cat <<'EOF'
feat: add dimensional CSS chrome to keycap preview

EOF
)"
```

---

### Task 4: Wood surface on the canvas

**Files:**
- Modify: `components/Configurator.tsx`

- [ ] **Step 1: Swap checkerboard canvas background for `.wood-surface`**

In `Configurator.tsx`, change the center `<section>` className from the long checkerboard `bg-[linear-gradient...]` utilities to use wood:

From (current):

```tsx
<section className="flex min-h-[280px] min-w-0 flex-1 flex-col rounded-xl border border-neutral-200 bg-[linear-gradient(45deg,#f4f4f5_25%,transparent_25%),linear-gradient(-45deg,#f4f4f5_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f4f4f5_75%),linear-gradient(-45deg,transparent_75%,#f4f4f5_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] p-4 lg:overflow-auto">
```

To:

```tsx
<section className="wood-surface flex min-h-[280px] min-w-0 flex-1 flex-col rounded-xl border border-neutral-200 p-4 lg:overflow-auto">
```

Keep header labels and `KeycapPreview` wiring unchanged.

- [ ] **Step 2: Verify**

```bash
rg -n "wood-surface|linear-gradient\\(45deg,#f4f4f5" components/Configurator.tsx
```

Expected: `wood-surface` present; old checkerboard gradient gone.

- [ ] **Step 3: Commit**

```bash
git add components/Configurator.tsx
git commit -m "$(cat <<'EOF'
feat: use wood surface behind keycap canvas

EOF
)"
```

---

### Task 5: Visual verification

**Files:**
- Verify only (fix only if needed)

- [ ] **Step 1: Run full tests**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 2: Run the app and spot-check**

```bash
npm run dev
```

Open http://localhost:3000 and verify:

1. Canvas background looks like light wood (not gray checkerboard).
2. Keycaps have soft drop shadow + top highlight + inset lid.
3. Filament colors still recognizable (especially white/cream/yellow).
4. Selected key ring still visible.
5. Download SVG/PNG shows wood + shadows comparable to preview.
6. 1-color and 2-color modes still correct (cap/lid/legend).

- [ ] **Step 3: Commit fixes only if Step 2 required polish**

```bash
git add app/globals.css components/KeycapPreview.tsx components/Configurator.tsx lib/svg.ts
git commit -m "$(cat <<'EOF'
fix: polish dimensional keycap contrast after visual check

EOF
)"
```

If no fixes: no extra commit.

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Cap highlight + drop shadow | Tasks 2–3 |
| Inset lid | Tasks 2–3 |
| Legend unchanged color rules | Tasks 2–3 (no color logic change) |
| Light wood surface preview + export | Tasks 2, 4 |
| Selection chrome preserved | Task 3 |
| SVG/PNG depth via SVG (PNG inherits) | Task 2 |
| No cord/clasp/3D camera | All tasks (omitted) |
| Tests updated | Tasks 1–2, 5 |

---

## Self-review notes

- No TBD placeholders; concrete CSS vars, SVG defs, and class names provided.
- Light direction top→bottom / top-left consistent between CSS gradient and SVG gradient.
- Existing `resolveFilamentHex`-based color tests remain valid because solid filament fills stay on primary rects.
