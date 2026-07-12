import type { ReactNode } from "react"
import {
  KEYCAP_ICON_COMPONENTS,
  type KeycapIconProps,
} from "@/lib/keycap-icons"

export type KeycapIconComponent = (props: KeycapIconProps) => ReactNode

/** Maps master icon ids to solid silhouette components. Keep in sync with `data/icons.ts`. */
export const ICON_COMPONENTS = KEYCAP_ICON_COMPONENTS

export function getIconComponent(id: string): KeycapIconComponent | undefined {
  return ICON_COMPONENTS[id]
}
