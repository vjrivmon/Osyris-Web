"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { useCookieConsent } from "@/hooks/useCookieConsent"
import { CookieSettingsModal } from "./cookie-settings-modal"

interface CookieSettingsButtonProps {
  className?: string
}

export function CookieSettingsButton({ className }: CookieSettingsButtonProps) {
  const { preferences, savePreferences, isLoaded } = useCookieConsent()
  const [showSettings, setShowSettings] = useState(false)

  if (!isLoaded) {
    return null
  }

  return (
    <>
      <button
        onClick={() => setShowSettings(true)}
        className={className}
        aria-label="Configurar cookies"
      >
        <Settings className="h-4 w-4 inline mr-1" />
        Configurar Cookies
      </button>

      <CookieSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
        currentPreferences={preferences}
        onSave={savePreferences}
      />
    </>
  )
}
