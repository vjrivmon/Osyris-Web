export type UserRole = "kraal" | "comite" | "familia" | "coordinador" | "tesorero" | "secretario"

export type Section = "Castores" | "Manada" | "Tropa" | "Pioneros" | "Rutas" | "Kraal" | "Comité"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  section?: Section
  isActive: boolean
  lastLogin?: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

