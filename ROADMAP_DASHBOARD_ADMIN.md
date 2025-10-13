# 🎯 ROADMAP: Dashboard Admin + Sistema de Invitaciones

**Última actualización:** 8 de octubre de 2025
**Estado:** En planificación
**Estimación total:** ~7.5 horas de desarrollo

---

## 📋 Contexto del Plan

Este roadmap se centra en implementar un **Dashboard de Administrador completo** con sistema de invitaciones robusto para el proyecto Osyris Scout Management System.

### Objetivos Principales

1. ✅ **Resolver error 404 crítico** en `/admin/files`
2. 🔐 **Sistema de invitaciones de usuarios** profesional
3. 📊 **Dashboard renovado** con métricas y notificaciones
4. 📥 **Importación masiva** de usuarios (CSV/Excel)
5. ✅ **Flujo completo** de registro de usuarios invitados

---

## 🗄️ Base de Datos de Producción (Confirmada)

### Tabla `usuarios` (EXISTENTE)

```sql
-- Estructura confirmada en producción
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  contraseña VARCHAR(255) NOT NULL,
  rol VARCHAR(50) CHECK (rol IN ('admin', 'scouter', 'familia', 'educando')),
  seccion_id INTEGER REFERENCES secciones(id),
  activo BOOLEAN DEFAULT true,
  fecha_registro TIMESTAMP DEFAULT NOW(),
  ultimo_acceso TIMESTAMP,
  foto_perfil VARCHAR(255),
  fecha_nacimiento DATE,
  direccion TEXT,
  dni VARCHAR(20)
);
```

### Tabla `secciones` (EXISTENTE)

```sql
-- 5 secciones disponibles
1. Castores (5-7 años)
2. Lobatos (7-10 años)
3. Tropa (10-13 años)
4. Pioneros (13-16 años)
5. Rutas (16-19 años)
```

---

## 🏗️ FASE 1: Resolver Error 404 Crítico ⚠️

**Prioridad:** URGENTE
**Estimación:** 30 minutos

### Problema Actual

- Ruta `/admin/files` devuelve 404
- No existe el archivo `app/admin/files/page.tsx`

### Solución

#### 1.1. Crear archivo `app/admin/files/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Upload, Trash2, Download, FileIcon, ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Archivo {
  id: number
  nombre: string
  tipo: string
  tamaño: number
  url: string
  fecha_subida: string
}

