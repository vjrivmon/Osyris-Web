'use client'

/**
 * @deprecated Este archivo se mantiene por compatibilidad.
 * El hook useAuth ahora se exporta desde contexts/AuthContext.tsx
 * para garantizar un estado global compartido entre todos los componentes.
 *
 * Todos los imports de '@/hooks/useAuth' seguirán funcionando,
 * pero ahora usan el contexto global.
 */

export { useAuth } from '@/contexts/AuthContext'
