# Pastel Button Colors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every configurator button group easier to scan by applying soft pastel utility classes backed by CSS variables in `globals.css`.

**Architecture:** Define role-based color tokens and `.btn` / `.btn-*` / `.btn-selected` classes in `app/globals.css`. Replace ad-hoc Tailwind color classes in `KeycapControls`, `LegendPicker`, and `KeycapPreview` with those utilities. No React Button component; filament swatches unchanged.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS v4, plain CSS variables

**Spec:** `docs/superpowers/specs/2026-07-11-pastel-button-colors-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `app/globals.css` | Pastel tokens + `.btn` utility classes |
| `components/KeycapControls.tsx` | Action buttons + mode toggles use `.btn-*` |
| `components/LegendPicker.tsx` | Legend tiles use `.btn-selected` when selected |
| `components/KeycapPreview.tsx` | Selected keycap ring uses selected tokens |
| `components/FilamentPicker.tsx` | **Do not modify** |

---

### Task 1: Add pastel tokens and button utility classes

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Append tokens and utility classes to `app/globals.css`**

Keep existing `:root` background/foreground, `@theme`, body, and cursor rules. Add the following after the cursor rules (merge into existing `:root` by extending it, or add a second `:root` block — either is fine; prefer extending the existing `:root`):

```css
:root {
  --background: #ffffff;
  --foreground: #171717;

  --btn-neutral-fill: #ffffff;
  --btn-neutral-border: #e2e8f0;
  --btn-neutral-text: #334155;

  --btn-primary-fill: #ccfbf1;
  --btn-primary-border: #5eead4;
  --btn-primary-text: #0f766e;

  --btn-secondary-fill: #fce7f3;
  --btn-secondary-border: #f9a8d4;
  --btn-secondary-text: #9d174d;

  --btn-danger-fill: #fee2e2;
  --btn-danger-border: #fca5a5;
  --btn-danger-text: #991b1b;

  --btn-accent-fill: #fef3c7;
  --btn-accent-border: #fcd34d;
  --btn-accent-text: #92400e;

  --btn-export-fill: #dbeafe;
  --btn-export-border: #93c5fd;
  --btn-export-text: #1e40af;

  --btn-selected-fill: #ecfeff;
  --btn-selected-border: #22d3ee;
  --btn-selected-ring: #a5f3fc;
}