export default function FilesPage() {
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    setUploading(true)
    const formData = new FormData()

    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('files', e.target.files[i])
    }

    try {
      const res = await fetch('/api/archivos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!res.ok) throw new Error('Error al subir archivos')

      const data = await res.json()
      setArchivos([...archivos, ...data.archivos])

      toast({
        title: "✅ Archivos subidos",
        description: `${data.archivos.length} archivo(s) subido(s) correctamente`
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudieron subir los archivos",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este archivo?')) return

    try {
      const res = await fetch(`/api/archivos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!res.ok) throw new Error('Error al eliminar')

      setArchivos(archivos.filter(a => a.id !== id))
      toast({
        title: "✅ Archivo eliminado",
        description: "El archivo se eliminó correctamente"
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive"
      })
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📁 Gestión de Archivos</h1>
        <p className="text-muted-foreground">
          Sube y administra archivos del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subir Archivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Button disabled={uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Subiendo...' : 'Subir'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Archivos ({archivos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {archivos.map(archivo => (
                <TableRow key={archivo.id}>
                  <TableCell className="flex items-center gap-2">
                    {archivo.tipo.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileIcon className="h-4 w-4 text-gray-500" />
                    )}
                    {archivo.nombre}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{archivo.tipo}</Badge>
                  </TableCell>
                  <TableCell>{formatBytes(archivo.tamaño)}</TableCell>
                  <TableCell>{new Date(archivo.fecha_subida).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={archivo.url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(archivo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 1.2. Backend necesario

**Crear:** `api-osyris/src/routes/archivos.routes.js`

```javascript
const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { verifyToken, requireRole } = require('../middleware/auth.middleware')

// Configurar Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})

// POST /api/archivos/upload - Subir archivos
router.post('/upload', verifyToken, requireRole(['admin']), upload.array('files'), async (req, res) => {
  try {
    const archivos = req.files.map(file => ({
      nombre: file.originalname,
      tipo: file.mimetype,
      tamaño: file.size,
      url: `/uploads/${file.filename}`,
      fecha_subida: new Date()
    }))

    res.json({ success: true, archivos })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/archivos/:id - Eliminar archivo
router.delete('/:id', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    // Implementar lógica de eliminación
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
```

**Estado:** ⏳ Pendiente

---

## 🗄️ FASE 2: Crear Tabla de Invitaciones

**Prioridad:** Alta
**Estimación:** 15 minutos

### 2.1. Script SQL

**Crear:** `api-osyris/database/migrations/002_create_invitaciones_usuarios.sql`

```sql
-- Tabla de invitaciones de usuarios
CREATE TABLE IF NOT EXISTS invitaciones_usuarios (
  id SERIAL PRIMARY KEY,

  -- Información del invitado
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),

  -- Rol y permisos
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'scouter', 'familia')),
  seccion_id INTEGER REFERENCES secciones(id) ON DELETE SET NULL,

  -- Datos de invitación
  token VARCHAR(255) UNIQUE NOT NULL,
  password_temporal VARCHAR(255) NOT NULL,

  -- Trazabilidad
  invitado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,

  -- Estado
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada', 'expirada')),
  expires_at TIMESTAMP NOT NULL,
  fecha_registro_completado TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_invitaciones_email ON invitaciones_usuarios(email);
CREATE INDEX idx_invitaciones_token ON invitaciones_usuarios(token);
CREATE INDEX idx_invitaciones_estado ON invitaciones_usuarios(estado);
CREATE INDEX idx_invitaciones_expires ON invitaciones_usuarios(expires_at);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invitaciones_usuarios_updated_at
BEFORE UPDATE ON invitaciones_usuarios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE invitaciones_usuarios IS 'Invitaciones enviadas para registro de nuevos usuarios';
COMMENT ON COLUMN invitaciones_usuarios.token IS 'Token único para el enlace de registro';
COMMENT ON COLUMN invitaciones_usuarios.password_temporal IS 'Contraseña temporal hasheada (bcrypt)';
COMMENT ON COLUMN invitaciones_usuarios.estado IS 'Estado de la invitación: pendiente, aceptada, rechazada, expirada';
```

### 2.2. Ejecutar migración

```bash
# En servidor de producción
psql -h localhost -U osyris_user -d osyris_db -f api-osyris/database/migrations/002_create_invitaciones_usuarios.sql
```

**Estado:** ⏳ Pendiente

---

## ⭐ FASE 3: Sistema de Alta de Usuarios Robusto

**Prioridad:** Alta
**Estimación:** 2 horas

### 3.1. Formulario de Invitación

**Crear:** `app/admin/users/new/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Send } from 'lucide-react'

// Schema de validación
const invitacionSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  apellidos: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  rol: z.enum(['admin', 'scouter', 'familia']),
  seccion_id: z.number().optional(),
  enviar_email: z.boolean().default(true)
}).refine(data => {
  // Si el rol es 'scouter', la sección es obligatoria
  if (data.rol === 'scouter') {
    return data.seccion_id !== undefined
  }
  return true
}, {
  message: "La sección es obligatoria para monitores",
  path: ["seccion_id"]
})

type InvitacionForm = z.infer<typeof invitacionSchema>

export default function NewUserPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [emailChecking, setEmailChecking] = useState(false)
  const [secciones, setSecciones] = useState([])

  const form = useForm<InvitacionForm>({
    resolver: zodResolver(invitacionSchema),
    defaultValues: {
      enviar_email: true
    }
  })

  // Validación de email en tiempo real
  const checkEmailUnique = async (email: string) => {
    if (!email || !email.includes('@')) return

    setEmailChecking(true)
    try {
      const res = await fetch(`/api/usuarios/validate-email?email=${email}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await res.json()

      if (!data.disponible) {
        form.setError('email', { message: 'Este email ya está registrado' })
      }
    } catch (error) {
      console.error('Error validando email:', error)
    } finally {
      setEmailChecking(false)
    }
  }

  // Debounce para validación de email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    form.setValue('email', email)

    const timeout = setTimeout(() => {
      checkEmailUnique(email)
    }, 500)

    return () => clearTimeout(timeout)
  }

  const onSubmit = async (data: InvitacionForm) => {
    setLoading(true)

    try {
      const res = await fetch('/api/invitaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Error al crear invitación')
      }

      const result = await res.json()

      toast({
        title: "✅ Invitación enviada",
        description: `Se ha enviado una invitación a ${data.email}`
      })

      router.push('/admin/users')
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Invitar Nuevo Usuario</h1>
          <p className="text-muted-foreground">
            Envía una invitación por email para registrar un nuevo usuario
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Información Personal */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apellidos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellidos *</FormLabel>
                      <FormControl>
                        <Input placeholder="Pérez García" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="email@ejemplo.com"
                          {...field}
                          onChange={handleEmailChange}
                        />
                        {emailChecking && (
                          <span className="absolute right-3 top-3 text-sm text-muted-foreground">
                            Verificando...
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+34 600 123 456"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rol y Permisos */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="scouter">Monitor/Scouter</SelectItem>
                          <SelectItem value="familia">Familia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('rol') === 'scouter' && (
                  <FormField
                    control={form.control}
                    name="seccion_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sección *</FormLabel>
                        <Select onValueChange={(val) => field.onChange(Number(val))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar sección" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Castores</SelectItem>
                            <SelectItem value="2">Lobatos</SelectItem>
                            <SelectItem value="3">Tropa</SelectItem>
                            <SelectItem value="4">Pioneros</SelectItem>
                            <SelectItem value="5">Rutas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Opciones */}
              <FormField
                control={form.control}
                name="enviar_email"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel>Enviar email de invitación</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        El usuario recibirá un email con las instrucciones de registro
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Botones */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Enviando...' : 'Enviar Invitación'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 3.2. Backend - Controlador de Invitaciones

**Crear:** `api-osyris/src/controllers/invitaciones.controller.js`

```javascript
const pool = require('../config/db.config')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { enviarEmailInvitacion } = require('../utils/email.service')
const { generarPasswordTemporal } = require('../utils/password-generator')

// POST /api/invitaciones - Crear invitación
exports.crearInvitacion = async (req, res) => {
  const { nombre, apellidos, email, telefono, rol, seccion_id, enviar_email } = req.body

  try {
    // Validar que el email no esté ya registrado
    const usuarioExistente = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    )

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Este email ya está registrado'
      })
    }

    // Validar que no haya una invitación pendiente
    const invitacionExistente = await pool.query(
      'SELECT id FROM invitaciones_usuarios WHERE email = $1 AND estado = $2',
      [email, 'pendiente']
    )

    if (invitacionExistente.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una invitación pendiente para este email'
      })
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex')

    // Generar contraseña temporal
    const passwordTemporal = generarPasswordTemporal()
    const passwordHash = await bcrypt.hash(passwordTemporal, 10)

    // Fecha de expiración (7 días)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Crear invitación
    const result = await pool.query(
      `INSERT INTO invitaciones_usuarios
       (email, nombre, apellidos, telefono, rol, seccion_id, token, password_temporal, invitado_por, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, token`,
      [email, nombre, apellidos, telefono, rol, seccion_id, token, passwordHash, req.usuario.id, expiresAt]
    )

    const invitacion = result.rows[0]

    // Enviar email si está habilitado
    if (enviar_email) {
      await enviarEmailInvitacion({
        email,
        nombre,
        apellidos,
        token,
        password_temporal: passwordTemporal,
        rol
      })
    }

    res.status(201).json({
      success: true,
      message: 'Invitación creada correctamente',
      invitacion: {
        id: invitacion.id,
        email: invitacion.email,
        password_temporal: passwordTemporal // Solo para mostrar al admin
      }
    })

  } catch (error) {
    console.error('Error al crear invitación:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear invitación',
      error: error.message
    })
  }
}

// GET /api/invitaciones - Listar invitaciones
exports.listarInvitaciones = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.nombre as invitado_por_nombre, s.nombre as seccion_nombre
       FROM invitaciones_usuarios i
       LEFT JOIN usuarios u ON i.invitado_por = u.id
       LEFT JOIN secciones s ON i.seccion_id = s.id
       ORDER BY i.created_at DESC
       LIMIT 100`
    )

    res.json({
      success: true,
      invitaciones: result.rows
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al listar invitaciones',
      error: error.message
    })
  }
}

// GET /api/invitaciones/:token - Validar token (público)
exports.validarToken = async (req, res) => {
  const { token } = req.params

  try {
    const result = await pool.query(
      `SELECT id, email, nombre, apellidos, rol, estado, expires_at
       FROM invitaciones_usuarios
       WHERE token = $1`,
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Token inválido'
      })
    }

    const invitacion = result.rows[0]

    // Verificar si ha expirado
    if (new Date() > new Date(invitacion.expires_at)) {
      await pool.query(
        'UPDATE invitaciones_usuarios SET estado = $1 WHERE id = $2',
        ['expirada', invitacion.id]
      )

      return res.status(400).json({
        success: false,
        message: 'Esta invitación ha expirado'
      })
    }

    // Verificar estado
    if (invitacion.estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        message: `Esta invitación ya ha sido ${invitacion.estado}`
      })
    }

    res.json({
      success: true,
      invitacion
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al validar token',
      error: error.message
    })
  }
}

// DELETE /api/invitaciones/:id - Cancelar invitación
exports.cancelarInvitacion = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      'UPDATE invitaciones_usuarios SET estado = $1 WHERE id = $2 RETURNING *',
      ['rechazada', id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invitación no encontrada'
      })
    }

    res.json({
      success: true,
      message: 'Invitación cancelada'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cancelar invitación',
      error: error.message
    })
  }
}
```

### 3.3. Utilidades

**Crear:** `api-osyris/src/utils/password-generator.js`

```javascript
/**
 * Genera una contraseña temporal segura
 * Requisitos:
 * - 12 caracteres de longitud
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 * - Al menos 1 símbolo especial
 */
function generarPasswordTemporal() {
  const longitud = 12
  const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const minusculas = 'abcdefghijklmnopqrstuvwxyz'
  const numeros = '0123456789'
  const simbolos = '@#$%&*!?'
  const todosCaracteres = mayusculas + minusculas + numeros + simbolos

  let password = ''

  // Garantizar al menos 1 de cada tipo
  password += mayusculas[Math.floor(Math.random() * mayusculas.length)]
  password += minusculas[Math.floor(Math.random() * minusculas.length)]
  password += numeros[Math.floor(Math.random() * numeros.length)]
  password += simbolos[Math.floor(Math.random() * simbolos.length)]

  // Completar el resto
  for (let i = 4; i < longitud; i++) {
    password += todosCaracteres[Math.floor(Math.random() * todosCaracteres.length)]
  }

  // Mezclar caracteres para evitar patrón predecible
  return password.split('').sort(() => 0.5 - Math.random()).join('')
}

module.exports = { generarPasswordTemporal }
```

**Crear:** `api-osyris/src/utils/email.service.js`

```javascript
const nodemailer = require('nodemailer')

// Configurar transporte de email
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

/**
 * Envía email de invitación a un nuevo usuario
 */
async function enviarEmailInvitacion({ email, nombre, apellidos, token, password_temporal, rol }) {
  const linkInvitacion = `${process.env.FRONTEND_URL}/registro/${token}`

  const rolTexto = {
    'admin': 'Administrador',
    'scouter': 'Monitor/Scouter',
    'familia': 'Familia'
  }

  const htmlEmail = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #E74C3C 0%, #C0392B 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials { background: white; padding: 20px; border-left: 4px solid #E74C3C; margin: 20px 0; }
        .button { display: inline-block; background: #E74C3C; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏕️ Grupo Scout Osyris</h1>
          <p>Invitación al Sistema de Gestión</p>
        </div>

        <div class="content">
          <h2>¡Hola ${nombre}!</h2>

          <p>Has sido invitado a formar parte del sistema de gestión del <strong>Grupo Scout Osyris</strong> con el rol de <strong>${rolTexto[rol]}</strong>.</p>

          <div class="credentials">
            <h3>📧 Datos de acceso temporal:</h3>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Contraseña temporal:</strong> <code>${password_temporal}</code></li>
            </ul>
          </div>

          <p><strong>⚠️ IMPORTANTE:</strong></p>
          <ul>
            <li>Deberás <strong>cambiar tu contraseña</strong> al iniciar sesión por primera vez</li>
            <li>Este enlace <strong>expira en 7 días</strong></li>
            <li>No compartas esta información con nadie</li>
          </ul>

          <div style="text-align: center;">
            <a href="${linkInvitacion}" class="button">
              Completar Registro
            </a>
          </div>

          <p>Si no esperabas esta invitación, puedes ignorar este email.</p>
        </div>

        <div class="footer">
          <p>Grupo Scout Osyris - Valencia</p>
          <p>Este es un email automático, por favor no respondas.</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"Grupo Scout Osyris" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🏕️ Invitación al Sistema Osyris',
      html: htmlEmail
    })

    console.log(`✅ Email de invitación enviado a ${email}`)
    return { success: true }

  } catch (error) {
    console.error('❌ Error al enviar email:', error)
    throw error
  }
}

module.exports = { enviarEmailInvitacion }
```

### 3.4. Rutas

**Crear:** `api-osyris/src/routes/invitaciones.routes.js`

```javascript
const express = require('express')
const router = express.Router()
const invitacionesController = require('../controllers/invitaciones.controller')
const { verifyToken, requireRole } = require('../middleware/auth.middleware')

// Rutas protegidas (admin)
router.post('/', verifyToken, requireRole(['admin']), invitacionesController.crearInvitacion)
router.get('/', verifyToken, requireRole(['admin']), invitacionesController.listarInvitaciones)
router.delete('/:id', verifyToken, requireRole(['admin']), invitacionesController.cancelarInvitacion)

// Rutas públicas (para registro)
router.get('/:token', invitacionesController.validarToken)

module.exports = router
```

**Modificar:** `api-osyris/src/index.js` (añadir rutas)

```javascript
// ... otras rutas
const invitacionesRoutes = require('./routes/invitaciones.routes')

// ... en el app
app.use('/api/invitaciones', invitacionesRoutes)
```

### 3.5. Validación de email en tiempo real

**Modificar:** `api-osyris/src/routes/usuarios.routes.js`

```javascript
// GET /api/usuarios/validate-email - Validar email único
router.get('/validate-email', async (req, res) => {
  const { email } = req.query

  try {
    const usuario = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email])
    const invitacion = await pool.query(
      'SELECT id FROM invitaciones_usuarios WHERE email = $1 AND estado = $2',
      [email, 'pendiente']
    )

    const disponible = usuario.rows.length === 0 && invitacion.rows.length === 0

    res.json({ disponible })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

**Estado:** ⏳ Pendiente

---

## 🔄 FASE 4: Flujo de Registro del Usuario Invitado

**Prioridad:** Alta
**Estimación:** 2 horas

### 4.1. Página de Registro

**Crear:** `app/registro/[token]/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

const registroSchema = z.object({
  telefono: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  direccion: z.string().optional(),
  password_actual: z.string().min(8, 'La contraseña temporal es requerida'),
  password_nueva: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[@#$%&*!?]/, 'Debe contener al menos un símbolo especial'),
  password_confirmacion: z.string(),
  acepto_terminos: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones'
  })
}).refine(data => data.password_nueva === data.password_confirmacion, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmacion']
})

