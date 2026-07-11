# Thai UI Copy — Design Spec

**Date:** 2026-07-11  
**Status:** Approved for planning  
**Approach:** Replace English user-facing strings inline in components (no i18n framework)

## Problem

The configurator UI is mostly English while filament names are already Thai. The owner wants the on-screen experience fully in Thai.

## Goals

- Translate all user-visible UI copy to Thai: titles, helpers, buttons, labels, canvas chrome, aria-labels/titles, page metadata.
- Set document language to Thai (`lang="th"`).

## Non-goals

- Icon display names in `data/icons.ts`
- Docs / specs / plans
- English unit test descriptions
- Code identifiers, filament ids, file download basenames (unless visible as UI labels)
- i18n framework or bilingual toggle

## Scope (files)

| File | Changes |
|------|---------|
| `app/layout.tsx` | `lang="th"`, Thai `title` / `description` |
| `components/Configurator.tsx` | Header, canvas label, key count |
| `components/KeycapControls.tsx` | All buttons, mode labels, filament labels, help text |
| `components/LegendPicker.tsx` | Section titles, helpers, aria/title for blank/characters/icons |
| `components/KeycapPreview.tsx` | Keycap `title` |

`data/filaments.ts` already Thai — no change required.

## Suggested copy map

| English | Thai |
|---------|------|
| Keycap Configurator | ตัวจัดชุดคีย์แคป |
| Left: colors · Center: canvas · Right: characters & icons | ซ้าย: สี · กลาง: แคนวาส · ขวา: ตัวอักษรและไอคอน |
| Canvas | แคนวาส |
| N key / N keys | N คีย์ |
| + Add key | + เพิ่มคีย์ |
| Remove | ลบ |
| Clear | ล้าง |
| 1 color / 2 colors | 1 สี / 2 สี |
| Color A · Cap + Legend | สี A · ฐาน + ตัวอักษร |
| Color B · Lid | สี B · ฝา |
| 3 layers help text | 3 ชั้น: ฐาน A → ฝา B → ตัวอักษร A สลับเมื่อฐานเป็น B สีต่อคีย์ถูกล็อก |
| Swap A ↔ B | สลับ A ↔ B |
| Re-apply alternate | จัดสีสลับใหม่ |
| Cap colors follow A/B by order. | สีฐานเรียงตามลำดับ A/B |
| Selected key | คีย์ที่เลือก |
| Key color | สีคีย์ |
| Download SVG / PNG | ดาวน์โหลด SVG / PNG |
| Legend | ตัวอักษร/ไอคอน |
| Select a key on the canvas first | เลือกคีย์บนแคนวาสก่อน |
| Tap a character or icon to apply | แตะตัวอักษรหรือไอคอนเพื่อใส่ |
| Blank | ว่าง |
| Characters / Icons | ตัวอักษร / ไอคอน |
| Cap / Lid / Legend (title) | ฐาน / ฝา / ตัวอักษร |

Metadata description: อธิบายสั้นๆ ว่าใช้จัดชุดคีย์แคปจากสีเส้นใยและตัวอักษร/ไอคอน

## Success criteria

- No English UI labels remain in the listed components/layout for normal use.
- App still behaves identically; only copy and `lang` change.
- Existing unit tests continue to pass (logic unchanged).

## Implementation notes

- Keep SVG/PNG format names as “SVG” / “PNG” (standard abbreviations).
- Prefer natural Thai product wording over literal word-for-word translation.
