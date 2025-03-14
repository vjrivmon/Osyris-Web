import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple hash function (NOT for production use)
export function hash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(36)
}

// Format date to Spanish locale
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

// Format time to Spanish locale
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Secure storage helper
export const secureStorage = {
  set: (key: string, value: any) => {
    try {
      const serializedValue = JSON.stringify(value)
      sessionStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error("Error saving to secure storage:", error)
    }
  },

  get: (key: string) => {
    try {
      const serializedValue = sessionStorage.getItem(key)
      return serializedValue ? JSON.parse(serializedValue) : null
    } catch (error) {
      console.error("Error reading from secure storage:", error)
      return null
    }
  },

  remove: (key: string) => {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing from secure storage:", error)
    }
  },

  clear: () => {
    try {
      sessionStorage.clear()
    } catch (error) {
      console.error("Error clearing secure storage:", error)
    }
  },
}

