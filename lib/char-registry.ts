import { KEYCAP_CHAR_DATA_URI } from "@/lib/keycap-char-data"
import { makeMaskGlyph, type MaskGlyphProps } from "@/lib/mask-glyph"
import type { ReactNode } from "react"

export type KeycapCharProps = MaskGlyphProps
export type KeycapCharComponent = (props: MaskGlyphProps) => ReactNode

/** Character glyphs traced from the product legend sheet (PNG masks). */
export const KEYCAP_CHAR_COMPONENTS: Record<string, KeycapCharComponent> =
  Object.fromEntries(
    Object.entries(KEYCAP_CHAR_DATA_URI).map(([id, src]) => [
      id,
      makeMaskGlyph(src),
    ]),
  )

export function getCharComponent(char: string): KeycapCharComponent | undefined {
  return KEYCAP_CHAR_COMPONENTS[char]
}

export function getCharDataUri(char: string): string | undefined {
  return KEYCAP_CHAR_DATA_URI[char]
}
