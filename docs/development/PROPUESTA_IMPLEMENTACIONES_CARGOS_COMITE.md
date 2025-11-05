# 📋 Propuesta de Implementaciones - Sistema de Cargos del Comité

> **Documento generado:** 2025-11-05
> **Estado del proyecto:** Análisis completado
> **Versión actual:** 2.0.0

---

## 📊 Resumen Ejecutivo

Este documento presenta una **propuesta completa y priorizada** de implementaciones para el sistema Osyris, basada en las necesidades expresadas por cada cargo del comité.

### Necesidad Principal Identificada
**Sistema de gestión de cargos del comité** con áreas de responsabilidad específicas, que permita:
- Asignar cargos a miembros del comité
- Definir áreas de responsabilidad para cada cargo
- Crear módulos especializados para cada área
- Permitir colaboración entre cargos

---

## 🎯 Cargos Identificados y sus Necesidades

### 📝 Lista de Cargos del Comité
1. **Tesorería** (Álvaro López Polo)
2. **Búsqueda de Campamento** (Rebrú)
3. **Material** (Joan Maiques Garcés)
4. **Secretaría** (Héctor Rivas Monferrer)
5. **Transporte**
6. **Comunicación con Patro**
7. **Sostenibilidad** (Dani)
8. **Espiritualidad** (Héctor)
9. **Festival de la Canción** (Álvaro Santandreu)
10. **Subvenciones** (Rebrú)
11. **Circulares** (Héctor)
12. **Entorno Seguro** (Amelia)
13. **Dinamikraal**
14. **Ambientación** (Joan Maiques Garcés)
15. **Redes** (Lekes, Amelia)
16. **Animación Pedagógica**
17. **Comité** (Coordinación general)

---

## 🏗️ Arquitectura Propuesta

### 1️⃣ **FASE 0: Sistema Base de Cargos**
> **Prioridad:** 🔴 CRÍTICA - Base para todo lo demás
> **Complejidad:** Media (3-4 días)
> **Impacto:** Alto (desbloquea todo el resto)

#### Nuevas Tablas de Base de Datos

```sql
-- Tabla de cargos del comité
CREATE TABLE cargos_comite (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  icono VARCHAR(50), -- emoji o nombre de icono
  color VARCHAR(7), -- hex color para UI
  areas_responsabilidad TEXT[], -- array de áreas
  activo BOOLEAN DEFAULT true,
  orden_visualizacion INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de asignación usuario-cargo
CREATE TABLE usuario_cargo (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  cargo_id INTEGER NOT NULL REFERENCES cargos_comite(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE, -- NULL = cargo activo
  es_principal BOOLEAN DEFAULT true, -- puede tener varios cargos
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, cargo_id, fecha_inicio)
);

-- Tabla de módulos/áreas específicas
CREATE TABLE modulos_cargo (
  id SERIAL PRIMARY KEY,
  cargo_id INTEGER NOT NULL REFERENCES cargos_comite(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL, -- ej: "Inventario", "Plantillas Circulares"
  tipo VARCHAR(50) NOT NULL, -- 'documentos', 'inventario', 'plantillas', 'historial'
  descripcion TEXT,
  configuracion JSONB, -- config específica del módulo
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_usuario_cargo_usuario ON usuario_cargo(usuario_id);
CREATE INDEX idx_usuario_cargo_cargo ON usuario_cargo(cargo_id);
CREATE INDEX idx_modulos_cargo_cargo ON modulos_cargo(cargo_id);
```

#### API Endpoints Necesarios

```javascript
// Gestión de Cargos (solo Admin)
GET    /api/cargos                    // Listar todos los cargos
GET    /api/cargos/:id                // Obtener cargo específico
POST   /api/cargos                    // Crear cargo (admin)
PUT    /api/cargos/:id                // Actualizar cargo (admin)
DELETE /api/cargos/:id                // Eliminar cargo (admin)

// Asignación de cargos
GET    /api/cargos/:id/miembros       // Miembros con ese cargo
POST   /api/cargos/:id/asignar        // Asignar cargo a usuario
PUT    /api/usuario-cargo/:id         // Actualizar asignación
DELETE /api/usuario-cargo/:id         // Remover cargo

// Mis cargos (usuario autenticado)
GET    /api/mis-cargos                // Cargos del usuario autenticado
GET    /api/mis-cargos/:id/modulos    // Módulos de mi cargo

// Módulos de cargo
GET    /api/cargos/:id/modulos        // Módulos de un cargo
POST   /api/cargos/:id/modulos        // Crear módulo
PUT    /api/modulos/:id               // Actualizar módulo
DELETE /api/modulos/:id               // Eliminar módulo
```

#### Componentes Frontend

```typescript
// src/app/admin/cargos/
// - page.tsx              → Lista de cargos
// - [id]/page.tsx         → Detalle cargo
// - [id]/miembros/        → Miembros del cargo
// - [id]/modulos/         → Módulos del cargo
// - crear/page.tsx        → Crear nuevo cargo

// src/app/mi-cargo/
// - page.tsx              → Dashboard "Mi Cargo"
// - [modulo]/page.tsx     → Vista de módulo específico

// src/components/cargos/
// - CargoCard.tsx         → Tarjeta de cargo
// - AsignarCargoDialog.tsx → Modal asignación
// - CargosSelector.tsx    → Selector múltiple
// - MisCargosWidget.tsx   → Widget para dashboard
```

#### Hooks Personalizados

```typescript
// src/hooks/useCargos.ts
export const useCargos = () => {
  // Listar, crear, actualizar, eliminar cargos
}

// src/hooks/useMisCargos.ts
export const useMisCargos = () => {
  // Obtener cargos del usuario actual
}

// src/hooks/useCargoModulos.ts
export const useCargoModulos = (cargoId) => {
  // Obtener módulos de un cargo
}
```

---

## 🎯 MÓDULOS POR ÁREA DE RESPONSABILIDAD

### 2️⃣ **Módulo de Tesorería**
> **Responsable:** Álvaro López Polo
> **Prioridad:** 🟠 Alta
> **Complejidad:** Alta (5-7 días)
> **Depende de:** Fase 0 (Sistema de Cargos)

#### Funcionalidades Requeridas

**A. Sistema de Subida de Facturas (Secciones)**
- Formulario para subir facturas por sección
- Adjuntar imagen (foto/PDF)
- Campos: importe, descripción, partida general, partida específica
- UID autoincremental (M01, M02...)
- Guardado automático en carpeta estructurada

**B. Cuentas Internas por Usuario**
- Registro de pagos adelantados
- Estado "pendiente de devolución"
- Descuento automático al marcar como pagado
- Vista de quién tiene pagos pendientes

**C. Panel de Tesorería**
- Resumen de todas las facturas subidas
- Filtros por: sección, estado, usuario, fecha
- Marcar facturas como "pagadas"
- Marcar como "subida a Duroc"
- Exportación a Excel/CSV

