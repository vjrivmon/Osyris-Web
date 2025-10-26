import type React from "react"
import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Grupo Scout Osyris",
  description: "Plataforma integral para la gestión y comunicación del Grupo Scout Osyris",
  generator: "v0.dev",
  icons: {
    icon: [
      { url: "/images/logo-osyris.png", type: "image/png" },
    ],
    shortcut: "/images/logo-osyris.png",
    apple: "/images/logo-osyris.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased transition-colors duration-300 no-backdrop-filter",
          fontSans.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
