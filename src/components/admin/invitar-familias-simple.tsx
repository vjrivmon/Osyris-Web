"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle, AlertCircle, Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { makeAuthenticatedRequest } from "@/lib/auth-utils"

interface InvitarFamiliasSimpleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface ParsedEmail {
  email: string
  valid: boolean
}

export function InvitarFamiliasSimple({ open, onOpenChange, onSuccess }: InvitarFamiliasSimpleProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [emailsText, setEmailsText] = useState("")
  const [parsedEmails, setParsedEmails] = useState<ParsedEmail[]>([])
  const { toast } = useToast()

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const parseEmails = (text: string) => {
    if (!text.trim()) {
      setParsedEmails([])
      return
    }

    // Separar por saltos de línea, comas, punto y coma, o espacios
    const emailList = text
      .split(/[\n,;|\t\s]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0)

    // Eliminar duplicados y validar
    const uniqueEmails = [...new Set(emailList)]
    const parsed = uniqueEmails.map(email => ({
      email,
      valid: validateEmail(email)
    }))

    setParsedEmails(parsed)
  }

  const removeEmail = (emailToRemove: string) => {
    setParsedEmails(prev => prev.filter(e => e.email !== emailToRemove))
  }

  const handleSubmit = async () => {
    const validEmails = parsedEmails.filter(e => e.valid)

    if (validEmails.length === 0) {
      toast({
        title: "Sin emails validos",
        description: "Introduce al menos un email valido",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const invitations = validEmails.map(({ email }) => ({
        email,
        nombre: email.split("@")[0],
        apellidos: "",
        rol: "familia"
      }))

      const result = await makeAuthenticatedRequest("/api/admin/invitations/bulk", {
        method: "POST",
        body: JSON.stringify({ invitations })
      })

      if (result.success) {
        const enviados = result.data?.successful || validEmails.length
        const fallidos = result.data?.failed || 0

        toast({
          title: "Invitaciones enviadas",
          description: `${enviados} email${enviados !== 1 ? 's' : ''} enviado${enviados !== 1 ? 's' : ''}${fallidos > 0 ? `. ${fallidos} fallaron.` : '.'}`,
        })

        // Reset
        setEmailsText("")
        setParsedEmails([])
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudieron enviar las invitaciones",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending invitations:", error)
      toast({
        title: "Error",
        description: "Ocurrio un error al enviar las invitaciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmailsText("")
    setParsedEmails([])
    onOpenChange(false)
  }

  const validCount = parsedEmails.filter(e => e.valid).length
  const invalidCount = parsedEmails.filter(e => !e.valid).length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitar Familias
          </DialogTitle>
          <DialogDescription>
            Las familias recibiran un email para registrarse en el portal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Campo de emails */}
          <div className="space-y-2">
            <Textarea
              placeholder="Pega los emails aqui (uno por linea, separados por comas o espacios)"
              value={emailsText}
              onChange={(e) => {
                setEmailsText(e.target.value)
                parseEmails(e.target.value)
              }}
              rows={5}
              className="font-mono text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Puedes pegar directamente desde Excel
            </p>
          </div>

          {/* Preview de emails */}
          {parsedEmails.length > 0 && (
            <div className="space-y-3">
              {/* Resumen */}
              <div className="flex gap-2">
                {validCount > 0 && (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {validCount} valido{validCount !== 1 ? 's' : ''}
                  </Badge>
                )}
                {invalidCount > 0 && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {invalidCount} invalido{invalidCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {/* Lista de emails */}
              <div className="max-h-32 overflow-y-auto space-y-1">
                {parsedEmails.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between px-2 py-1 rounded text-sm ${
                      item.valid
                        ? "bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
                        : "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {item.valid ? (
                        <CheckCircle className="h-3 w-3 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      )}
                      <span className="truncate">{item.email}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmail(item.email)}
                      className="h-5 w-5 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || validCount === 0}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Enviar {validCount > 0 ? `(${validCount})` : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
