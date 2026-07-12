import { createElement, type CSSProperties, type ReactNode } from "react"

export type MaskGlyphProps = {
  size?: number | string
  color?: string
  className?: string
  fill?: string
  strokeWidth?: number | string
}

export function MaskGlyph({
  src,
  size = 24,
  color = "currentColor",
  fill,
  className,
}: MaskGlyphProps & { src: string }) {
  const s = typeof size === "number" ? size : Number(size) || 24
  const style: CSSProperties = {
    display: "block",
    width: s,
    height: s,
    flexShrink: 0,
    backgroundColor: fill ?? color,
    WebkitMaskImage: `url(${src})`,
    WebkitMaskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskImage: `url(${src})`,
    maskSize: "contain",
    maskRepeat: "no-repeat",
    maskPosition: "center",
  }
  return createElement("span", {
    className,
    style,
    "aria-hidden": true,
  })
}

export function makeMaskGlyph(src: string) {
  return (props: MaskGlyphProps): ReactNode => MaskGlyph({ ...props, src })
}
