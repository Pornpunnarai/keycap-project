# Dimensional Keycap Preview — Design Spec

**Date:** 2026-07-11  
**Status:** Approved for planning  
**Approach:** CSS depth on preview + matching SVG gradients/filters for export

## Problem

The live preview and downloaded SVG/PNG render keycaps as flat colored rectangles. The owner wants a more dimensional product look—similar to a real keycap keychain photo—without building a full 3D/product-photography scene.

## Goals

- Make each keycap read as a physical object: rounded cap, inset lid, soft drop shadow, subtle top-left lighting.
- Apply the same depth language to on-screen preview and downloaded SVG/PNG.
- Place the set on a light wood-toned surface (CSS/SVG texture, not a photo).
- Keep existing configurator behavior: select keys, legends, 1/2-color modes, filament colors.

## Non-goals

- Keychain cord, metal clasp, acrylic charms
- Three-quarter camera angle / true 3D perspective
- Shallow depth-of-field blur
- Overlapping product-photo composition with multiple chains
- Replacing the React preview with canvas-only rendering
- Pixel-perfect parity between CSS and SVG (close match is enough)

## Decisions (from brainstorming)

| Decision | Choice |
|----------|--------|
| Scope | Preview + SVG/PNG export + light wood backdrop |
| Fidelity | Dimensional keycaps + light wood; no cord/clasp; no 3/4 angle |
| Implementation | CSS depth for preview; SVG linearGradient + filters for export |

## Visual language

Assume light from **top-left**. Soft shadow falls **bottom-right**.

### Cap (base)

- Rounded square (existing radius language ~14px UI / ~12px SVG)
- Filament color as base fill
- Subtle top edge highlight (lighter overlay or gradient)
- Soft drop shadow under the whole key

### Lid (top)

- Inset from cap edges (existing ~8px inset)
- Filament lid color as fill
- Inset / inner shadow so the lid reads recessed
- Slight darker edge on bottom-right of lid

### Legend

- Centered on lid
- Color from existing `legendHex` / contrast rules (unchanged)

### Surface

- Light warm wood tone behind the key grid
- Soft grain via CSS repeating gradient or SVG pattern (not a photographic image)
- Preview canvas and export background should feel like the same surface family

### Selection chrome

- Keep pastel selected ring/border from the button-color work
- Depth styles must not hide selection affordance

## Architecture

### Preview (`components/KeycapPreview.tsx` + optional CSS)

Enhance each keycap button:

- Cap: `background` filament + light linear-gradient highlight; layered `box-shadow` for drop shadow
- Lid: keep inset layout; add `box-shadow: inset ...` for recessed look
- Outer preview area: wood-toned background (either on the preview wrapper in `Configurator` or a dedicated wrapper around `KeycapPreview`)

Prefer CSS variables for shared shadow/highlight strengths so values stay tunable in one place (`globals.css` or a small set of preview-specific vars).

### Export (`lib/svg.ts`)

Mirror the look in SVG:

- Shared defs: wood pattern/gradient, soft drop-shadow filter, optional cap highlight gradient
- Cap rect: fill = filament (optionally with overlay highlight rect / gradient fill)
- Lid rect: fill = filament + darker stroke or inset-like overlay
- Background rect with wood pattern behind keys
- Preserve existing layout math (KEY, GAP, PAD, radii, insets) unless a small pad increase is needed for shadows not to clip

PNG export continues to rasterize the SVG; improving SVG improves PNG automatically.

### Tests

Update `lib/svg.test.ts` (and any related tests) so assertions still validate:

- Cap/lid/legend color rules
- Structure still includes cap + lid geometry

Avoid brittle assertions on exact filter markup where possible; assert presence of background / shadow defs or stable color fills.

## Behavior constraints

- Color resolution (`resolveKeycapLayers`, filament master list) unchanged
- Click-to-select, legend picker, mode toggles, add/remove/clear unchanged
- Disabled/export empty-set behavior unchanged
- No new product entities (cords, hardware)

## Success criteria

- On screen, keycaps clearly look raised/inset vs the previous flat tiles
- Wood surface is visible behind the set in preview and downloads
- SVG/PNG downloads show comparable depth (shadow + inset lid + highlight)
- Existing unit tests pass after updates
- Selection ring remains visible on the selected key

## Implementation notes

- Keep depth effects subtle so filament colors stay recognizable
- Watch very light filaments: highlights/shadows must still read without washing out the lid
- If SVG filters make files large or slow, prefer simple gradients + one soft shadow filter
- Coordinate preview CSS and SVG so light direction matches (top-left)
