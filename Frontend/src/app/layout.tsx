import type { Metadata } from "next"
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google"

import { AppProviders } from "@/app/providers"
import "./globals.css"

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
})

export const metadata: Metadata = {
  title: "Coffee Bot Frontend",
  description: "Nền tảng frontend cho hệ thống quản lý bán hàng cà phê bột online",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${beVietnamPro.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}