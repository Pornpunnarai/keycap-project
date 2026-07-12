import { buildSetSvg } from "@/lib/svg"
import type { CanvasOrientation, ColorMode, Keycap } from "@/lib/types"

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
  legendColorId?: string | null
  orientation?: CanvasOrientation
}

/** e.g. keycaps J,I,N → "keycap-JIN"; empty legends → "keycap-set" */
export function buildExportBasename(keycaps: Keycap[]): string {
  const name = keycaps
    .map((key) =>
      key.legendType === "char" && key.legendValue ? key.legendValue : "",
    )
    .join("")
    .replace(/[^A-Za-z0-9]/g, "")
  return name.length > 0 ? `keycap-${name}` : "keycap-set"
}

export function downloadSetSvg(
  keycaps: Keycap[],
  options: ExportOptions,
  filename?: string,
) {
  const svg = buildSetSvg(keycaps, options)
  downloadBlob(
    filename ?? `${buildExportBasename(keycaps)}.svg`,
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  )
}

export async function downloadSetPng(
  keycaps: Keycap[],
  options: ExportOptions,
  filename?: string,
  scale = 2,
): Promise<void> {
  const svg = buildSetSvg(keycaps, options)
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const outName = filename ?? `${buildExportBasename(keycaps)}.png`
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
    downloadBlob(outName, pngBlob)
  } finally {
    URL.revokeObjectURL(url)
  }
}
