import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProviderWrapper } from "@/components/auth/auth-provider-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GS Osyris - Plataforma Web",
  description: "Plataforma web para la gestión del Grupo Scout Osyris",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProviderWrapper>{children}</AuthProviderWrapper>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'