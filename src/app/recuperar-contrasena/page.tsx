"use client"

import type React from "react"
import { getApiUrl } from '@/lib/api-utils'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validar el email
      if (!email || !email.includes("@")) {
        throw new Error("Por favor, introduce un correo electrónico válido.")
      }

      // Llamar a la API real
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la solicitud.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-section-pattern p-4">
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/login" >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Volver al inicio de sesión</span>
          </Link>
        </Button>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src="/images/logo-osyris.png"
            alt="Logo Grupo Scout Osyris"
            className="h-20 w-20 rounded-full border-4 border-primary shadow-lg"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recuperar contraseña</CardTitle>
            <CardDescription>
              Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Hemos enviado un enlace de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de
                  entrada.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu.correo@ejemplo.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-muted-foreground text-center">
              ¿Recuerdas tu contraseña?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Grupo Scout Osyris. Todos los derechos reservados.</p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link href="/terminos" className="hover:underline">
              Términos de uso
            </Link>
            <Link href="/privacidad" className="hover:underline">
              Política de privacidad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

