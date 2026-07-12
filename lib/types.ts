export type Filament = {
  id: string
  name: string
  hex: string
}

export type LegendType = "icon" | "char"

export type Keycap = {
  id: string
  colorId: string
  legendType: LegendType | null
  legendValue: string | null
}

export type ColorMode = "one" | "two"

export type CanvasOrientation = "horizontal" | "vertical"

export type SetState = {
  mode: ColorMode
  colorAId: string
  colorBId: string | null
  /** Separate legend ink; null = follow base/cap color */
  legendColorId: string | null
  orientation: CanvasOrientation
  keycaps: Keycap[]
  selectedKeycapId: string | null
}
