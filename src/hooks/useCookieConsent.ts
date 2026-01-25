"use client"

import { useState, useEffect, useCallback } from "react"

// Version del consentimiento - incrementar si cambian las cookies
const CONSENT_VERSION = 1
const STORAGE_KEY = "osyris-cookie-consent"

export interface CookiePreferences {
  necessary: boolean // Siempre true, no se puede desactivar
  analytics: boolean
  marketing: boolean
}

export interface ConsentData {
  version: number
  preferences: CookiePreferences
  timestamp: string
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentData | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar consentimiento desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored) {
      try {
        const parsed: ConsentData = JSON.parse(stored)

        // Si la version cambio, mostrar banner de nuevo
        if (parsed.version !== CONSENT_VERSION) {
          setShowBanner(true)
        } else {
          setConsent(parsed)
          setShowBanner(false)
        }
      } catch {
        // Si hay error, mostrar banner
        setShowBanner(true)
      }
    } else {
      // Primera visita, mostrar banner
      setShowBanner(true)
    }

    setIsLoaded(true)
  }, [])

  // Guardar preferencias
  const savePreferences = useCallback((preferences: CookiePreferences) => {
    const data: ConsentData = {
      version: CONSENT_VERSION,
      preferences: {
        ...preferences,
        necessary: true, // Siempre true
      },
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setConsent(data)
    setShowBanner(false)
  }, [])

  // Aceptar todas las cookies
  const acceptAll = useCallback(() => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    })
  }, [savePreferences])

  // Rechazar cookies opcionales
  const rejectOptional = useCallback(() => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    })
  }, [savePreferences])

  // Actualizar preferencias especificas
  const updateConsent = useCallback((preferences: Partial<CookiePreferences>) => {
    const current = consent?.preferences || DEFAULT_PREFERENCES
    savePreferences({
      ...current,
      ...preferences,
      necessary: true, // Siempre true
    })
  }, [consent, savePreferences])

  // Abrir el modal de configuracion (mostrar banner)
  const openSettings = useCallback(() => {
    setShowBanner(true)
  }, [])

  // Verificar si se ha dado consentimiento
  const hasConsented = consent !== null

  // Verificar si se pueden usar analytics
  const canUseAnalytics = consent?.preferences.analytics === true

  // Verificar si se pueden usar marketing
  const canUseMarketing = consent?.preferences.marketing === true

  return {
    // Estado
    consent,
    showBanner,
    isLoaded,
    hasConsented,
    canUseAnalytics,
    canUseMarketing,
    preferences: consent?.preferences || DEFAULT_PREFERENCES,

    // Acciones
    acceptAll,
    rejectOptional,
    updateConsent,
    savePreferences,
    openSettings,
  }
}