**D. Gestión de Pagos de Familias**
- Familias suben justificantes de pago
- Familias con varios hijos: adjuntar misma factura
- Selector de "a qué hijo corresponde"
- Sistema de "pago pendiente" al inscribirse
- Total pendiente por familia/educando
- Separación por conceptos: campamento, cuotas, etc.

#### Estructura de Datos

```sql
-- Partidas presupuestarias
CREATE TABLE partidas_presupuestarias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(20) UNIQUE NOT NULL, -- ej: "ASG-CASTORES"
  partida_padre_id INTEGER REFERENCES partidas_presupuestarias(id),
  seccion_id INTEGER REFERENCES secciones(id),
  presupuesto_anual DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facturas subidas por secciones/monitores
CREATE TABLE facturas (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(20) UNIQUE NOT NULL, -- M001, M002...
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  seccion_id INTEGER REFERENCES secciones(id),
  partida_id INTEGER REFERENCES partidas_presupuestarias(id),
  importe DECIMAL(10,2) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_factura DATE NOT NULL,
  archivo_url TEXT NOT NULL, -- ruta al archivo
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, pagada, rechazada
  subida_duroc BOOLEAN DEFAULT false,
  fecha_pago DATE,
  notas_tesoreria TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cuentas internas de usuarios (adelantos)
CREATE TABLE cuentas_usuarios (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) UNIQUE,
  saldo_pendiente DECIMAL(10,2) DEFAULT 0.00,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Movimientos de cuentas
CREATE TABLE movimientos_cuenta (
  id SERIAL PRIMARY KEY,
  cuenta_id INTEGER NOT NULL REFERENCES cuentas_usuarios(id),
  factura_id INTEGER REFERENCES facturas(id),
  tipo VARCHAR(20) NOT NULL, -- 'adelanto', 'devolucion'
  importe DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pagos de familias
CREATE TABLE pagos_familias (
  id SERIAL PRIMARY KEY,
  familia_id INTEGER NOT NULL REFERENCES usuarios(id),
  educando_id INTEGER REFERENCES educandos(id), -- NULL = pago general
  concepto VARCHAR(100) NOT NULL, -- 'campamento_verano', 'cuota_trimestral'
  importe_total DECIMAL(10,2) NOT NULL,
  importe_pagado DECIMAL(10,2) DEFAULT 0.00,
  justificante_url TEXT,
  fecha_limite DATE,
  estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, parcial, completado
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Justificantes de pago (familias pueden subir varios)
CREATE TABLE justificantes_pago (
  id SERIAL PRIMARY KEY,
  pago_familia_id INTEGER NOT NULL REFERENCES pagos_familias(id),
  archivo_url TEXT NOT NULL,
  importe DECIMAL(10,2) NOT NULL,
  fecha_pago DATE NOT NULL,
  validado BOOLEAN DEFAULT false,
  fecha_validacion TIMESTAMP,
  validado_por INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints

```javascript
// Facturas (Monitores/Secciones)
POST   /api/tesoreria/facturas           // Subir nueva factura
GET    /api/tesoreria/facturas           // Listar (con filtros)
GET    /api/tesoreria/facturas/:id       // Detalle
PUT    /api/tesoreria/facturas/:id       // Actualizar
DELETE /api/tesoreria/facturas/:id       // Eliminar

// Panel Tesorería (solo cargo Tesorería)
GET    /api/tesoreria/dashboard          // Resumen general
PATCH  /api/tesoreria/facturas/:id/pagar // Marcar como pagada
PATCH  /api/tesoreria/facturas/:id/duroc // Marcar subida a Duroc
GET    /api/tesoreria/exportar           // Exportar CSV/Excel

// Cuentas internas
GET    /api/tesoreria/cuentas            // Todas las cuentas
GET    /api/tesoreria/cuentas/:id        // Cuenta específica
GET    /api/tesoreria/mis-adelantos      // Adelantos del usuario actual

// Pagos de familias
POST   /api/tesoreria/pagos-familias            // Crear concepto de pago
GET    /api/tesoreria/pagos-familias            // Listar
POST   /api/tesoreria/pagos-familias/:id/justificante // Subir justificante
PATCH  /api/tesoreria/pagos-familias/:id/validar      // Validar pago

