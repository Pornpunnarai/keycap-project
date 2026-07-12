/**
 * Character master data — A–Z then 1–9, 0 (matches keycap legend sheet).
 * Glyph art lives in `lib/keycap-char-data.ts` (traced from the sheet).
 */
export const CHAR_LEGENDS: string[] = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  ..."1234567890".split(""),
]
