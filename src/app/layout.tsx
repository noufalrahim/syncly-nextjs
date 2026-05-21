import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Tessera — Task Management",
  description:
    "A modern, dark-first task management workspace for boards, calendars, notes, and goals.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#28201a",
  width: "device-width",
  initialScale: 1,
}

import { Toaster } from "@/presentation/components/ui/sonner"
import { Providers } from "@/app/providers"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased text-foreground">
        <Providers>{children}</Providers>
        <Toaster position={'top-right'}/>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
