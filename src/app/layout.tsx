import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Syncly — Task Management",
  description:
    "A modern task management workspace for boards, calendars, notes, chat, and goals.",
  applicationName: "Syncly",
  appleWebApp: {
    capable: true,
    // Omit statusBarStyle — "black-translucent" causes the iOS PWA chin gap.
    title: "Syncly",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1a1816" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Safe with default status bar; do NOT pair with black-translucent.
  viewportFit: "cover",
}

import { Toaster } from "@/presentation/components/ui/sonner"
import { Providers } from "@/app/providers"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className="font-sans antialiased text-foreground overscroll-none">
        {/* Apply the saved accent color before first paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var a=localStorage.getItem("syncly-accent");if(a&&a!=="orange")document.documentElement.setAttribute("data-accent",a)}catch(e){}`,
          }}
        />
        <Providers>{children}</Providers>
        <Toaster position={"top-right"} />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
