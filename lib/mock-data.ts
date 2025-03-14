import type { User, Section } from "./auth-types"
import { hash } from "./utils"

// Mock users for development
export const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Coordinador Grupo",
    email: "coordinador@gsosyris.org",
    role: "coordinador",
    section: "Kraal",
    isActive: true,
  },
  {
    id: "2",
    name: "Scouter Castores",
    email: "castores@gsosyris.org",
    role: "kraal",
    section: "Castores",
    isActive: true,
  },
  // Add more mock users as needed
]

// Mock credentials (NEVER use in production)
export const MOCK_CREDENTIALS = {
  "coordinador@gsosyris.org": hash("password123"),
  "castores@gsosyris.org": hash("password123"),
}

export const SECTION_COLORS: Record<Section, { light: string; dark: string }> = {
  Castores: {
    light: "bg-orange-100 text-orange-800 border-orange-200",
    dark: "dark:bg-orange-900 dark:text-orange-100 dark:border-orange-800",
  },
  Manada: {
    light: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dark: "dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800",
  },
  Tropa: {
    light: "bg-blue-100 text-blue-800 border-blue-200",
    dark: "dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800",
  },
  Pioneros: {
    light: "bg-red-100 text-red-800 border-red-200",
    dark: "dark:bg-red-900 dark:text-red-100 dark:border-red-800",
  },
  Rutas: {
    light: "bg-green-100 text-green-800 border-green-200",
    dark: "dark:bg-green-900 dark:text-green-100 dark:border-green-800",
  },
  Kraal: {
    light: "bg-purple-100 text-purple-800 border-purple-200",
    dark: "dark:bg-purple-900 dark:text-purple-100 dark:border-purple-800",
  },
  Comité: {
    light: "bg-gray-100 text-gray-800 border-gray-200",
    dark: "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-800",
  },
}

