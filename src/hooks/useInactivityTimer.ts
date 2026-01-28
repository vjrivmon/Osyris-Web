'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

/** Tiempo de inactividad antes de cerrar sesión (en milisegundos) */
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutos

/** Tiempo antes del cierre para mostrar advertencia (en milisegundos) */
const WARNING_BEFORE_MS = 60 * 1000 // 1 minuto antes

/** Debounce para eventos de actividad (evitar actualizaciones excesivas) */
const ACTIVITY_DEBOUNCE_MS = 1000 // 1 segundo

/** Clave de localStorage para sincronizar entre tabs */
const LAST_ACTIVITY_KEY = 'osyris_last_activity'

/** Eventos que resetean el timer de inactividad */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'wheel'
]

// ============================================================================
// TIPOS
// ============================================================================

export interface UseInactivityTimerOptions {
  /** Timeout de inactividad en ms (default: 15 min) */
  timeoutMs?: number
  /** Tiempo antes del cierre para advertir en ms (default: 1 min) */
  warningBeforeMs?: number
  /** Callback cuando la sesión expira por inactividad */
  onExpire: () => void
  /** Si el timer está habilitado (solo cuando hay usuario autenticado) */
  enabled?: boolean
}

export interface UseInactivityTimerReturn {
  /** Segundos restantes hasta expiración */
  secondsRemaining: number
  /** Si se debe mostrar el modal de advertencia */
  showWarning: boolean
  /** Resetea el timer (el usuario indicó que sigue activo) */
  resetTimer: () => void
  /** Si el timer está activo */
  isActive: boolean
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useInactivityTimer({
  timeoutMs = INACTIVITY_TIMEOUT_MS,
  warningBeforeMs = WARNING_BEFORE_MS,
  onExpire,
  enabled = true
}: UseInactivityTimerOptions): UseInactivityTimerReturn {
  // Estado
  const [lastActivity, setLastActivity] = useState<number>(() => Date.now())
  const [showWarning, setShowWarning] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(Math.floor(timeoutMs / 1000))

  // Referencias para evitar re-renders innecesarios
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const onExpireRef = useRef(onExpire)

  // Mantener onExpire actualizado sin causar re-renders
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  /**
   * Actualiza el timestamp de última actividad
   * - Guarda en localStorage para sincronizar entre tabs
   * - Usa debounce para evitar actualizaciones excesivas
   */
  const updateLastActivity = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      const now = Date.now()
      setLastActivity(now)
      setShowWarning(false)

      // Sincronizar entre tabs
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
      } catch {
        // Ignorar errores de localStorage (modo privado, etc.)
      }
    }, ACTIVITY_DEBOUNCE_MS)
  }, [])

  /**
   * Resetea el timer manualmente (desde botón "Continuar conectado")
   */
  const resetTimer = useCallback(() => {
    const now = Date.now()
    setLastActivity(now)
    setShowWarning(false)
    setSecondsRemaining(Math.floor(timeoutMs / 1000))

    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
    } catch {
      // Ignorar errores de localStorage
    }

    console.log('🔄 [useInactivityTimer] Timer reseteado manualmente')
  }, [timeoutMs])

  /**
   * Verifica actividad en otras tabs via localStorage
   */
  const checkOtherTabsActivity = useCallback((): number => {
    try {
      const storedActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
      if (storedActivity) {
        const otherTabActivity = parseInt(storedActivity, 10)
        if (otherTabActivity > lastActivity) {
          // Otra tab tuvo actividad más reciente
          setLastActivity(otherTabActivity)
          return otherTabActivity
        }
      }
    } catch {
      // Ignorar errores de localStorage
    }
    return lastActivity
  }, [lastActivity])

  // ============================================================================
  // EFECTOS
  // ============================================================================

  /**
   * Registrar event listeners para detectar actividad del usuario
   */
  useEffect(() => {
    if (!enabled) return

    // Handler con debounce
    const handleActivity = () => {
      updateLastActivity()
    }

    // Registrar todos los eventos de actividad
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    console.log('🎯 [useInactivityTimer] Event listeners registrados')

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [enabled, updateLastActivity])

  /**
   * Escuchar cambios en localStorage (sincronización entre tabs)
   */
  useEffect(() => {
    if (!enabled) return

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === LAST_ACTIVITY_KEY && event.newValue) {
        const newActivity = parseInt(event.newValue, 10)
        if (newActivity > lastActivity) {
          console.log('🔄 [useInactivityTimer] Actividad detectada en otra tab')
          setLastActivity(newActivity)
          setShowWarning(false)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [enabled, lastActivity])

  /**
   * Manejar cambios de visibilidad (cuando el usuario vuelve a la pestaña)
   */
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // El usuario volvió a la pestaña
        console.log('👁️ [useInactivityTimer] Tab visible, verificando actividad...')

        // Verificar si hay actividad más reciente en otras tabs
        const mostRecentActivity = checkOtherTabsActivity()
        const now = Date.now()
        const elapsed = now - mostRecentActivity

        if (elapsed >= timeoutMs) {
          // La sesión debería haber expirado
          console.log('⏰ [useInactivityTimer] Sesión expirada mientras la tab estaba oculta')
          onExpireRef.current()
        } else if (elapsed >= timeoutMs - warningBeforeMs) {
          // Mostrar advertencia
          setShowWarning(true)
          setSecondsRemaining(Math.max(0, Math.floor((timeoutMs - elapsed) / 1000)))
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, timeoutMs, warningBeforeMs, checkOtherTabsActivity])

  /**
   * Timer principal: verifica cada segundo si hay que mostrar advertencia o expirar
   */
  useEffect(() => {
    if (!enabled) {
      // Limpiar timers si se deshabilita
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    // Intervalo que verifica el estado cada segundo
    intervalRef.current = setInterval(() => {
      const now = Date.now()

      // Verificar actividad en otras tabs
      const mostRecentActivity = checkOtherTabsActivity()
      const elapsed = now - mostRecentActivity
      const remaining = timeoutMs - elapsed
      const remainingSeconds = Math.max(0, Math.floor(remaining / 1000))

      setSecondsRemaining(remainingSeconds)

      // Verificar si debe mostrar advertencia
      if (remaining <= warningBeforeMs && remaining > 0) {
        if (!showWarning) {
          console.log('⚠️ [useInactivityTimer] Mostrando advertencia de inactividad')
          setShowWarning(true)
        }
      }

      // Verificar si ha expirado
      if (remaining <= 0) {
        console.log('⏰ [useInactivityTimer] Sesión expirada por inactividad')
        if (intervalRef.current) clearInterval(intervalRef.current)
        onExpireRef.current()
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [enabled, lastActivity, timeoutMs, warningBeforeMs, showWarning, checkOtherTabsActivity])

  /**
   * Inicializar lastActivity desde localStorage al montar
   */
  useEffect(() => {
    if (!enabled) return

    try {
      const stored = localStorage.getItem(LAST_ACTIVITY_KEY)
      if (stored) {
        const storedTime = parseInt(stored, 10)
        const now = Date.now()

        // Solo usar si es reciente (menos del timeout)
        if (now - storedTime < timeoutMs) {
          setLastActivity(storedTime)
        } else {
          // Si es muy viejo, usar now y actualizar localStorage
          localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
        }
      } else {
        // No hay valor guardado, guardar ahora
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
      }
    } catch {
      // Ignorar errores de localStorage
    }
  }, [enabled, timeoutMs])

  return {
    secondsRemaining,
    showWarning,
    resetTimer,
    isActive: enabled
  }
}

export default useInactivityTimer
