# Thai UI Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all user-facing English UI copy with Thai in layout and configurator components.

**Architecture:** Inline string replacements in the listed files. No i18n framework. Logic, ids, and tests stay unchanged.

**Tech Stack:** Next.js App Router, React, TypeScript

**Spec:** `docs/superpowers/specs/2026-07-11-thai-ui-copy-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `app/layout.tsx` | `lang="th"` + metadata |
| `components/Configurator.tsx` | Header + canvas chrome |
| `components/KeycapControls.tsx` | Control labels/buttons/help |
| `components/LegendPicker.tsx` | Legend panel copy + aria |
| `components/KeycapPreview.tsx` | Keycap title |

---

### Task 1: Layout metadata + document language

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update `metadata` and `lang`**

```tsx
export const metadata: Metadata = {
  title: "ตัวจัดชุดคีย์แคป",
  description: "จัดชุดคีย์แคปจากสีเส้นใยและตัวอักษรหรือไอคอน",
};

// in <html>:
<html
  lang="th"
  className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
>
```

- [ ] **Step 2: Verify**

```bash
rg -n 'lang="th"|ตัวจัดชุดคีย์แคป' app/layout.tsx
```

Expected: both match. No `lang="en"`.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "$(cat <<'EOF'
feat: set Thai document language and page metadata

EOF
)"
```

---

### Task 2: Configurator header and canvas

**Files:**
- Modify: `components/Configurator.tsx`

- [ ] **Step 1: Replace visible strings**

```tsx
<h1 className="text-xl font-semibold tracking-tight text-neutral-900 lg:text-2xl">
  ตัวจัดชุดคีย์แคป
</h1>
<p className="text-sm text-neutral-600">
  ซ้าย: สี · กลาง: แคนวาส · ขวา: ตัวอักษรและไอคอน
</p>

// canvas header:
<span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
  แคนวาส
</span>
<span className="text-xs text-neutral-500">
  {state.keycaps.length} คีย์
</span>
```

- [ ] **Step 2: Verify English chrome gone**

```bash
rg -n "Keycap configurator|Canvas|characters & icons|\\bkeys?\\b" components/Configurator.tsx
```

Expected: no user-facing English matches (comments like `{/* Left tools */}` may remain — optional to leave).

- [ ] **Step 3: Commit**

```bash
git add components/Configurator.tsx
git commit -m "$(cat <<'EOF'
feat: translate Configurator chrome to Thai

EOF
)"
```

---

### Task 3: KeycapControls

**Files:**
- Modify: `components/KeycapControls.tsx`

- [ ] **Step 1: Replace all UI strings**

| Current | New |
|---------|-----|
| `+ Add key` | `+ เพิ่มคีย์` |
| `Remove` | `ลบ` |
| `Clear` | `ล้าง` |
| `1 color` / `2 colors` | `1 สี` / `2 สี` |
| `Color A · Cap + Legend` | `สี A · ฐาน + ตัวอักษร` |
| `Color B · Lid` | `สี B · ฝา` |
| help paragraph | `3 ชั้น: ฐาน A → ฝา B → ตัวอักษร A สลับเมื่อฐานเป็น B สีต่อคีย์ถูกล็อก` |
| `Swap A ↔ B` | `สลับ A ↔ B` |
| `Re-apply alternate` | `จัดสีสลับใหม่` |
| `Cap colors follow A/B by order.` | `สีฐานเรียงตามลำดับ A/B` |
| `Selected key` | `คีย์ที่เลือก` |
| `Key color` | `สีคีย์` |
| `Download SVG` | `ดาวน์โหลด SVG` |
| `Download PNG` | `ดาวน์โหลด PNG` |

Keep handlers/classNames unchanged.

- [ ] **Step 2: Verify**

```bash
rg -n "Add key|Remove|Clear|1 color|2 colors|Download |Selected key|Re-apply|Swap A|Color A|Color B|Key color|Cap \\(base\\)" components/KeycapControls.tsx
```

Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add components/KeycapControls.tsx
git commit -m "$(cat <<'EOF'
feat: translate KeycapControls labels to Thai

EOF
)"
```

---

### Task 4: LegendPicker + KeycapPreview

**Files:**
- Modify: `components/LegendPicker.tsx`
- Modify: `components/KeycapPreview.tsx`

- [ ] **Step 1: LegendPicker strings**

```tsx
<h2 className="text-sm font-semibold text-neutral-900">ตัวอักษร/ไอคอน</h2>
<p className="mt-0.5 text-xs text-neutral-500">
  {disabled
    ? "เลือกคีย์บนแคนวาสก่อน"
    : "แตะตัวอักษรหรือไอคอนเพื่อใส่"}
</p>

// Blank section label:
ว่าง
// blank button:
title="ว่าง"
aria-label="ว่าง"

// Characters section:
ตัวอักษร
aria-label="ตัวอักษร"

// Icons section:
ไอคอน
aria-label="ไอคอน"
```

Keep `Character ${c}` aria as `ตัวอักษร ${c}` if present.

- [ ] **Step 2: KeycapPreview title**

```tsx
title="ฐาน / ฝา / ตัวอักษร"
```

- [ ] **Step 3: Verify**

```bash
rg -n "Legend|Select a key|Tap a character|Blank|Characters|Icons|Cap / Lid" components/LegendPicker.tsx components/KeycapPreview.tsx
```

Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add components/LegendPicker.tsx components/KeycapPreview.tsx
git commit -m "$(cat <<'EOF'
feat: translate LegendPicker and keycap titles to Thai

EOF
)"
```

---

### Task 5: Sanity check

- [ ] **Step 1: Run unit tests**

```bash
npm test
```

Expected: PASS (logic unchanged).

- [ ] **Step 2: Grep remaining English UI in components/layout**

```bash
rg -n "Add key|Remove|Clear|Download |Canvas|Keycap configurator|Selected key|Legend|1 color|2 colors|Select a key|Tap a character|Blank|Characters|Icons|Cap / Lid|Color A|Color B|Key color|Re-apply|Swap A" app/layout.tsx components/
```

Expected: no matches (or only non-UI comments).

- [ ] **Step 3: Spot-check in browser**

```bash
npm run dev
```

Confirm header, buttons, legend panel, and metadata tab title are Thai.

---

## Spec coverage

| Spec item | Task |
|-----------|------|
| layout lang + metadata | Task 1 |
| Configurator chrome | Task 2 |
| KeycapControls | Task 3 |
| LegendPicker + KeycapPreview | Task 4 |
| No icon name / docs changes | All tasks omit |
| Tests still pass | Task 5 |
