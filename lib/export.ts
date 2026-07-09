import { buildSetSvg } from "@/lib/svg"
import type { ColorMode, Keycap } from "@/lib/types"

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

type ExportOptions = {
  mode: ColorMode
  colorAId: string
  colorBId: string | null
}

export function downloadSetSvg(
  keycaps: Keycap[],
  options: ExportOptions,
  filename = "keycap-set.svg",
) {
  const svg = buildSetSvg(keycaps, options)
  downloadBlob(filename, new Blob([svg], { type: "image/svg+xml;charset=utf-8" }))
}

export async function downloadSetPng(
  keycaps: Keycap[],
  options: ExportOptions,
  filename = "keycap-set.png",
  scale = 2,
): Promise<void> {
  const svg = buildSetSvg(keycaps, options)
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("Failed to load SVG for PNG export"))
      img.src = url
    })
    const canvas = document.createElement("canvas")
    canvas.width = img.width * scale
    canvas.height = img.height * scale
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas unsupported")
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    ctx.drawImage(img, 0, 0)
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("PNG encode failed"))),
        "image/png",
      )
    })
    downloadBlob(filename, pngBlob)
  } finally {
    URL.revokeObjectURL(url)
  }
}
