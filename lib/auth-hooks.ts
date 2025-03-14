"use client"

import { useAuth as useAuthOriginal } from "@/components/auth/auth-provider"

// Re-export para evitar problemas de renderizado
export function useAuth() {
  return useAuthOriginal()
}

