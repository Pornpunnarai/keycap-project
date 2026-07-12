import { KEYCAP_ICON_DATA_URI } from "@/lib/keycap-icon-data"
import { makeMaskGlyph, type MaskGlyphProps } from "@/lib/mask-glyph"
import type { ReactNode } from "react"

export type KeycapIconProps = MaskGlyphProps

/** Icons traced from the product legend sheet (PNG masks). */
export const KEYCAP_ICON_COMPONENTS: Record<
  string,
  (props: MaskGlyphProps) => ReactNode
> = Object.fromEntries(
  Object.entries(KEYCAP_ICON_DATA_URI).map(([id, src]) => [
    id,
    makeMaskGlyph(src),
  ]),
)
