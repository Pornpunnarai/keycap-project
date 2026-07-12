import type { Metadata } from "next"
import { Baloo_2, Mitr } from "next/font/google"
import "./globals.css"

const mitr = Mitr({
  variable: "--font-app",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
})

const legendFont = Baloo_2({
  variable: "--font-legend",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
})

export const metadata: Metadata = {
  title: "ตัวจัดชุดคีย์แคป",
  description: "จัดชุดคีย์แคปจากสีเส้นใยและตัวอักษรหรือไอคอน",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="th"
      className={`${mitr.variable} ${legendFont.variable} h-full antialiased`}
    >
      <body className={`${mitr.className} flex min-h-full flex-col`}>
        {children}
      </body>
    </html>
  )
}
