"use client"

import type { LucideIcon } from "lucide-react"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Battery,
  Eraser,
  Bluetooth,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Command,
  CornerDownLeft,
  Delete,
  Heart,
  Home,
  Menu,
  Mic,
  MicOff,
  Minus,
  Moon,
  Music,
  Option,
  Pause,
  Play,
  Plus,
  Power,
  Search,
  Settings,
  SkipBack,
  SkipForward,
  Space,
  Star,
  Sun,
  Volume2,
  VolumeX,
  Wifi,
  X,
} from "lucide-react"
import { legendInkForHex } from "@/lib/colors"
import { resolveFilamentHex } from "@/lib/filaments"
import type { Keycap } from "@/lib/types"

const ICONS: Record<string, LucideIcon> = {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
  Delete,
  Eraser,
  Space,
  Command,
  Option,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sun,
  Moon,
  Power,
  Home,
  Search,
  Settings,
  Menu,
  Plus,
  Minus,
  X,
  Check,
  Star,
  Heart,
  Music,
  Camera,
  Bluetooth,
  Wifi,
  Battery,
}

type Props = {
  keycaps: Keycap[]
  selectedKeycapId: string | null
  onSelect: (id: string) => void
}

function LegendView({ keycap, ink }: { keycap: Keycap; ink: string }) {
  if (!keycap.legendType || !keycap.legendValue) return null
  if (keycap.legendType === "char") {
    return (
      <span className="text-2xl font-bold" style={{ color: ink }}>
        {keycap.legendValue}
      </span>
    )
  }
  const Icon = ICONS[keycap.legendValue]
  if (!Icon) {
    return (
      <span className="text-[10px]" style={{ color: ink }}>
        {keycap.legendValue}
      </span>
    )
  }
  return <Icon size={28} color={ink} strokeWidth={2.25} />
}

export function KeycapPreview({
  keycaps,
  selectedKeycapId,
  onSelect,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      {keycaps.map((key) => {
        const fill = resolveFilamentHex(key.colorId)
        const ink = legendInkForHex(fill)
        const selected = key.id === selectedKeycapId
        return (
          <button
            key={key.id}
            type="button"
            onClick={() => onSelect(key.id)}
            className={`flex h-16 w-16 items-center justify-center rounded-xl border-2 shadow-sm ${
              selected ? "border-sky-500 ring-2 ring-sky-200" : "border-black/10"
            }`}
            style={{ backgroundColor: fill }}
            aria-pressed={selected}
          >
            <LegendView keycap={key} ink={ink} />
          </button>
        )
      })}
    </div>
  )
}
