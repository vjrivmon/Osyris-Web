"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Mail, AlertCircle, CheckCircle, Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { makeAuthenticatedRequest } from "@/lib/auth-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BulkInviteModalProps {
  onInvitesSent?: () => void
  trigger?: React.ReactNode
}

interface ParsedEmail {
  email: string
  valid: boolean
  error?: string
}

export function BulkInviteModal({ onInvitesSent, trigger }: BulkInviteModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailsText, setEmailsText] = useState("")
  const [selectedRole, setSelectedRole] = useState<"admin" | "scouter">("scouter")
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [parsedEmails, setParsedEmails] = useState<ParsedEmail[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  // Secciones disponibles
  const secciones = [
    { id: "1", nombre: "Castores" },
    { id: "2", nombre: "Manada" },
    { id: "3", nombre: "Tropa" },
    { id: "4", nombre: "Pioneros" },
    { id: "5", nombre: "Rutas" }
  ]

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const parseEmails = () => {
    if (!emailsText.trim()) {
      setParsedEmails([])
      setShowPreview(false)
      return
    }

    // Separar por saltos de línea, comas, puntos y coma, o espacios
    const emailList = emailsText
      .split(/[\n,;|\t\s]+/)
      .map(e => e.trim())
      .filter(e => e.length > 0)

    const parsed: ParsedEmail[] = emailList.map(email => {
      const valid = validateEmail(email)
      return {
        email,
        valid,
        error: valid ? undefined : "Email inválido"
      }
    })

    // Eliminar duplicados
    const uniqueEmails = new Map<string, ParsedEmail>()
    parsed.forEach(item => {
      if (!uniqueEmails.has(item.email.toLowerCase())) {
        uniqueEmails.set(item.email.toLowerCase(), item)
      }
    })

    setParsedEmails(Array.from(uniqueEmails.values()))
    setShowPreview(true)
  }

  const removeEmail = (email: string) => {
    setParsedEmails(prev => prev.filter(e => e.email !== email))
  }

  const handleSubmit = async () => {
    const validEmails = parsedEmails.filter(e => e.valid)
    
    if (validEmails.length === 0) {
      toast({
        title: "Error",
        description: "No hay emails válidos para enviar",
        variant: "destructive",
      })
      return
    }

    if (selectedRole === "scouter" && !selectedSection) {
      toast({
        title: "Error",
        description: "Debes seleccionar una sección para los scouters",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const invitations = validEmails.map(({ email }) => ({
        email,
        nombre: email.split("@")[0], // Nombre temporal del email
        apellidos: "", // Se completará al registrarse
        rol: selectedRole,
        seccion_id: selectedRole === "scouter" && selectedSection ? parseInt(selectedSection) : undefined
      }))

      const result = await makeAuthenticatedRequest("/api/admin/invitations/bulk", {
        method: "POST",
        body: JSON.stringify({ invitations })
      })

      if (result.success) {
        toast({
          title: "¡Invitaciones enviadas!",
          description: `Se han enviado ${result.data.successful} invitaciones exitosamente.${result.data.failed > 0 ? ` ${result.data.failed} fallaron.` : ""}`,
        })

        // Reset form
        setEmailsText("")
        setParsedEmails([])
        setShowPreview(false)
        setSelectedRole("scouter")
        setSelectedSection("")

        // Callback
        onInvitesSent?.()

        // Close modal
        setOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudieron enviar las invitaciones",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending bulk invitations:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar las invitaciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const defaultTrigger = (
    <Button className="bg-orange-600 hover:bg-orange-700">
      <Mail className="h-4 w-4 mr-2" />
      Invitaciones Múltiples
    </Button>
  )

  const validEmailsCount = parsedEmails.filter(e => e.valid).length
  const invalidEmailsCount = parsedEmails.filter(e => !e.valid).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Invitaciones Múltiples
          </DialogTitle>
          <DialogDescription>
            Pega una lista de correos electrónicos separados por saltos de línea, comas o espacios. Todos recibirán el mismo rol.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selector de Rol */}
          <div className="space-y-2">
            <Label htmlFor="rol">Rol para todos los usuarios *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: any) => setSelectedRole(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Admin</Badge>
                    <span>Acceso completo</span>
                  </div>
                </SelectItem>
                <SelectItem value="scouter">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">Scouter</Badge>
                    <span>Monitor/Coordinador</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selector de Sección (solo para scouters) */}
          {selectedRole === "scouter" && (
            <div className="space-y-2">
              <Label htmlFor="seccion">Sección Scout *</Label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una sección" />
                </SelectTrigger>
                <SelectContent>
                  {secciones.map((seccion) => (
                    <SelectItem key={seccion.id} value={seccion.id}>
                      {seccion.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Área de texto para emails */}
          <div className="space-y-2">
            <Label htmlFor="emails">
              Lista de correos electrónicos *
            </Label>
            <Textarea
              id="emails"
              placeholder="ejemplo1@email.com&#10;ejemplo2@email.com&#10;ejemplo3@email.com"
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              onBlur={parseEmails}
              rows={8}
              className="font-mono text-sm"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Puedes copiar y pegar desde Excel o cualquier fuente
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={parseEmails}
              >
                Procesar Emails
              </Button>
            </div>
          </div>

          {/* Preview de emails procesados */}
          {showPreview && parsedEmails.length > 0 && (
            <div className="space-y-2">
              <Label>Emails procesados ({parsedEmails.length})</Label>
              
              {/* Resumen */}
              <div className="flex gap-2">
                {validEmailsCount > 0 && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {validEmailsCount} válidos
                  </Badge>
                )}
                {invalidEmailsCount > 0 && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {invalidEmailsCount} inválidos
                  </Badge>
                )}
              </div>

              {/* Lista de emails */}
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {parsedEmails.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded ${
                      item.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {item.valid ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      )}
                      <span className={`text-sm truncate ${item.valid ? "text-green-900" : "text-red-900"}`}>
                        {item.email}
                      </span>
                      {item.error && (
                        <span className="text-xs text-red-600">({item.error})</span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmail(item.email)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Alerta si hay emails inválidos */}
              {invalidEmailsCount > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Se encontraron {invalidEmailsCount} email(s) inválido(s). Solo se enviarán invitaciones a los emails válidos.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || validEmailsCount === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Enviar {validEmailsCount} Invitación{validEmailsCount !== 1 ? "es" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