.btn {
  border-radius: 0.25rem;
  border: 1.5px solid var(--btn-neutral-border);
  background: var(--btn-neutral-fill);
  color: var(--btn-neutral-text);
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.btn-primary {
  border-color: var(--btn-primary-border);
  background: var(--btn-primary-fill);
  color: var(--btn-primary-text);
  font-weight: 600;
}

.btn-secondary {
  border-color: var(--btn-secondary-border);
  background: var(--btn-secondary-fill);
  color: var(--btn-secondary-text);
  font-weight: 600;
}

.btn-danger {
  border-color: var(--btn-danger-border);
  background: var(--btn-danger-fill);
  color: var(--btn-danger-text);
  font-weight: 600;
}

.btn-accent {
  border-color: var(--btn-accent-border);
  background: var(--btn-accent-fill);
  color: var(--btn-accent-text);
  font-weight: 600;
}

.btn-export {
  border-color: var(--btn-export-border);
  background: var(--btn-export-fill);
  color: var(--btn-export-text);
  font-weight: 600;
}

.btn-selected {
  border: 2px solid var(--btn-selected-border);
  background: var(--btn-selected-fill);
  box-shadow: 0 0 0 2px var(--btn-selected-ring);
}
```

Do not remove the existing cursor pointer/disabled rules.

- [ ] **Step 2: Verify classes exist in the file**

Run:

```bash
rg -n "btn-primary|btn-selected|--btn-export-fill" app/globals.css
```

Expected: matches for tokens and class names.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "$(cat <<'EOF'
feat: add pastel button CSS tokens and utilities

EOF
)"
```

---

### Task 2: Wire KeycapControls action and mode buttons

**Files:**
- Modify: `components/KeycapControls.tsx`

- [ ] **Step 1: Replace button color classes with `.btn` utilities**

In `components/KeycapControls.tsx`, update each button’s `className` as follows (keep handlers, disabled logic, and non-color layout classes):

**+ Add key**

```tsx
<button
  type="button"
  className="btn btn-primary"
  onClick={onAdd}
>
  + Add key
</button>
```

**Remove**

```tsx
<button
  type="button"
  className="btn btn-secondary disabled:opacity-40"
  onClick={onRemove}
  disabled={state.keycaps.length <= 1}
>
  Remove
</button>
```

**Clear**

```tsx
<button
  type="button"
  className="btn btn-danger"
  onClick={onClear}
>
  Clear
</button>
```

**Mode toggles** (`1 color` / `2 colors`)

```tsx
{(["one", "two"] as ColorMode[]).map((mode) => (
  <button
    key={mode}
    type="button"
    className={`btn ${state.mode === mode ? "btn-primary" : ""}`}
    onClick={() => setMode(mode)}
  >
    {mode === "one" ? "1 color" : "2 colors"}
  </button>
))}
```

**Swap A ↔ B**

```tsx
<button
  type="button"
  className="btn btn-secondary disabled:opacity-40"
  disabled={state.mode !== "two" || !state.colorBId}
  onClick={() => {
    if (!state.colorBId) return
    setState((s) => {
      if (!s.colorBId) return s
      const colorAId = s.colorBId
      const colorBId = s.colorAId
      return {
        ...s,
        colorAId,
        colorBId,
        keycaps: reapplyAlternateColors(s.keycaps, colorAId, colorBId),
      }
    })
  }}
>
  Swap A ↔ B
</button>
```

**Re-apply alternate** (keep nested helper text; use accent pastel)

```tsx
<button
  type="button"
  className="btn btn-accent text-left disabled:opacity-40"
  disabled={!canReapply}
  onClick={() => {
    if (!state.colorBId) return
    setState((s) => ({
      ...s,
      keycaps: reapplyAlternateColors(s.keycaps, s.colorAId, s.colorBId!),
    }))
  }}
>
  Re-apply alternate
  <span className="mt-0.5 block text-xs font-normal opacity-80">
    Cap colors follow A/B by order.
  </span>
</button>
```

**Download SVG / PNG**

```tsx
<button
  type="button"
  className="btn btn-export disabled:opacity-40"
  disabled={!canExport}
  onClick={() => downloadSetSvg(state.keycaps, exportOptions)}
>
  Download SVG
</button>
<button
  type="button"
  className="btn btn-export disabled:opacity-40"
  disabled={!canExport}
  onClick={() => void downloadSetPng(state.keycaps, exportOptions)}
>
  Download PNG
</button>
```

Remove old color utilities such as `bg-neutral-900`, `text-white`, `border-neutral-300`, `bg-sky-600`, `border-red-300`, `bg-red-50`, `border-amber-500`, `bg-amber-50` from these buttons.

- [ ] **Step 2: Confirm old solid/neutral button colors are gone from this file**

Run:

```bash
rg -n "bg-neutral-900|bg-sky-600|bg-red-50|bg-amber-50" components/KeycapControls.tsx
```

Expected: no matches.

Also run:

```bash
rg -n "btn btn-primary|btn-secondary|btn-danger|btn-accent|btn-export" components/KeycapControls.tsx
```

Expected: matches for each role.

- [ ] **Step 3: Run unit tests (sanity — no logic change expected)**

```bash
npm test
```

Expected: all existing tests PASS.

- [ ] **Step 4: Commit**

```bash
git add components/KeycapControls.tsx
git commit -m "$(cat <<'EOF'
feat: apply pastel button utilities in KeycapControls

EOF
)"
```

---

### Task 3: Wire LegendPicker selected tiles

**Files:**
- Modify: `components/LegendPicker.tsx`

- [ ] **Step 1: Update `tileClass` to use pastel selected styles**

Replace the current `tileClass` helper with:

```tsx
const tileClass = (selected: boolean, disabled?: boolean) =>
  `flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
    selected
      ? "btn-selected"
      : "border-2 border-black/10 bg-white hover:border-black/25"
  } ${disabled ? "pointer-events-none opacity-40" : ""}`
```

Keep blank / character / icon button markup and handlers unchanged. Unselected tiles stay light with soft neutral border; selected tiles get cyan pastel via `.btn-selected`.

- [ ] **Step 2: Confirm sky selection styles are removed from tiles**

Run:

```bash
rg -n "border-sky-500|bg-sky-50|ring-sky-200" components/LegendPicker.tsx
```

Expected: no matches.

Run:

```bash
rg -n "btn-selected" components/LegendPicker.tsx
```

Expected: at least one match inside `tileClass`.

- [ ] **Step 3: Commit**

