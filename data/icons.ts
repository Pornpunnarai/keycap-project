/**
 * Icon master data — cute solid silhouettes for keycap legends.
 * Ids must match entries in `lib/icon-registry.ts`.
 */
export const KEYCAP_ICONS = [
  { id: "PawPrint", name: "อุ้งเท้า" },
  { id: "Clover", name: "ใบโคลเวอร์" },
  { id: "Flower2", name: "ดอกไม้" },
  { id: "Cat", name: "แมว" },
  { id: "Cloud", name: "เมฆ" },
  { id: "Duck", name: "เป็ด" },
  { id: "Star", name: "ดาว" },
  { id: "Heart", name: "หัวใจ" },
  { id: "Moon", name: "พระจันทร์" },
  { id: "Zap", name: "สายฟ้า" },
  { id: "Ribbon", name: "โบว์" },
  { id: "Flame", name: "เปลวไฟ" },
  { id: "Coffee", name: "กาแฟ" },
  { id: "Plane", name: "เครื่องบิน" },
  { id: "Music2", name: "โน้ตเพลง" },
] as const

export type KeycapIconId = (typeof KEYCAP_ICONS)[number]["id"]

export const KEYCAP_ICON_IDS = KEYCAP_ICONS.map((icon) => icon.id)
