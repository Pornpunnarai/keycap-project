/**
 * Icon master data — edit this list to control which Lucide icons users can pick.
 * Names must match Lucide React export names registered in `lib/icon-registry.ts`.
 */
export const KEYCAP_ICONS = [
  { id: "ArrowUp", name: "Arrow Up" },
  { id: "ArrowDown", name: "Arrow Down" },
  { id: "ArrowLeft", name: "Arrow Left" },
  { id: "ArrowRight", name: "Arrow Right" },
  { id: "ChevronUp", name: "Chevron Up" },
  { id: "ChevronDown", name: "Chevron Down" },
  { id: "ChevronLeft", name: "Chevron Left" },
  { id: "ChevronRight", name: "Chevron Right" },
  { id: "CornerDownLeft", name: "Enter" },
  { id: "Delete", name: "Delete" },
  { id: "Eraser", name: "Eraser" },
  { id: "Space", name: "Space" },
  { id: "Command", name: "Command" },
  { id: "Option", name: "Option" },
  { id: "Play", name: "Play" },
  { id: "Pause", name: "Pause" },
  { id: "SkipBack", name: "Skip Back" },
  { id: "SkipForward", name: "Skip Forward" },
  { id: "Volume2", name: "Volume" },
  { id: "VolumeX", name: "Mute" },
  { id: "Mic", name: "Mic" },
  { id: "MicOff", name: "Mic Off" },
  { id: "Sun", name: "Sun" },
  { id: "Moon", name: "Moon" },
  { id: "Power", name: "Power" },
  { id: "Home", name: "Home" },
  { id: "Search", name: "Search" },
  { id: "Settings", name: "Settings" },
  { id: "Menu", name: "Menu" },
  { id: "Plus", name: "Plus" },
  { id: "Minus", name: "Minus" },
  { id: "X", name: "X" },
  { id: "Check", name: "Check" },
  { id: "Star", name: "Star" },
  { id: "Heart", name: "Heart" },
  { id: "Music", name: "Music" },
  { id: "Camera", name: "Camera" },
  { id: "Bluetooth", name: "Bluetooth" },
  { id: "Wifi", name: "Wifi" },
  { id: "Battery", name: "Battery" },
] as const

export type KeycapIconId = (typeof KEYCAP_ICONS)[number]["id"]

export const KEYCAP_ICON_IDS = KEYCAP_ICONS.map((icon) => icon.id)