type RegistroForm = z.infer<typeof registroSchema>

export default function RegistroPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitacion, setInvitacion] = useState<any>(null)
  const [error, setError] = useState('')

  const form = useForm<RegistroForm>({
    resolver: zodResolver(registroSchema)
  })

  useEffect(() => {
    validarToken()
  }, [])

  const validarToken = async () => {
    try {
      const res = await fetch(`/api/invitaciones/${params.token}`)
      const data = await res.json()

      if (!data.success) {
        setError(data.message)
        return
      }

      setInvitacion(data.invitacion)
    } catch (err: any) {
      setError('Error al validar el enlace de invitación')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: RegistroForm) => {
    setSubmitting(true)

    try {
      const res = await fetch(`/api/invitaciones/${params.token}/completar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      toast({
        title: "✅ Registro completado",
        description: "Tu cuenta ha sido creada. Espera la aprobación del administrador."
      })

      // Redirigir a página de confirmación
      router.push('/registro/completado')

    } catch (err: any) {
      toast({
        title: "❌ Error",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md">
          <CardHeader>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-center">Enlace Inválido</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button className="w-full mt-4" onClick={() => router.push('/')}>
              Ir al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🏕️ Grupo Scout Osyris</h1>
          <p className="text-muted-foreground">Completa tu registro</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bienvenido/a, {invitacion?.nombre}</CardTitle>
            <CardDescription>
              Completa tu perfil para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Datos pre-cargados (solo lectura) */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Tus datos</h3>
              <p><strong>Nombre:</strong> {invitacion?.nombre} {invitacion?.apellidos}</p>
              <p><strong>Email:</strong> {invitacion?.email}</p>
              <p><strong>Rol:</strong> {invitacion?.rol}</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Información adicional */}
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+34 600 123 456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fecha_nacimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Calle, número, ciudad" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cambio de contraseña */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Cambiar Contraseña</h3>

                  <FormField
                    control={form.control}
                    name="password_actual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña Temporal *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Contraseña del email" {...field} />
                        </FormControl>
                        <FormDescription>
                          Introduce la contraseña temporal que recibiste por email
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password_nueva"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Nueva Contraseña *</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password_confirmacion"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Confirmar Contraseña *</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Términos y condiciones */}
                <FormField
                  control={form.control}
                  name="acepto_terminos"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Acepto los términos y condiciones *
                        </FormLabel>
                        <FormDescription>
                          Al registrarte aceptas nuestra política de privacidad
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Completar Registro
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### 4.2. Página de Confirmación

**Crear:** `app/registro/completado/page.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function RegistroCompletadoPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-center text-2xl">
            ¡Registro Completado!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Tu cuenta ha sido creada correctamente y está <strong>pendiente de aprobación</strong> por el administrador.
          </p>

          <p>
            Recibirás un email cuando tu cuenta sea aprobada y puedas iniciar sesión.
          </p>

          <Button asChild className="w-full">
            <Link href="/">Ir al Inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 4.3. Backend - Completar Registro

**Modificar:** `api-osyris/src/controllers/invitaciones.controller.js` (añadir método)

```javascript
// POST /api/invitaciones/:token/completar - Completar registro
exports.completarRegistro = async (req, res) => {
  const { token } = req.params
  const { telefono, fecha_nacimiento, direccion, password_actual, password_nueva } = req.body

  try {
    // Obtener invitación
    const invitacion = await pool.query(
      'SELECT * FROM invitaciones_usuarios WHERE token = $1',
      [token]
    )

    if (invitacion.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Token inválido' })
    }

    const inv = invitacion.rows[0]

    // Verificar contraseña temporal
    const passwordMatch = await bcrypt.compare(password_actual, inv.password_temporal)
    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña temporal incorrecta'
      })
    }

    // Hash de nueva contraseña
    const passwordHash = await bcrypt.hash(password_nueva, 10)

    // Crear usuario (activo=false hasta aprobación)
    const nuevoUsuario = await pool.query(
      `INSERT INTO usuarios
       (nombre, apellidos, email, telefono, fecha_nacimiento, direccion, contraseña, rol, seccion_id, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
       RETURNING id, email`,
      [inv.nombre, inv.apellidos, inv.email, telefono, fecha_nacimiento, direccion, passwordHash, inv.rol, inv.seccion_id]
    )

    // Actualizar invitación
    await pool.query(
      `UPDATE invitaciones_usuarios
       SET estado = 'aceptada', fecha_registro_completado = NOW()
       WHERE id = $1`,
      [inv.id]
    )

    res.json({
      success: true,
      message: 'Registro completado. Pendiente de aprobación.',
      usuario: nuevoUsuario.rows[0]
    })

  } catch (error) {
    console.error('Error al completar registro:', error)
    res.status(500).json({
      success: false,
      message: 'Error al completar registro',
      error: error.message
    })
  }
}
```

**Modificar:** `api-osyris/src/routes/invitaciones.routes.js` (añadir ruta)

```javascript
router.post('/:token/completar', invitacionesController.completarRegistro)
```

### 4.4. Sistema de Aprobación

**Crear:** `app/admin/users/pending/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function PendingUsersPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    cargarUsuariosPendientes()
  }, [])

  const cargarUsuariosPendientes = async () => {
    try {
      const res = await fetch('/api/usuarios/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await res.json()
      setUsuarios(data.usuarios)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const aprobarUsuario = async (id: number) => {
    try {
      const res = await fetch(`/api/usuarios/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!res.ok) throw new Error('Error al aprobar')

      toast({
        title: "✅ Usuario aprobado",
        description: "El usuario ya puede iniciar sesión"
      })

      cargarUsuariosPendientes()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo aprobar el usuario",
        variant: "destructive"
      })
    }
  }

  const rechazarUsuario = async (id: number) => {
    if (!confirm('¿Rechazar este usuario? Esta acción no se puede deshacer.')) return

    try {
      const res = await fetch(`/api/usuarios/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!res.ok) throw new Error('Error al rechazar')

      toast({
        title: "Usuario rechazado",
        description: "El registro ha sido eliminado"
      })

      cargarUsuariosPendientes()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo rechazar el usuario",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuarios Pendientes de Aprobación</h1>
        <p className="text-muted-foreground">
          Revisa y aprueba los nuevos registros
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{usuarios.length} usuario(s) pendiente(s)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.nombre} {user.apellidos}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge>{user.rol}</Badge></TableCell>
                  <TableCell>{new Date(user.fecha_registro).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => aprobarUsuario(user.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rechazarUsuario(user.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rechazar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Backend - Rutas de Aprobación:**

**Modificar:** `api-osyris/src/routes/usuarios.routes.js`

```javascript
// GET /api/usuarios/pending - Usuarios pendientes
router.get('/pending', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, s.nombre as seccion_nombre
       FROM usuarios u
       LEFT JOIN secciones s ON u.seccion_id = s.id
       WHERE u.activo = false
       ORDER BY u.fecha_registro DESC`
    )

    res.json({ success: true, usuarios: result.rows })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/usuarios/:id/approve - Aprobar usuario
router.post('/:id/approve', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    await pool.query('UPDATE usuarios SET activo = true WHERE id = $1', [req.params.id])

    // TODO: Enviar email de confirmación al usuario

    res.json({ success: true, message: 'Usuario aprobado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /api/usuarios/:id/reject - Rechazar usuario
router.post('/:id/reject', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id])

    // TODO: Enviar email de notificación al usuario

    res.json({ success: true, message: 'Usuario rechazado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

**Estado:** ⏳ Pendiente

---

## 📥 FASE 5: Alta Masiva (Bulk Import)

**Prioridad:** Media
**Estimación:** 2 horas

### 5.1. Instalar dependencias

```bash
npm install papaparse xlsx
npm install --save-dev @types/papaparse
```

### 5.2. Componente de Importación

**Crear:** `app/admin/users/bulk/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Download, Upload, FileText, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Papa from 'papaparse'

export default function BulkImportPage() {
  const [preview, setPreview] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultado, setResultado] = useState<any>(null)
  const { toast } = useToast()

  const descargarTemplate = () => {
    const template = `nombre,apellidos,email,telefono,rol,seccion_nombre
Juan,Pérez García,juan.perez@email.com,+34600123456,scouter,Tropa
María,López Ruiz,maria.lopez@email.com,+34610987654,familia,
Carlos,Sánchez Vega,carlos.sanchez@email.com,,admin,`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_usuarios.csv'
    a.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validados = results.data.map((row: any, i) => {
          const errores = []

          if (!row.nombre) errores.push('Nombre requerido')
          if (!row.apellidos) errores.push('Apellidos requeridos')
          if (!row.email || !row.email.includes('@')) errores.push('Email inválido')
          if (!['admin', 'scouter', 'familia'].includes(row.rol)) errores.push('Rol inválido')
          if (row.rol === 'scouter' && !row.seccion_nombre) errores.push('Sección requerida para scouters')

          return {
            ...row,
            error: errores.length > 0 ? errores.join(', ') : null
          }
        })

        setPreview(validados)
      }
    })
  }

  const procesarImportacion = async () => {
    const usuariosValidos = preview.filter(u => !u.error)

    if (usuariosValidos.length === 0) {
      toast({
        title: "❌ Error",
        description: "No hay usuarios válidos para importar",
        variant: "destructive"
      })
      return
    }

    setImporting(true)
    setProgress(0)

    try {
      const res = await fetch('/api/invitaciones/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ usuarios: usuariosValidos })
      })

      const data = await res.json()
      setResultado(data.resultados)
      setProgress(100)

      toast({
        title: "✅ Importación completada",
        description: `${data.resultados.exitos.length} usuarios importados`
      })

    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Error al importar usuarios",
        variant: "destructive"
      })
    } finally {
      setImporting(false)
    }
  }

  const hayErrores = preview.some(u => u.error)
  const usuariosValidos = preview.filter(u => !u.error).length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📥 Importación Masiva de Usuarios</h1>
        <p className="text-muted-foreground">
          Importa múltiples usuarios desde un archivo CSV o Excel
        </p>
      </div>

      {/* Paso 1: Descargar template */}
      <Card>
        <CardHeader>
          <CardTitle>Paso 1: Descargar Plantilla</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={descargarTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Descargar Plantilla CSV
          </Button>
        </CardContent>
      </Card>

      {/* Paso 2: Upload archivo */}
      <Card>
        <CardHeader>
          <CardTitle>Paso 2: Subir Archivo</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-red-50 file:text-red-700
              hover:file:bg-red-100"
          />
        </CardContent>
      </Card>

      {/* Paso 3: Preview */}
      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 3: Vista Previa ({preview.length} usuarios)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row, i) => (
                    <TableRow key={i} className={row.error ? 'bg-red-50' : ''}>
                      <TableCell>{row.nombre} {row.apellidos}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.rol}</TableCell>
                      <TableCell>
                        {row.error ? (
                          <Badge variant="destructive">{row.error}</Badge>
                        ) : (
                          <Badge variant="default">✓ Válido</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paso 4: Importar */}
      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Paso 4: Importar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hayErrores && (
              <Alert variant="destructive">
                <AlertTitle>Hay errores en el archivo</AlertTitle>
                <AlertDescription>
                  Corrige los errores antes de importar o se omitirán las filas con errores
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={procesarImportacion}
              disabled={importing || usuariosValidos === 0}
              className="w-full"
            >
              {importing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar {usuariosValidos} usuarios válidos
                </>
              )}
            </Button>

            {importing && (
              <div>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {progress}% completado
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Paso 5: Resultado */}
      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado de la Importación</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTitle>Importación completada</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>✅ {resultado.exitos.length} usuarios creados correctamente</li>
                  {resultado.advertencias.length > 0 && (
                    <li>⚠️ {resultado.advertencias.length} advertencias</li>
                  )}
                  {resultado.errores.length > 0 && (
                    <li>❌ {resultado.errores.length} errores</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### 5.3. Backend - Bulk Create

**Modificar:** `api-osyris/src/controllers/invitaciones.controller.js`

```javascript
// POST /api/invitaciones/bulk - Importación masiva
exports.importacionMasiva = async (req, res) => {
  const { usuarios } = req.body

  const resultados = {
    exitos: [],
    errores: [],
    advertencias: []
  }

  for (const user of usuarios) {
    try {
      // Validar email único
      const existe = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [user.email]
      )

      if (existe.rows.length > 0) {
        resultados.advertencias.push({
          email: user.email,
          mensaje: 'Email ya existe, omitido'
        })
        continue
      }

      // Buscar seccion_id si se proporcionó nombre
      let seccion_id = null
      if (user.seccion_nombre) {
        const seccion = await pool.query(
          'SELECT id FROM secciones WHERE nombre ILIKE $1',
          [user.seccion_nombre]
        )
        seccion_id = seccion.rows[0]?.id || null
      }

      // Generar contraseña temporal
      const passwordTemporal = generarPasswordTemporal()
      const passwordHash = await bcrypt.hash(passwordTemporal, 10)

      // Generar token
      const token = crypto.randomBytes(32).toString('hex')

      // Fecha de expiración
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      // Crear invitación
      await pool.query(
        `INSERT INTO invitaciones_usuarios
         (email, nombre, apellidos, telefono, rol, seccion_id, token, password_temporal, invitado_por, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [user.email, user.nombre, user.apellidos, user.telefono, user.rol, seccion_id, token, passwordHash, req.usuario.id, expiresAt]
      )

      // Enviar email
      await enviarEmailInvitacion({
        email: user.email,
        nombre: user.nombre,
        apellidos: user.apellidos,
        token,
        password_temporal: passwordTemporal,
        rol: user.rol
      })

      resultados.exitos.push({ email: user.email })

    } catch (error) {
      resultados.errores.push({
        email: user.email,
        error: error.message
      })
    }
  }

  res.json({ success: true, resultados })
}
```

**Modificar:** `api-osyris/src/routes/invitaciones.routes.js`

```javascript
router.post('/bulk', verifyToken, requireRole(['admin']), invitacionesController.importacionMasiva)
```

**Estado:** ⏳ Pendiente

---

## 📊 FASE 6: Dashboard Principal Renovado

**Prioridad:** Media
**Estimación:** 1 hora

### 6.1. Dashboard con Notificaciones

**Modificar:** `app/admin/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Bell, UserPlus, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({})
  const [usuariosPendientes, setUsuariosPendientes] = useState<any[]>([])
  const [ultimasInvitaciones, setUltimasInvitaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('token')

      // Cargar estadísticas
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const statsData = await statsRes.json()
      setStats(statsData)

      // Cargar usuarios pendientes
      const pendingRes = await fetch('/api/usuarios/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const pendingData = await pendingRes.json()
      setUsuariosPendientes(pendingData.usuarios || [])

      // Cargar últimas invitaciones
      const invRes = await fetch('/api/invitaciones?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const invData = await invRes.json()
      setUltimasInvitaciones(invData.invitaciones || [])

    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Notificación de usuarios pendientes */}
      {usuariosPendientes.length > 0 && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertTitle>
            {usuariosPendientes.length} usuario(s) pendiente(s) de aprobación
          </AlertTitle>
          <AlertDescription>
            Hay nuevos registros esperando tu aprobación
          </AlertDescription>
          <Button asChild className="mt-2">
            <Link href="/admin/users/pending">Revisar ahora</Link>
          </Button>
        </Alert>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Totales
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_usuarios || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.usuarios_ultimo_mes || 0} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Invitaciones Pendientes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.invitaciones_pendientes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sin aceptar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aprobaciones Pendientes
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuariosPendientes.length}</div>
            <p className="text-xs text-muted-foreground">
              Registros completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Activos
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usuarios_activos || 0}</div>
            <p className="text-xs text-muted-foreground">
              Con acceso al sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Últimas Invitaciones */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Últimas Invitaciones</CardTitle>
            <Button asChild>
              <Link href="/admin/users/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Nueva Invitación
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Enviada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ultimasInvitaciones.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.nombre} {inv.apellidos}</TableCell>
                  <TableCell>{inv.email}</TableCell>
                  <TableCell><Badge>{inv.rol}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={
                      inv.estado === 'aceptada' ? 'default' :
                      inv.estado === 'pendiente' ? 'secondary' :
                      'destructive'
                    }>
                      {inv.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(inv.created_at), {
                      addSuffix: true,
                      locale: es
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 6.2. Endpoint de Estadísticas

**Crear:** `api-osyris/src/routes/admin.routes.js`

```javascript
const express = require('express')
const router = express.Router()
const pool = require('../config/db.config')
const { verifyToken, requireRole } = require('../middleware/auth.middleware')

// GET /api/admin/stats - Estadísticas del sistema
router.get('/stats', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    // Total de usuarios
    const totalUsuarios = await pool.query('SELECT COUNT(*) as count FROM usuarios')

    // Usuarios del último mes
    const usuariosUltimoMes = await pool.query(
      `SELECT COUNT(*) as count FROM usuarios
       WHERE fecha_registro >= NOW() - INTERVAL '30 days'`
    )

    // Invitaciones pendientes
    const invitacionesPendientes = await pool.query(
      `SELECT COUNT(*) as count FROM invitaciones_usuarios
       WHERE estado = 'pendiente'`
    )

    // Usuarios activos
    const usuariosActivos = await pool.query(
      'SELECT COUNT(*) as count FROM usuarios WHERE activo = true'
    )

    res.json({
      total_usuarios: parseInt(totalUsuarios.rows[0].count),
      usuarios_ultimo_mes: parseInt(usuariosUltimoMes.rows[0].count),
      invitaciones_pendientes: parseInt(invitacionesPendientes.rows[0].count),
      usuarios_activos: parseInt(usuariosActivos.rows[0].count)
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
```

**Modificar:** `api-osyris/src/index.js`

```javascript
const adminRoutes = require('./routes/admin.routes')
app.use('/api/admin', adminRoutes)
```

**Estado:** ⏳ Pendiente

---

## 📦 Dependencias NPM Necesarias

### Frontend

```json
{
  "dependencies": {
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.4",
    "zod": "^3.22.4",
    "papaparse": "^5.4.1",
    "xlsx": "^0.18.5",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/papaparse": "^5.3.14"
  }
}
```

### Backend

```json
{
  "dependencies": {
    "nodemailer": "^6.9.7",
    "multer": "^1.4.5-lts.1"
  }
}
```

### Instalar

```bash
# Frontend
npm install react-hook-form @hookform/resolvers zod papaparse xlsx date-fns
npm install --save-dev @types/papaparse

# Backend
cd api-osyris
npm install nodemailer multer
```

---

## 🔧 Variables de Entorno

**Añadir a `api-osyris/.env`:**

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@gruposcoutosyris.es
SMTP_PASS=tu_password_app

# Frontend URL
FRONTEND_URL=https://www.gruposcoutosyris.es
```

---

## ✅ Checklist de Implementación

### FASE 1: Resolver 404 ⏳
- [ ] Crear `app/admin/files/page.tsx`
- [ ] Crear `api-osyris/src/routes/archivos.routes.js`
- [ ] Instalar `multer` en backend
- [ ] Crear carpeta `uploads/`
- [ ] Probar subida y eliminación de archivos

### FASE 2: Base de Datos ⏳
- [ ] Ejecutar script SQL de `invitaciones_usuarios`
- [ ] Verificar índices creados
- [ ] Verificar triggers funcionando

### FASE 3: Formulario de Invitación ⏳
- [ ] Crear `app/admin/users/new/page.tsx`
- [ ] Crear `api-osyris/src/controllers/invitaciones.controller.js`
- [ ] Crear `api-osyris/src/utils/password-generator.js`
- [ ] Crear `api-osyris/src/utils/email.service.js`
- [ ] Crear `api-osyris/src/routes/invitaciones.routes.js`
- [ ] Añadir validación de email en tiempo real
- [ ] Configurar SMTP
- [ ] Probar envío de emails

### FASE 4: Flujo de Registro ⏳
- [ ] Crear `app/registro/[token]/page.tsx`
- [ ] Crear `app/registro/completado/page.tsx`
- [ ] Implementar `completarRegistro()` en controller
- [ ] Crear `app/admin/users/pending/page.tsx`
- [ ] Implementar rutas de aprobación/rechazo
- [ ] Probar flujo completo de registro

### FASE 5: Bulk Import ⏳
- [ ] Instalar `papaparse` y `xlsx`
- [ ] Crear `app/admin/users/bulk/page.tsx`
- [ ] Implementar `importacionMasiva()` en controller
- [ ] Crear template CSV descargable
- [ ] Probar importación con archivo de prueba

### FASE 6: Dashboard ⏳
- [ ] Modificar `app/admin/page.tsx`
- [ ] Crear `api-osyris/src/routes/admin.routes.js`
- [ ] Implementar endpoint de estadísticas
- [ ] Añadir notificaciones en dashboard
- [ ] Probar visualización de datos

---

## 🚀 Orden de Implementación Recomendado

1. **Día 1 (3-4 horas)**
   - ✅ FASE 1: Resolver 404 de /admin/files (30 min)
   - ✅ FASE 2: Crear tabla de invitaciones (15 min)
   - ✅ FASE 3: Sistema de invitaciones (2h)

2. **Día 2 (3-4 horas)**
   - ✅ FASE 4: Flujo completo de registro (2h)
   - ✅ FASE 6: Dashboard renovado (1h)

3. **Día 3 (2 horas) - Opcional**
   - ✅ FASE 5: Bulk import (2h)
   - Testing completo
   - Ajustes finales

---

## 🎯 Estado Actual

| Fase | Descripción | Estado | Prioridad | Estimación |
|------|-------------|--------|-----------|------------|
| 1 | Resolver 404 de /admin/files | ⏳ Pendiente | URGENTE | 30 min |
| 2 | Crear tabla invitaciones | ⏳ Pendiente | Alta | 15 min |
| 3 | Formulario de invitación | ⏳ Pendiente | Alta | 2 horas |
| 4 | Flujo de registro | ⏳ Pendiente | Alta | 2 horas |
| 5 | Bulk import | ⏳ Pendiente | Media | 2 horas |
| 6 | Dashboard renovado | ⏳ Pendiente | Media | 1 hora |

**Total estimado:** ~7.5 horas de desarrollo

---

## 📝 Notas Importantes

1. **Seguridad:**
   - Todas las rutas de admin requieren autenticación JWT
   - Validación de roles en cada endpoint
   - Contraseñas hasheadas con bcrypt
   - Tokens únicos para invitaciones

2. **Base de Datos:**
   - PostgreSQL 15 en producción (Hetzner)
   - Índices para optimización de consultas
   - Triggers para `updated_at` automático

3. **Emails:**
   - Configurar SMTP antes de usar sistema de invitaciones
   - Templates HTML para emails profesionales
   - Manejo de errores en envío de emails

4. **UX:**
   - Validaciones en tiempo real
   - Feedback visual inmediato
   - Responsive design completo
   - Accesibilidad WCAG 2.1 AA

---

## 🔗 Referencias

- **CLAUDE.md:** [/home/vicente/RoadToDevOps/osyris/Osyris-Web/CLAUDE.md](CLAUDE.md)
- **Base de datos:** PostgreSQL 15 en Hetzner (116.203.98.142)
- **Documentación diseño:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

---

**Última actualización:** 8 de octubre de 2025
**Autor:** Vicente Rivas Monferrer
**Proyecto:** Osyris Scout Management System
