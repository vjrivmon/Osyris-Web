"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Cookie, Shield, BarChart3, Megaphone } from "lucide-react"
import type { CookiePreferences } from "@/hooks/useCookieConsent"

interface CookieSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPreferences: CookiePreferences
  onSave: (preferences: CookiePreferences) => void
}

interface CookieCategory {
  id: keyof CookiePreferences
  name: string
  description: string
  icon: React.ReactNode
  required: boolean
}

const cookieCategories: CookieCategory[] = [
  {
    id: "necessary",
    name: "Cookies Necesarias",
    description:
      "Estas cookies son esenciales para el funcionamiento del sitio web. Incluyen preferencias de tema, estado de sesión y configuración de cookies. No pueden ser desactivadas.",
    icon: <Shield className="h-5 w-5 text-primary" />,
    required: true,
  },
  {
    id: "analytics",
    name: "Cookies Analíticas",
    description:
      "Nos ayudan a entender cómo los visitantes interactúan con el sitio web. Utilizamos Google Analytics para recopilar información anónima sobre el uso del sitio.",
    icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
    required: false,
  },
  {
    id: "marketing",
    name: "Cookies de Marketing",
    description:
      "Se utilizan para rastrear visitantes a través de sitios web con el fin de mostrar anuncios relevantes. Actualmente no utilizamos este tipo de cookies, pero lo reservamos para uso futuro.",
    icon: <Megaphone className="h-5 w-5 text-orange-500" />,
    required: false,
  },
]

export function CookieSettingsModal({
  open,
  onOpenChange,
  currentPreferences,
  onSave,
}: CookieSettingsModalProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>(currentPreferences)

  // Sincronizar con las preferencias actuales cuando se abre el modal
  useEffect(() => {
    if (open) {
      setPreferences(currentPreferences)
    }
  }, [open, currentPreferences])

  const handleToggle = (id: keyof CookiePreferences) => {
    if (id === "necessary") return // No se puede desactivar

    setPreferences((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleSave = () => {
    onSave(preferences)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-primary" />
            Configurar Cookies
          </DialogTitle>
          <DialogDescription>
            Gestiona tus preferencias de cookies. Las cookies necesarias no pueden ser desactivadas ya que son esenciales para el funcionamiento del sitio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {cookieCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-start justify-between gap-4 rounded-lg border p-4"
            >
              <div className="flex gap-3">
                <div className="mt-0.5">{category.icon}</div>
                <div className="space-y-1">
                  <Label htmlFor={category.id} className="text-base font-medium">
                    {category.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>
              <Switch
                id={category.id}
                checked={preferences[category.id]}
                onCheckedChange={() => handleToggle(category.id)}
                disabled={category.required}
                aria-label={`${category.required ? "Siempre activo" : "Activar"} ${category.name}`}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Guardar preferencias
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
