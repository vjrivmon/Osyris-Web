import type React from "react"
import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://gruposcoutosyris.es'),
  title: {
    default: "Grupo Scout Osyris - Educación Scout en Valencia",
    template: "%s | Grupo Scout Osyris"
  },
  description: "Grupo Scout Osyris: educación integral para jóvenes de 5 a 19 años en Valencia. Secciones de Castores, Manada, Tropa, Pioneros y Rutas. Únete a nuestra gran familia scout.",
  keywords: [
    "scout",
    "grupo scout",
    "osyris",
    "valencia",
    "educación",
    "jóvenes",
    "castores",
    "manada",
    "tropa",
    "pioneros",
    "rutas",
    "campamentos",
    "actividades scout",
    "movimiento scout",
    "ASDE",
    "scoutismo"
  ],
  authors: [
    { name: "Grupo Scout Osyris" }
  ],
  creator: "Grupo Scout Osyris",
  publisher: "Grupo Scout Osyris",
  generator: "v0.dev",
  applicationName: "Osyris Scout Management",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/images/logo-osyris.png", type: "image/png" },
    ],
    shortcut: "/images/logo-osyris.png",
    apple: "/images/logo-osyris.png",
  },
  verification: {
    google: 'qckJlA1EW9hgLYXNZA1dBmjgEEDqBCkPr8QppHp13RE',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://gruposcoutosyris.es',
    siteName: 'Grupo Scout Osyris',
    title: 'Grupo Scout Osyris - Educación Scout en Valencia',
    description: 'Grupo Scout Osyris: educación integral para jóvenes de 5 a 19 años en Valencia. Únete a nuestra gran familia scout.',
    images: [
      {
        url: '/images/logo-osyris.png',
        width: 1200,
        height: 630,
        alt: 'Grupo Scout Osyris Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grupo Scout Osyris - Educación Scout en Valencia',
    description: 'Educación integral para jóvenes de 5 a 19 años. Únete a nuestra gran familia scout.',
    images: ['/images/logo-osyris.png'],
  },
  alternates: {
    canonical: 'https://gruposcoutosyris.es',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased transition-colors duration-300 no-backdrop-filter",
          fontSans.variable,
        )}
      >
        {/* Google Analytics - Solo se carga si existe el ID de medición */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
