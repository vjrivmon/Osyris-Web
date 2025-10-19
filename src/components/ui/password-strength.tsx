"use client"

import { useMemo } from "react"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
}

interface Requirement {
  label: string
  met: boolean
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const analysis = useMemo(() => {
    const requirements: Requirement[] = [
      {
        label: "Mínimo 8 caracteres",
        met: password.length >= 8
      },
      {
        label: "Una mayúscula (A-Z)",
        met: /[A-Z]/.test(password)
      },
      {
        label: "Una minúscula (a-z)",
        met: /[a-z]/.test(password)
      },
      {
        label: "Un número (0-9)",
        met: /[0-9]/.test(password)
      },
      {
        label: "Un símbolo (!@#$%...)",
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      }
    ]

    const metCount = requirements.filter(r => r.met).length
    const totalCount = requirements.length
    const percentage = (metCount / totalCount) * 100

    let strength: "weak" | "medium" | "good" | "strong" = "weak"
    let color = "bg-red-500"
    let textColor = "text-red-600"
    let label = "Muy débil"

    if (percentage >= 80) {
      strength = "strong"
      color = "bg-green-500"
      textColor = "text-green-600"
      label = "Fuerte"
    } else if (percentage >= 60) {
      strength = "good"
      color = "bg-blue-500"
      textColor = "text-blue-600"
      label = "Buena"
    } else if (percentage >= 40) {
      strength = "medium"
      color = "bg-yellow-500"
      textColor = "text-yellow-600"
      label = "Media"
    }

    return {
      requirements,
      percentage,
      strength,
      color,
      textColor,
      label,
      metCount,
      totalCount
    }
  }, [password])

  if (!password) return null

  return (
    <div className="space-y-3 mt-2">
      {/* Barra de progreso */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Seguridad:</span>
          <span className={`font-medium ${analysis.textColor}`}>
            {analysis.label}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${analysis.color} transition-all duration-300 ease-out`}
            style={{ width: `${analysis.percentage}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {analysis.metCount} de {analysis.totalCount} requisitos cumplidos
        </div>
      </div>

      {/* Lista de requisitos */}
      <div className="space-y-1.5">
        {analysis.requirements.map((req, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 text-sm transition-colors ${
              req.met ? "text-green-600" : "text-gray-500"
            }`}
          >
            {req.met ? (
              <Check className="h-4 w-4 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

