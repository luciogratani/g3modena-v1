import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Toaster } from "sonner"
import { CustomCursor } from "@/components/custom-cursor"
import { SiteLoader } from "@/components/site-loader"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

const ENABLE_SITE_LOADER = false

export const metadata: Metadata = {
  title: "G3 - Waiters & Experience",
  description:
    "Direzione di sala e servizio premium per catering di alto livello. Oltre 20 anni di esperienza in Italia centrale, settentrionale e in Sardegna.",
}

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        {ENABLE_SITE_LOADER && <SiteLoader />}
        {children}
        <CustomCursor />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "hsl(0 0% 6%)",
              color: "hsl(40 20% 98%)",
              border: "1px solid hsl(40 55% 50% / 0.3)",
            },
          }}
        />
      </body>
    </html>
  )
}