// Portal Familia
GET    /api/familia/mis-pagos           // Pagos pendientes de la familia
POST   /api/familia/mis-pagos/:id/justificante // Subir justificante
```

---

### 3️⃣ **Módulo de Inventario y Material**
> **Responsables:** Héctor Rivas Monferrer, Joan Maiques Garcés
> **Prioridad:** 🟠 Alta
> **Complejidad:** Media-Alta (4-5 días)
> **Depende de:** Fase 0

#### Funcionalidades Requeridas

**A. Inventario Completo**
- Lista completa de material del grupo
- Ubicación física de cada item
- Estado: disponible, en uso, roto, perdido
- Cantidad y unidades
- Foto del material
- Responsable asignado
- Historial de uso

**B. Plan de Almacenamiento**
- Estructura jerárquica: Local → Estantería → Caja/Cajón
- Mapeo visual de dónde está cada cosa
- Sistema de etiquetas/códigos QR
- Plan de organización a largo plazo

**C. Sistema de Préstamos**
- Registro de quién tiene qué material
- Fecha de préstamo y devolución esperada
- Recordatorios automáticos
- Estado del material al devolver

**D. Proveedores y Contactos**
- Listado de proveedores principales
- Historial de compras a cada proveedor
- Grado de satisfacción (1-5 estrellas)
- Notas sobre cada proveedor
- Contactos principales

#### Estructura de Datos

```sql
-- Ubicaciones físicas
CREATE TABLE ubicaciones_material (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL, -- "Local Principal", "Almacén Campamentos"
  ubicacion_padre_id INTEGER REFERENCES ubicaciones_material(id),
  tipo VARCHAR(50), -- 'local', 'estanteria', 'caja', 'cajon'
  descripcion TEXT,
  codigo_qr TEXT UNIQUE,
  foto_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categorías de material
CREATE TABLE categorias_material (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  icono VARCHAR(50),
  categoria_padre_id INTEGER REFERENCES categorias_material(id),
  orden INTEGER
);

-- Inventario
CREATE TABLE inventario (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL, -- OSY-MAT-001
  nombre VARCHAR(200) NOT NULL,
  categoria_id INTEGER REFERENCES categorias_material(id),
  ubicacion_id INTEGER REFERENCES ubicaciones_material(id),
  cantidad INTEGER DEFAULT 1,
  unidad VARCHAR(20) DEFAULT 'unidad', -- unidad, metro, kilo
  estado VARCHAR(50) DEFAULT 'disponible', -- disponible, en_uso, roto, perdido
  descripcion TEXT,
  foto_url TEXT,
  valor_estimado DECIMAL(10,2),
  fecha_adquisicion DATE,
  responsable_id INTEGER REFERENCES usuarios(id),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Préstamos de material
CREATE TABLE prestamos_material (
  id SERIAL PRIMARY KEY,
  inventario_id INTEGER NOT NULL REFERENCES inventario(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  cantidad INTEGER NOT NULL,
  fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_devolucion_prevista DATE NOT NULL,
  fecha_devolucion_real TIMESTAMP,
  estado_devolucion VARCHAR(50), -- 'buen_estado', 'danado', 'perdido'
  notas_prestamo TEXT,
  notas_devolucion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proveedores
CREATE TABLE proveedores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  cif VARCHAR(20),
  email VARCHAR(255),
  telefono VARCHAR(20),
  direccion TEXT,
  web TEXT,
  contacto_principal VARCHAR(200),
  valoracion INTEGER CHECK (valoracion BETWEEN 1 AND 5),
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historial de compras a proveedores
CREATE TABLE compras_proveedor (
  id SERIAL PRIMARY KEY,
  proveedor_id INTEGER NOT NULL REFERENCES proveedores(id),
  fecha_compra DATE NOT NULL,
  importe DECIMAL(10,2),
  descripcion TEXT,
  factura_id INTEGER REFERENCES facturas(id), -- relación con tesorería
  valoracion_compra INTEGER CHECK (valoracion_compra BETWEEN 1 AND 5),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historial de cambios en inventario
CREATE TABLE historial_inventario (
  id SERIAL PRIMARY KEY,
  inventario_id INTEGER NOT NULL REFERENCES inventario(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  tipo_cambio VARCHAR(50) NOT NULL, -- 'creacion', 'actualizacion', 'cambio_ubicacion', 'cambio_estado'
  campo_modificado VARCHAR(100),
  valor_anterior TEXT,
  valor_nuevo TEXT,
  notas TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints

```javascript
// Inventario
GET    /api/inventario                  // Listar (con filtros)
GET    /api/inventario/:id              // Detalle
POST   /api/inventario                  // Crear item
PUT    /api/inventario/:id              // Actualizar
DELETE /api/inventario/:id              // Eliminar
GET    /api/inventario/:id/historial    // Historial de cambios

// Ubicaciones
GET    /api/inventario/ubicaciones      // Estructura de ubicaciones
POST   /api/inventario/ubicaciones      // Crear ubicación
PUT    /api/inventario/ubicaciones/:id  // Actualizar
DELETE /api/inventario/ubicaciones/:id  // Eliminar

// Préstamos
GET    /api/inventario/prestamos                   // Listar préstamos
POST   /api/inventario/prestamos                   // Registrar préstamo
PATCH  /api/inventario/prestamos/:id/devolver     // Registrar devolución
GET    /api/inventario/mis-prestamos              // Préstamos del usuario

// Proveedores
GET    /api/inventario/proveedores                // Listar
POST   /api/inventario/proveedores                // Crear
PUT    /api/inventario/proveedores/:id            // Actualizar
GET    /api/inventario/proveedores/:id/compras    // Historial de compras
POST   /api/inventario/proveedores/:id/compras    // Registrar compra
```

---

### 4️⃣ **Módulo de Secretaría y Documentación**
> **Responsable:** Héctor Rivas Monferrer
> **Prioridad:** 🟠 Alta
> **Complejidad:** Media (3-4 días)
> **Depende de:** Fase 0, Sistema de documentos existente

#### Funcionalidades Requeridas

**A. Gestión de Documentación Oficial**
- Documentos a tener por el grupo
- Fecha de caducidad de cada documento
- Alertas de renovación próxima
- Plantillas de documentos oficiales
- Historial de renovaciones

**B. Plantillas de Actividades**
- Banco de plantillas de actividades
- Filtros por: sección, tipo, duración, materiales
- Historial de actividades realizadas
- Valoración y feedback de cada actividad
- Adaptaciones por sección

**C. Circulares**
- Plantillas de circulares reutilizables
- Historial de circulares enviadas
- Estado de firma de cada circular
- Recordatorios automáticos a familias

**D. Contactos Principales**
- Listado de contactos importantes
- Categorías: proveedores, instituciones, otros grupos
- Historial de interacciones

#### Estructura de Datos

```sql
-- Documentos oficiales del grupo
CREATE TABLE documentos_oficiales (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  tipo VARCHAR(100) NOT NULL, -- 'seguro', 'permiso_local', 'registro_asociacion'
  descripcion TEXT,
  archivo_url TEXT,
  fecha_emision DATE,
  fecha_caducidad DATE,
  estado VARCHAR(50) DEFAULT 'vigente', -- vigente, proxima_caducidad, caducado
  entidad_emisora VARCHAR(200),
  responsable_renovacion_id INTEGER REFERENCES usuarios(id),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historial de renovaciones
CREATE TABLE historial_renovaciones (
  id SERIAL PRIMARY KEY,
  documento_oficial_id INTEGER NOT NULL REFERENCES documentos_oficiales(id),
  fecha_renovacion DATE NOT NULL,
  archivo_url TEXT,
  renovado_por INTEGER REFERENCES usuarios(id),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plantillas de actividades
CREATE TABLE plantillas_actividades (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  tipo VARCHAR(100), -- 'juego', 'taller', 'reflexion', 'servicio'
  seccion_id INTEGER REFERENCES secciones(id), -- NULL = todas las secciones
  duracion_minutos INTEGER,
  num_participantes_min INTEGER,
  num_participantes_max INTEGER,
  materiales_necesarios TEXT[],
  objetivos_educativos TEXT[],
  instrucciones TEXT,
  variantes TEXT,
  foto_url TEXT,
  valoracion_media DECIMAL(3,2),
  num_veces_realizada INTEGER DEFAULT 0,
  creada_por INTEGER REFERENCES usuarios(id),
  etiquetas TEXT[], -- ej: ['cooperacion', 'aire_libre', 'nocturna']
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historial de actividades realizadas
CREATE TABLE historial_actividades_realizadas (
  id SERIAL PRIMARY KEY,
  plantilla_id INTEGER REFERENCES plantillas_actividades(id),
  actividad_id INTEGER REFERENCES actividades(id), -- si está en calendario
  titulo VARCHAR(200) NOT NULL,
  fecha_realizacion DATE NOT NULL,
  seccion_id INTEGER REFERENCES secciones(id),
  monitor_responsable_id INTEGER REFERENCES usuarios(id),
  num_participantes INTEGER,
  valoracion INTEGER CHECK (valoracion BETWEEN 1 AND 5),
  feedback TEXT,
  adaptaciones_realizadas TEXT,
  fotos_url TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plantillas de circulares
CREATE TABLE plantillas_circulares (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  tipo VARCHAR(100), -- 'campamento', 'excursion', 'cuotas', 'general'
  asunto VARCHAR(255),
  contenido_html TEXT NOT NULL,
  contenido_texto TEXT,
  campos_variables TEXT[], -- ['nombre_campamento', 'fecha_salida', 'importe']
  documentos_adjuntos_requeridos TEXT[], -- ['autorizacion', 'ficha_medica']
  seccion_id INTEGER REFERENCES secciones(id),
  creada_por INTEGER REFERENCES usuarios(id),
  num_usos INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Circulares enviadas
CREATE TABLE circulares_enviadas (
  id SERIAL PRIMARY KEY,
  plantilla_id INTEGER REFERENCES plantillas_circulares(id),
  titulo VARCHAR(200) NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  contenido_html TEXT NOT NULL,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  enviada_por INTEGER REFERENCES usuarios(id),
  destinatarios_tipo VARCHAR(50), -- 'todas_familias', 'seccion', 'seleccion'
  seccion_id INTEGER REFERENCES secciones(id),
  num_destinatarios INTEGER,
  archivo_pdf_url TEXT,
  requiere_firma BOOLEAN DEFAULT false,
  fecha_limite_firma DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estado de firma de circulares por familia
CREATE TABLE firmas_circulares (
  id SERIAL PRIMARY KEY,
  circular_enviada_id INTEGER NOT NULL REFERENCES circulares_enviadas(id),
  familia_id INTEGER NOT NULL REFERENCES usuarios(id),
  educando_id INTEGER REFERENCES educandos(id),
  firmada BOOLEAN DEFAULT false,
  fecha_firma TIMESTAMP,
  archivo_firmado_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(circular_enviada_id, familia_id, educando_id)
);

-- Contactos principales
CREATE TABLE contactos_principales (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  organizacion VARCHAR(200),
  cargo VARCHAR(200),
  email VARCHAR(255),
  telefono VARCHAR(20),
  categoria VARCHAR(100), -- 'proveedor', 'institucion', 'otro_grupo', 'sponsor'
  notas TEXT,
  fecha_ultimo_contacto DATE,
  prioridad VARCHAR(20), -- 'alta', 'media', 'baja'
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historial de interacciones
CREATE TABLE historial_contactos (
  id SERIAL PRIMARY KEY,
  contacto_id INTEGER NOT NULL REFERENCES contactos_principales(id),
  fecha_interaccion DATE NOT NULL,
  tipo VARCHAR(100), -- 'llamada', 'email', 'reunion', 'otro'
  descripcion TEXT,
  usuario_id INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints

```javascript
// Documentos oficiales
GET    /api/secretaria/documentos-oficiales
POST   /api/secretaria/documentos-oficiales
GET    /api/secretaria/documentos-oficiales/:id
PUT    /api/secretaria/documentos-oficiales/:id
PATCH  /api/secretaria/documentos-oficiales/:id/renovar

// Plantillas de actividades
GET    /api/secretaria/plantillas-actividades        // Con filtros
POST   /api/secretaria/plantillas-actividades
GET    /api/secretaria/plantillas-actividades/:id
PUT    /api/secretaria/plantillas-actividades/:id
GET    /api/secretaria/historial-actividades         // Actividades realizadas
POST   /api/secretaria/historial-actividades         // Registrar realización

// Circulares
GET    /api/secretaria/plantillas-circulares
POST   /api/secretaria/plantillas-circulares
POST   /api/secretaria/circulares/enviar             // Enviar nueva circular
GET    /api/secretaria/circulares/enviadas
GET    /api/secretaria/circulares/:id/firmas         // Estado de firmas

// Portal Familia - Circulares
GET    /api/familia/mis-circulares                   // Circulares pendientes
POST   /api/familia/circulares/:id/firmar            // Subir circular firmada

// Contactos
GET    /api/secretaria/contactos
POST   /api/secretaria/contactos
PUT    /api/secretaria/contactos/:id
POST   /api/secretaria/contactos/:id/interacciones   // Registrar interacción
```

---

### 5️⃣ **Módulo de Búsqueda de Campamento**
> **Responsable:** Rebrú
> **Prioridad:** 🟡 Media
> **Complejidad:** Media (3-4 días)
> **Depende de:** Fase 0

#### Funcionalidades Requeridas

**A. Histórico de Campamentos**
- Base de datos de campamentos anteriores
- Ubicaciones exactas (coordenadas GPS)
- Instalaciones disponibles
- Contactos del lugar
- Fotos del lugar
- Categorías: inicio, aniversario, pascua, verano
- Valoración y feedback

**B. Ficha Técnica de cada Campamento**
- Nombre y ubicación
- Fechas realizadas
- Secciones que lo han usado
- Capacidad (plazas)
- Precio por persona/día
- Servicios disponibles (duchas, cocina, luz, agua)
- Actividades posibles en la zona
- Restricciones o normativas
- Valoración general (1-5)

**C. Sistema de Búsqueda**
- Filtros por: provincia, capacidad, servicios, precio, tipo
- Mapa interactivo con ubicaciones
- Comparativa de opciones
- Marcar como "favorito" o "interesante"

**D. Solicitud de Presupuestos**
- Botón para solicitar presupuesto a Tesorería
- Notificación directa al cargo de Tesorería
- Tracking de peticiones pendientes

#### Estructura de Datos

```sql
-- Campamentos (histórico y posibles)
CREATE TABLE campamentos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'inicio', 'aniversario', 'pascua', 'verano'
  ubicacion TEXT NOT NULL,
  provincia VARCHAR(100),
  pais VARCHAR(100) DEFAULT 'España',
  coordenadas_lat DECIMAL(10, 8),
  coordenadas_lng DECIMAL(11, 8),
  contacto_nombre VARCHAR(200),
  contacto_telefono VARCHAR(20),
  contacto_email VARCHAR(255),
  contacto_web TEXT,
  capacidad_personas INTEGER,
  precio_persona_dia DECIMAL(10,2),
  descripcion TEXT,
  servicios TEXT[], -- ['duchas', 'cocina', 'luz', 'agua_potable']
  instalaciones TEXT[], -- ['comedor', 'capilla', 'piscina']
  actividades_zona TEXT[], -- ['senderismo', 'escalada', 'rios']
  restricciones TEXT,
  normativa TEXT,
  valoracion_general INTEGER CHECK (valoracion_general BETWEEN 1 AND 5),
  notas TEXT,
  estado VARCHAR(50) DEFAULT 'posible', -- 'posible', 'usado', 'descartado'
  fotos_url TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de uso de campamentos
CREATE TABLE campamentos_realizados (
  id SERIAL PRIMARY KEY,
  campamento_id INTEGER NOT NULL REFERENCES campamentos(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  tipo VARCHAR(50), -- 'inicio', 'aniversario', 'pascua', 'verano'
  secciones_participantes INTEGER[], -- array de seccion_id
  num_participantes INTEGER,
  coste_total DECIMAL(10,2),
  coste_persona DECIMAL(10,2),
  valoracion_instalaciones INTEGER CHECK (valoracion_instalaciones BETWEEN 1 AND 5),
  valoracion_atencion INTEGER CHECK (valoracion_atencion BETWEEN 1 AND 5),
  feedback TEXT,
  incidencias TEXT,
  fotos_url TEXT[],
  coordinador_id INTEGER REFERENCES usuarios(id),
  volveriamos BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Críticas de educandos por campamento
CREATE TABLE criticas_campamento (
  id SERIAL PRIMARY KEY,
  campamento_realizado_id INTEGER NOT NULL REFERENCES campamentos_realizados(id),
  seccion_id INTEGER REFERENCES secciones(id),
  tipo VARCHAR(50), -- 'critica_constructiva', 'alabanza', 'sugerencia'
  contenido TEXT NOT NULL,
  fecha_recopilacion DATE,
  recopilado_por INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Peticiones de presupuesto
CREATE TABLE peticiones_presupuesto (
  id SERIAL PRIMARY KEY,
  campamento_id INTEGER REFERENCES campamentos(id),
  solicitante_id INTEGER NOT NULL REFERENCES usuarios(id),
  cargo_destino VARCHAR(100) DEFAULT 'tesoreria',
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_necesita DATE,
  num_personas INTEGER,
  num_dias INTEGER,
  descripcion TEXT,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, en_proceso, completado, cancelado
  presupuesto_url TEXT,
  notas_tesoreria TEXT,
  atendido_por INTEGER REFERENCES usuarios(id),
  fecha_respuesta TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints

```javascript
// Campamentos
GET    /api/campamentos                          // Listar (con filtros)
GET    /api/campamentos/:id                      // Detalle
POST   /api/campamentos                          // Crear
PUT    /api/campamentos/:id                      // Actualizar
DELETE /api/campamentos/:id                      // Eliminar
GET    /api/campamentos/mapa                     // Para mapa interactivo

// Histórico
GET    /api/campamentos/realizados               // Campamentos realizados
POST   /api/campamentos/realizados               // Registrar campamento
GET    /api/campamentos/realizados/:id           // Detalle
POST   /api/campamentos/realizados/:id/criticas  // Añadir críticas

// Peticiones de presupuesto
POST   /api/campamentos/solicitar-presupuesto    // Crear petición
GET    /api/campamentos/mis-peticiones           // Peticiones del usuario
GET    /api/tesoreria/peticiones-presupuesto    // Para tesorería
PATCH  /api/tesoreria/peticiones-presupuesto/:id // Actualizar estado
```

---

### 6️⃣ **Módulo de Ambientación**
> **Responsable:** Joan Maiques Garcés
> **Prioridad:** 🟡 Media
> **Complejidad:** Baja-Media (2-3 días)
> **Depende de:** Fase 0

#### Funcionalidades Requeridas

**A. Historial de Ambientaciones**
- Memoria de ambientaciones pasadas
- Por campamento y año
- Tema/historia utilizada
- Personajes principales
- Decoración y elementos
- Fotos y recursos

**B. Banco de Ideas**
- Temas disponibles para usar
- Fuentes de inspiración
- Recursos reutilizables
- Canciones asociadas
- Actividades relacionadas

**C. Buzón de Sugerencias**
- Formulario para proponer ubicaciones
- Categorías: Pirineos, País Vasco, Aragón, Galicia, etc.
- Votación de propuestas
- Comentarios y debate

#### Estructura de Datos

```sql
-- Ambientaciones históricas
CREATE TABLE ambientaciones (
  id SERIAL PRIMARY KEY,
  campamento_realizado_id INTEGER REFERENCES campamentos_realizados(id),
  titulo VARCHAR(200) NOT NULL,
  tema VARCHAR(200) NOT NULL, -- ej: "Vikingos", "Oeste Americano"
  descripcion TEXT,
  historia_resumen TEXT,
  personajes TEXT[], -- ['Ragnar', 'Lagertha']
  elementos_decoracion TEXT[],
  canciones TEXT[],
  actividades_relacionadas TEXT[],
  fotos_url TEXT[],
  recursos_url TEXT[], -- PDFs, docs, etc.
  valoracion INTEGER CHECK (valoracion BETWEEN 1 AND 5),
  creada_por INTEGER REFERENCES usuarios(id),
  año INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sugerencias de ubicaciones
CREATE TABLE sugerencias_ubicaciones (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  zona VARCHAR(100), -- 'Pirineos', 'País Vasco'
  ubicacion TEXT,
  descripcion TEXT,
  tipo_campamento VARCHAR(50), -- 'verano', 'pascua', etc.
  sugerido_por INTEGER REFERENCES usuarios(id),
  fecha_sugerencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  num_votos INTEGER DEFAULT 0,
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, revisada, aprobada, descartada
  notas_comite TEXT
);

-- Votos a sugerencias
CREATE TABLE votos_sugerencias (
  id SERIAL PRIMARY KEY,
  sugerencia_id INTEGER NOT NULL REFERENCES sugerencias_ubicaciones(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  voto BOOLEAN NOT NULL, -- true = a favor, false = en contra
  fecha_voto TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sugerencia_id, usuario_id)
);

-- Comentarios a sugerencias
CREATE TABLE comentarios_sugerencias (
  id SERIAL PRIMARY KEY,
  sugerencia_id INTEGER NOT NULL REFERENCES sugerencias_ubicaciones(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  comentario TEXT NOT NULL,
  fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints

```javascript
// Ambientaciones
GET    /api/ambientacion/historial              // Historial completo
GET    /api/ambientacion/:id                    // Detalle
POST   /api/ambientacion                        // Crear
PUT    /api/ambientacion/:id                    // Actualizar

// Sugerencias
GET    /api/ambientacion/sugerencias            // Listar
POST   /api/ambientacion/sugerencias            // Crear sugerencia
POST   /api/ambientacion/sugerencias/:id/votar  // Votar
POST   /api/ambientacion/sugerencias/:id/comentar // Comentar
```

---

### 7️⃣ **Módulo de Festival de la Canción**
> **Responsable:** Álvaro Santandreu
> **Prioridad:** 🟢 Baja
> **Complejidad:** Baja (1-2 días)
> **Depende de:** Fase 0

#### Funcionalidades Requeridas

**A. Cancionero Online**
- Biblioteca de canciones del grupo
- Letra y acordes
- Enlace a grabaciones
- Categorías: tradicionales, ronda, fogatas
- Búsqueda por título o palabra clave

**B. Festivales Históricos**
- Historial de festivales realizados
- Canciones presentadas cada año
- Ganadores y votaciones
- Fotos y vídeos

#### Estructura de Datos

```sql
-- Cancionero
CREATE TABLE canciones (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  letra TEXT NOT NULL,
  acordes TEXT,
  categoria VARCHAR(100), -- 'tradicional', 'ronda', 'fogata', 'festival'
  autor VARCHAR(200),
  grabacion_url TEXT,
  partitura_url TEXT,
  origen VARCHAR(200),
  año INTEGER,
  etiquetas TEXT[],
  añadida_por INTEGER REFERENCES usuarios(id),
  num_reproducciones INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Festivales
CREATE TABLE festivales (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  descripcion TEXT,
  ubicacion VARCHAR(200),
  fotos_url TEXT[],
  videos_url TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Canciones presentadas en festivales
CREATE TABLE canciones_festival (
  id SERIAL PRIMARY KEY,
  festival_id INTEGER NOT NULL REFERENCES festivales(id),
  cancion_id INTEGER REFERENCES canciones(id),
  seccion_id INTEGER REFERENCES secciones(id),
  titulo VARCHAR(200),
  interprete VARCHAR(200),
  posicion INTEGER, -- 1 = ganador, 2 = segundo...
  votos INTEGER,
  video_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints

```javascript
// Cancionero
GET    /api/cancionero                          // Listar canciones
GET    /api/cancionero/:id                      // Detalle
POST   /api/cancionero                          // Añadir canción
PUT    /api/cancionero/:id                      // Actualizar

// Festivales
GET    /api/festivales                          // Listar
GET    /api/festivales/:id                      // Detalle
POST   /api/festivales                          // Crear
GET    /api/festivales/:id/canciones            // Canciones del festival
```

---

### 8️⃣ **Módulo de Entorno Seguro**
> **Responsable:** Amelia
> **Prioridad:** 🟠 Alta
> **Complejidad:** Media (3-4 días)
> **Depende de:** Fase 0

#### Funcionalidades Requeridas

**A. Información Pública**
- Página explicativa del protocolo de Entorno Seguro
- Equipo responsable
- Documentación descargable
- Formaciones realizadas

**B. Buzón de Consultas/Denuncias**
- Formulario anónimo (opcional)
- Notificación al equipo de Entorno Seguro
- Seguimiento privado de cada caso
- Sistema seguro y confidencial

**C. Gestión de Formaciones**
- Registro de formaciones realizadas
- Asistentes a cada formación
- Fechas de renovación
- Certificados

#### Estructura de Datos

```sql
-- Configuración de Entorno Seguro
CREATE TABLE entorno_seguro_config (
  id SERIAL PRIMARY KEY,
  contenido_publico TEXT, -- HTML para página pública
  equipo_responsable INTEGER[], -- array de usuario_id
  email_contacto VARCHAR(255),
  protocolo_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consultas/Denuncias
CREATE TABLE consultas_entorno_seguro (
  id SERIAL PRIMARY KEY,
  codigo_seguimiento VARCHAR(20) UNIQUE NOT NULL, -- para seguimiento anónimo
  tipo VARCHAR(50) NOT NULL, -- 'consulta', 'denuncia', 'sugerencia'
  descripcion TEXT NOT NULL,
  email_contacto VARCHAR(255), -- opcional
  nombre VARCHAR(200), -- opcional
  anonimo BOOLEAN DEFAULT true,
  gravedad VARCHAR(50), -- 'baja', 'media', 'alta', 'critica'
  estado VARCHAR(50) DEFAULT 'pendiente', -- pendiente, en_revision, resuelto
  fecha_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  asignado_a INTEGER REFERENCES usuarios(id),
  notas_internas TEXT,
  fecha_resolucion TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seguimiento de consultas
CREATE TABLE seguimiento_consultas (
  id SERIAL PRIMARY KEY,
  consulta_id INTEGER NOT NULL REFERENCES consultas_entorno_seguro(id),
  usuario_id INTEGER REFERENCES usuarios(id),
  accion TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Formaciones de Entorno Seguro
CREATE TABLE formaciones_entorno_seguro (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  duracion_horas DECIMAL(4,2),
  formador VARCHAR(200),
  descripcion TEXT,
  certificado_template_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asistentes a formaciones
CREATE TABLE asistentes_formacion (
  id SERIAL PRIMARY KEY,
  formacion_id INTEGER NOT NULL REFERENCES formaciones_entorno_seguro(id),
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  asistencia BOOLEAN DEFAULT true,
  certificado_url TEXT,
  fecha_caducidad DATE, -- si la formación caduca
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(formacion_id, usuario_id)
);
```

#### API Endpoints

```javascript
// Público
GET    /api/entorno-seguro/info                 // Info pública

// Consultas/Denuncias
POST   /api/entorno-seguro/consultas            // Enviar consulta
GET    /api/entorno-seguro/consultas/:codigo    // Seguimiento con código

// Gestión (solo equipo de Entorno Seguro)
GET    /api/entorno-seguro/panel                // Panel de gestión
GET    /api/entorno-seguro/consultas            // Listar consultas
PATCH  /api/entorno-seguro/consultas/:id        // Actualizar estado
POST   /api/entorno-seguro/consultas/:id/accion // Registrar acción

// Formaciones
GET    /api/entorno-seguro/formaciones          // Listar
POST   /api/entorno-seguro/formaciones          // Crear
GET    /api/entorno-seguro/mis-formaciones      // Formaciones del usuario
```

---

### 9️⃣ **Módulo de Redes y Comunicación**
> **Responsables:** Lekes, Amelia
> **Prioridad:** 🟡 Media
> **Complejidad:** Baja-Media (2-3 días)
> **Depende de:** Sistema de galería existente

#### Funcionalidades Requeridas

**A. Integración con Instagram**
- Widget con últimas 3 publicaciones
- Enlace directo al perfil
- Sincronización automática

**B. Galería de Fotos Interna**
- Nube para que el kraal suba fotos de campamentos
- Organización por carpetas y eventos
- Descarga masiva
- Alternativa a Google Drive

**C. Identidad Gráfica**
- Plantillas de posts
- Logos y recursos
- Guía de estilo
- Colaboración con equipo de comunicación

#### Estructura de Datos

```sql
-- Configuración de redes sociales
CREATE TABLE configuracion_redes (
  id SERIAL PRIMARY KEY,
  plataforma VARCHAR(50) NOT NULL, -- 'instagram', 'facebook', 'twitter'
  usuario VARCHAR(100),
  url TEXT,
  access_token TEXT, -- para APIs
  activo BOOLEAN DEFAULT true,
  ultima_sincronizacion TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Publicaciones de redes (caché)
CREATE TABLE publicaciones_redes (
  id SERIAL PRIMARY KEY,
  plataforma VARCHAR(50) NOT NULL,
  post_id_externo VARCHAR(200) UNIQUE,
  contenido TEXT,
  imagen_url TEXT,
  enlace TEXT,
  fecha_publicacion TIMESTAMP,
  likes INTEGER,
  comentarios INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Galería interna (kraal)
CREATE TABLE carpetas_galeria (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  carpeta_padre_id INTEGER REFERENCES carpetas_galeria(id),
  seccion_id INTEGER REFERENCES secciones(id),
  fecha_evento DATE,
  creada_por INTEGER REFERENCES usuarios(id),
  privacidad VARCHAR(50) DEFAULT 'privada', -- privada, secciones, publica
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fotos de la galería interna
CREATE TABLE fotos_galeria_interna (
  id SERIAL PRIMARY KEY,
  carpeta_id INTEGER NOT NULL REFERENCES carpetas_galeria(id),
  titulo VARCHAR(200),
  descripcion TEXT,
  archivo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  fecha_captura DATE,
  subida_por INTEGER REFERENCES usuarios(id),
  tamaño_bytes BIGINT,
  tipo_archivo VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recursos de identidad gráfica
CREATE TABLE recursos_identidad (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  tipo VARCHAR(100), -- 'logo', 'plantilla_post', 'guia_estilo'
  descripcion TEXT,
  archivo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  categoria VARCHAR(100),
  etiquetas TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints

```javascript
// Instagram
GET    /api/redes/instagram/feed                // Últimas publicaciones
POST   /api/redes/instagram/sync                // Sincronizar

// Galería Interna
GET    /api/galeria-interna/carpetas            // Listar carpetas
POST   /api/galeria-interna/carpetas            // Crear carpeta
GET    /api/galeria-interna/carpetas/:id/fotos  // Fotos de carpeta
POST   /api/galeria-interna/fotos               // Subir foto (multipart)
DELETE /api/galeria-interna/fotos/:id           // Eliminar foto
GET    /api/galeria-interna/descargar/:id       // Descargar carpeta (ZIP)

// Identidad Gráfica
GET    /api/redes/identidad-grafica             // Recursos
POST   /api/redes/identidad-grafica             // Subir recurso
```

---

### 🔟 **Módulo de Subvenciones**
> **Responsable:** Rebrú
> **Prioridad:** 🟡 Media
> **Complejidad:** Media (3 días)
> **Depende de:** Fase 0

#### Funcionalidades Requeridas

**A. Espacio de Almacenamiento Interno**
- Documentos de subvenciones
- Solo accesible para cargo de Subvenciones
- Organización por convocatoria
- Historial de subvenciones solicitadas

**B. Tracking de Convocatorias**
- Calendario de convocatorias
- Fechas límite
- Estado: planificada, solicitada, concedida, denegada
- Importes solicitados vs concedidos

#### Estructura de Datos

```sql
-- Subvenciones
CREATE TABLE subvenciones (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  organismo VARCHAR(200) NOT NULL,
  convocatoria VARCHAR(200),
  año INTEGER NOT NULL,
  descripcion TEXT,
  importe_solicitado DECIMAL(10,2),
  importe_concedido DECIMAL(10,2),
  fecha_convocatoria DATE,
  fecha_limite DATE,
  fecha_solicitud DATE,
  fecha_resolucion DATE,
  estado VARCHAR(50) DEFAULT 'planificada', -- planificada, solicitada, concedida, denegada, cancelada
  documentos_url TEXT[],
  responsable_id INTEGER REFERENCES usuarios(id),
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documentos de subvenciones
CREATE TABLE documentos_subvencion (
  id SERIAL PRIMARY KEY,
  subvencion_id INTEGER NOT NULL REFERENCES subvenciones(id),
  nombre VARCHAR(200) NOT NULL,
  tipo VARCHAR(100), -- 'solicitud', 'justificacion', 'memoria', 'resolucion'
  archivo_url TEXT NOT NULL,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  subido_por INTEGER REFERENCES usuarios(id)
);
```

#### API Endpoints

```javascript
// Subvenciones
GET    /api/subvenciones                        // Listar
POST   /api/subvenciones                        // Crear
GET    /api/subvenciones/:id                    // Detalle
PUT    /api/subvenciones/:id                    // Actualizar
POST   /api/subvenciones/:id/documentos         // Subir documento
GET    /api/subvenciones/calendario             // Calendario de plazos
```

---

### 1️⃣1️⃣ **Módulo de Espiritualidad**
> **Responsable:** Héctor Rivas Monferrer
> **Prioridad:** 🟢 Baja
> **Complejidad:** Baja (2 días)
> **Depende de:** Fase 0

#### Funcionalidades Requeridas

**A. Consejos y Recursos**
- Formas de trabajar la espiritualidad
- Consejos para implementar en secciones
- Actividades y dinámicas
- Reflexiones y oraciones

#### Estructura de Datos

```sql
-- Recursos de espiritualidad
CREATE TABLE recursos_espiritualidad (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  tipo VARCHAR(100), -- 'consejo', 'actividad', 'oracion', 'reflexion'
  contenido TEXT NOT NULL,
  seccion_recomendada_id INTEGER REFERENCES secciones(id),
  duracion_minutos INTEGER,
  materiales TEXT[],
  etiquetas TEXT[],
  creado_por INTEGER REFERENCES usuarios(id),
  num_usos INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🗓️ Roadmap de Implementación Recomendado

### SPRINT 1 (Semana 1) - Fundamentos
- ✅ **Fase 0: Sistema Base de Cargos** (3-4 días)
  - Crear tablas de BD
  - Endpoints API
  - Componentes frontend admin
  - Dashboard "Mi Cargo"

### SPRINT 2 (Semana 2-3) - Módulos de Alta Prioridad
- 🟠 **Módulo de Tesorería** (5-7 días)
  - Sistema de facturas
  - Cuentas internas
  - Pagos de familias
- 🟠 **Módulo de Inventario** (4-5 días)
  - Inventario completo
  - Préstamos
  - Proveedores

### SPRINT 3 (Semana 4-5) - Secretaría y Documentación
- 🟠 **Módulo de Secretaría** (3-4 días)
  - Documentos oficiales
  - Plantillas de actividades
  - Circulares
- 🟠 **Módulo de Entorno Seguro** (3-4 días)
  - Página pública
  - Buzón de consultas
  - Formaciones

### SPRINT 4 (Semana 6) - Módulos de Media Prioridad
- 🟡 **Módulo de Campamentos** (3-4 días)
  - Histórico
  - Sistema de búsqueda
  - Peticiones de presupuesto
- 🟡 **Módulo de Redes** (2-3 días)
  - Integración Instagram
  - Galería interna

### SPRINT 5 (Semana 7) - Módulos Complementarios
- 🟡 **Módulo de Subvenciones** (3 días)
- 🟡 **Módulo de Ambientación** (2-3 días)
- 🟢 **Módulo de Festival** (1-2 días)
- 🟢 **Módulo de Espiritualidad** (2 días)

---

## 📊 Matriz de Priorización

| Módulo | Prioridad | Complejidad | Impacto | Dependencias | Tiempo Estimado |
|--------|-----------|-------------|---------|--------------|-----------------|
| **Sistema Base Cargos** | 🔴 Crítica | Media | Muy Alto | Ninguna | 3-4 días |
| **Tesorería** | 🟠 Alta | Alta | Muy Alto | Fase 0 | 5-7 días |
| **Inventario** | 🟠 Alta | Media-Alta | Alto | Fase 0 | 4-5 días |
| **Secretaría** | 🟠 Alta | Media | Alto | Fase 0 | 3-4 días |
| **Entorno Seguro** | 🟠 Alta | Media | Alto | Fase 0 | 3-4 días |
| **Campamentos** | 🟡 Media | Media | Medio | Fase 0 | 3-4 días |
| **Redes** | 🟡 Media | Baja-Media | Medio | Galería existente | 2-3 días |
| **Subvenciones** | 🟡 Media | Media | Medio | Fase 0 | 3 días |
| **Ambientación** | 🟡 Media | Baja-Media | Medio | Fase 0 | 2-3 días |
| **Festival** | 🟢 Baja | Baja | Bajo | Fase 0 | 1-2 días |
| **Espiritualidad** | 🟢 Baja | Baja | Bajo | Fase 0 | 2 días |

---

## 🔒 Sistema de Permisos Propuesto

### Roles Expandidos

```typescript
// Roles base
type RolBase = 'admin' | 'scouter' | 'familia' | 'educando'

// Cargos del comité
type Cargo =
  | 'tesoreria'
  | 'busqueda_campamento'
  | 'material'
  | 'secretaria'
  | 'transporte'
  | 'comunicacion_patro'
  | 'sostenibilidad'
  | 'espiritualidad'
  | 'festival_cancion'
  | 'subvenciones'
  | 'circulares'
  | 'entorno_seguro'
  | 'dinamikraal'
  | 'ambientacion'
  | 'redes'
  | 'animacion_pedagogica'
  | 'comite'

// Permisos por cargo
interface PermisoCargo {
  cargo: Cargo
  modulos: string[] // ej: ['inventario', 'proveedores']
  acciones: string[] // ej: ['leer', 'crear', 'editar', 'eliminar']
}
```

### Middleware de Verificación de Cargo

```javascript
// api-osyris/src/middleware/cargo.middleware.js
const verificarCargo = (cargosPermitidos) => {
  return async (req, res, next) => {
    const userId = req.userId // del token JWT

    // Consultar cargos activos del usuario
    const cargosUsuario = await obtenerCargosActivos(userId)

    // Verificar si tiene alguno de los cargos permitidos
    const tieneCargo = cargosUsuario.some(cargo =>
      cargosPermitidos.includes(cargo.nombre)
    )

    if (!tieneCargo && req.rol !== 'admin') {
      return res.status(403).json({
        error: 'No tienes el cargo necesario para esta acción'
      })
    }

    next()
  }
}

// Uso en rutas
router.get('/api/tesoreria/facturas',
  verifyToken,
  verificarCargo(['tesoreria', 'comite']),
  facturaController.listar
)
```

---

## 📈 Métricas de Éxito

### Indicadores por Módulo

**Sistema de Cargos:**
- ✅ 17 cargos configurados
- ✅ 100% de usuarios con rol 'scouter' o 'admin' tienen al menos 1 cargo asignado
- ✅ Dashboard "Mi Cargo" funcional

**Tesorería:**
- ✅ Reducción 80% en tiempo de gestión de facturas
- ✅ 100% de facturas con UID único asignado
- ✅ 90% de familias usando sistema de pagos online

**Inventario:**
- ✅ 100% del material catalogado con ubicación
- ✅ Reducción 60% en tiempo de búsqueda de material
- ✅ Sistema de préstamos con 95% de devoluciones a tiempo

**Secretaría:**
- ✅ 100% de documentos oficiales con fecha de caducidad registrada
- ✅ Banco de 50+ plantillas de actividades
- ✅ 100% de circulares enviadas a través del sistema

---

## 🎨 Consideraciones de UX/UI

### Diseño del Dashboard "Mi Cargo"

```typescript
// src/app/mi-cargo/page.tsx
const MiCargoDashboard = () => {
  const { cargos } = useMisCargos()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mis Cargos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cargos.map(cargo => (
          <CargoCard key={cargo.id} cargo={cargo} />
        ))}
      </div>

      {/* Widgets específicos por cargo */}
      {cargos.includes('tesoreria') && <TesoreriaWidget />}
      {cargos.includes('secretaria') && <SecretariaWidget />}
    </div>
  )
}
```

### Navegación Adaptativa

```typescript
// Mostrar elementos de menú solo si el usuario tiene el cargo
const menuItems = [
  {
    label: 'Tesorería',
    href: '/tesoreria',
    cargo: 'tesoreria',
    icon: DollarSign
  },
  {
    label: 'Inventario',
    href: '/inventario',
    cargo: 'material',
    icon: Package
  },
  // ...
].filter(item =>
  userCargos.includes(item.cargo) || userRol === 'admin'
)
```

---

## 🔄 Integración con Sistema Existente

### Extensión de Tablas Actuales

```sql
-- Añadir campo a tabla usuarios
ALTER TABLE usuarios
ADD COLUMN cargo_principal_id INTEGER REFERENCES cargos_comite(id);

-- Vista combinada de usuarios con cargos
CREATE VIEW vista_usuarios_cargos AS
SELECT
  u.id,
  u.nombre,
  u.apellidos,
  u.email,
  u.rol,
  array_agg(c.nombre) as cargos,
  cp.nombre as cargo_principal
FROM usuarios u
LEFT JOIN usuario_cargo uc ON u.id = uc.usuario_id AND uc.fecha_fin IS NULL
LEFT JOIN cargos_comite c ON uc.cargo_id = c.id
LEFT JOIN cargos_comite cp ON u.cargo_principal_id = cp.id
GROUP BY u.id, cp.nombre;
```

### Hooks Compatibles con Sistema Actual

```typescript
// src/hooks/useCargos.ts
import { useAuth } from './useAuth'

export const useMisCargos = () => {
  const { user } = useAuth() // usa el sistema de auth existente
  const [cargos, setCargos] = useState([])

  useEffect(() => {
    if (user) {
      fetchMisCargos(user.id).then(setCargos)
    }
  }, [user])

  return { cargos, loading, error }
}
```

---

## 📝 Notas Finales

### Ventajas de este Enfoque

1. **Modular:** Cada módulo es independiente y puede implementarse por separado
2. **Escalable:** Fácil añadir nuevos cargos y módulos en el futuro
3. **Reutilizable:** Componentes y hooks compartidos
4. **Seguro:** Sistema de permisos basado en cargos
5. **Compatible:** Se integra con el sistema existente sin romper nada

### Recomendaciones

1. **Empezar por Fase 0** - Es la base de todo
2. **Implementar Tesorería primero** - Mayor impacto y urgencia expresada
3. **Testing continuo** - Tests unitarios y E2E para cada módulo
4. **Documentación** - Actualizar CLAUDE.md con cada módulo implementado
5. **Feedback del equipo** - Validar cada módulo con el responsable del cargo

---

## 🚀 Siguiente Paso Propuesto

**¿Comenzamos con la Fase 0 (Sistema Base de Cargos)?**

Esto incluiría:
1. Crear las tablas de base de datos
2. Implementar los endpoints API
3. Crear componentes frontend para admin
4. Crear el dashboard "Mi Cargo"
5. Sistema de asignación de cargos

Esto desbloqueará todas las demás implementaciones y tomará aproximadamente **3-4 días** de desarrollo.

---

*Documento generado por Claude Code - Osyris Scout Management System v2.0.0*