```bash
git add components/LegendPicker.tsx
git commit -m "$(cat <<'EOF'
feat: use pastel selected style on legend tiles

EOF
)"
```

---

### Task 4: Wire KeycapPreview selected ring

**Files:**
- Modify: `components/KeycapPreview.tsx`

- [ ] **Step 1: Apply `.btn-selected` for selected keycap chrome**

Update the keycap `<button>` `className` so selected state uses the shared selected utility, while unselected keeps a soft border. Cap fill remains inline `style={{ backgroundColor: layers.capHex }}`.

Replace the selected/unselected class branch with:

```tsx
<button
  key={key.id}
  type="button"
  onClick={() => onSelect(key.id)}
  className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-[14px] shadow-sm ${
    selected ? "btn-selected" : "border-2 border-black/10"
  }`}
  style={{ backgroundColor: layers.capHex }}
  aria-pressed={selected}
  title="Cap / Lid / Legend"
>
```

Note: `.btn-selected` sets its own `border` and `background`. The inline `backgroundColor` for the cap hex will override the pastel fill (inline style wins), which is correct — we only want the cyan border/ring from `.btn-selected`, while the keycap face stays the filament color.

If the pastel fill from `.btn-selected` fights readability, prefer a dedicated selected-chrome approach that only applies border + ring. In that case, instead of `btn-selected` on the keycap button, use token-backed classes without fill:

```tsx
className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-[14px] shadow-sm ${
  selected
    ? "border-2 border-[var(--btn-selected-border)] ring-2 ring-[var(--btn-selected-ring)]"
    : "border-2 border-black/10"
}`}
```

Prefer this token-only border/ring variant for `KeycapPreview` so the filament cap color is never covered by pastel fill.

- [ ] **Step 2: Confirm sky selection styles are removed**

Run:

```bash
rg -n "border-sky-500|ring-sky-200" components/KeycapPreview.tsx
```

Expected: no matches.

Run:

```bash
rg -n "btn-selected-border|btn-selected" components/KeycapPreview.tsx
```

Expected: selected state references selected tokens or class.

- [ ] **Step 3: Commit**

```bash
git add components/KeycapPreview.tsx
git commit -m "$(cat <<'EOF'
feat: align keycap selection ring with pastel tokens

EOF
)"
```

---

### Task 5: Visual verification and final sanity check

**Files:**
- Verify only (no code unless a bug is found)

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: PASS (logic unchanged).

- [ ] **Step 2: Confirm FilamentPicker was not modified**

```bash
git diff --name-only HEAD~5..HEAD
```

(or inspect the branch commits) — `components/FilamentPicker.tsx` must not appear.

Also:

```bash
rg -n "btn-" components/FilamentPicker.tsx
```

Expected: no matches (file untouched).

- [ ] **Step 3: Spot-check in the browser**

```bash
npm run dev
```

Open the app and verify:

1. Add / Remove / Clear / Swap / Re-apply / Download show distinct pastel roles.
2. Active mode toggle is teal primary; inactive is neutral.
3. Selected legend tile has cyan pastel border/ring.
4. Selected keycap has cyan border/ring; cap face still shows filament color.
5. Disabled buttons still look disabled (opacity).
6. Desktop and a narrow viewport both look readable.

- [ ] **Step 4: Commit only if Step 3 required small fixes; otherwise done**

If fixes were needed:

```bash
git add app/globals.css components/KeycapControls.tsx components/LegendPicker.tsx components/KeycapPreview.tsx
git commit -m "$(cat <<'EOF'
fix: polish pastel button contrast after visual check

EOF
)"
```

If no fixes: no extra commit.

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Soft pastel direction (fill + border + text) | Task 1 |
| CSS variables + utility classes in `globals.css` | Task 1 |
| Action buttons mapped by role | Task 2 |
| Mode toggles primary/neutral | Task 2 |
| Legend tiles selected pastel | Task 3 |
| Keycap selected ring aligned | Task 4 |
| FilamentPicker unchanged | Task 5 verify |
| No layout/size/behavior changes | Tasks 2–4 keep handlers & sizing |
| Disabled opacity preserved | Task 2 `disabled:opacity-40` |

---

## Self-review notes

- No TBD/placeholder steps; hex values and class names are explicit.
- KeycapPreview uses token border/ring (not fill) so filament color remains visible — matches success criteria.
- Class names (`btn-primary`, tokens `--btn-*`) are consistent across tasks.
