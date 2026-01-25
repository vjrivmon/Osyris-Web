"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Cookie, Settings, Check, X } from "lucide-react"
import { useCookieConsent } from "@/hooks/useCookieConsent"
import { CookieSettingsModal } from "./cookie-settings-modal"

export function CookieBanner() {
  const {
    showBanner,
    isLoaded,
    preferences,
    acceptAll,
    rejectOptional,
    savePreferences,
  } = useCookieConsent()

  const [showSettings, setShowSettings] = useState(false)

  // No renderizar hasta que se haya cargado el estado
  if (!isLoaded || !showBanner) {
    return null
  }

  return (
    <>
      {/* Banner principal */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500"
        role="dialog"
        aria-label="Configuracion de cookies"
      >
        <div className="bg-card border-t-2 border-primary shadow-lg">
          <div className="container mx-auto px-4 py-4 sm:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Contenido */}
              <div className="flex gap-3 lg:max-w-2xl">
                <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">
                    Utilizamos cookies para mejorar tu experiencia
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Usamos cookies esenciales para el funcionamiento del sitio y opcionales para analisis.
                    Puedes configurar tus preferencias o aceptar todas las cookies.
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                {/* Enlace a politica */}
                <Link
                  href="/cookies"
                  className="text-sm text-primary hover:underline underline-offset-4 sm:mr-4"
                >
                  Ver Politica de Cookies
                </Link>

                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Configurar */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="sm:inline">Configurar</span>
                  </Button>

                  {/* Rechazar opcionales */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={rejectOptional}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    <span className="sm:inline">Solo necesarias</span>
                  </Button>

                  {/* Aceptar todas */}
                  <Button
                    size="sm"
                    onClick={acceptAll}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Check className="h-4 w-4" />
                    <span className="sm:inline">Aceptar todas</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de configuracion */}
      <CookieSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
        currentPreferences={preferences}
        onSave={savePreferences}
      />
    </>
  )
}
