# Estado del Sistema de Edición de Contenido

## ✅ Completado en esta sesión

### 1. Problemas Corregidos

#### 🔘 Botón de edición no aparecía sin recargar
- **Archivo:** `app/login/page.tsx:109`
- **Cambio:** Añadido `await refreshUser()` después de `setAuthData()`
- **Resultado:** El botón "Editar Página" aparece inmediatamente tras login

#### 🖼️ Backend static file serving
- **Archivos modificados:**
  - `api-osyris/src/index.js:96-99` - Movido express.static después de rutas API
  - `api-osyris/src/index.js:97-98` - Añadido logging del path
- **Path corregido:** `path.join(__dirname, '../uploads')`
- **Resultado:** Imágenes servidas correctamente en `http://localhost:5000/uploads/content/*`

#### 🔗 URLs relativas → absolutas en EditableImage
- **Archivo:** `components/editable/EditableImage.tsx:60-66`
- **Cambio:** Detecta paths `/uploads/*` y prepend `${NEXT_PUBLIC_API_URL}`
- **Resultado:** Imágenes cargadas desde la API funcionan correctamente

#### 🖊️ Hidratación de imágenes desde API
- **Landing page** (`app/page.tsx:349-358`): join-us-image usa `{getContent()}`
- **Section Template** (`components/ui/section-page-template.tsx:161-169`): hero-image usa `{getContent()}`
- **Team images** ya tenían el patrón correcto

### 2. Nuevos Componentes Creados

#### 📝 EditableList
- **Archivo:** `components/editable/EditableList.tsx`
- **Funcionalidad:**
  - Maneja arrays JSON editables
  - Permite añadir/eliminar/reordenar elementos
  - Soporta editor personalizado por tipo de item
  - Se integra con el contexto EditMode
  - Guarda como tipo='json' en la base de datos

### 3. Páginas Convertidas a Editables

#### 🏠 Landing Page
**Bloques ahora editables:**
- ✅ "Nuestras Secciones" - título y subtítulo (contentId: 120-121)
- ✅ "Próximas Actividades" - título y subtítulo (contentId: 122-123)
- ✅ "¿Quieres formar parte...?" - título y descripción (contentId: 124-125)
- ✅ "Testimonios" - título y subtítulo (contentId: 126-127)

**Bloques ya editables desde antes:**
- ✅ Hero section (título, subtítulo, badges)
- ✅ Valores (título, subtítulo, cada valor con título y descripción)
- ✅ Join us image

#### 🖼️ Galería
**Cambios realizados:**
- ❌ **ELIMINADO** PageEditor legacy (línea 11, 160-164, 346)
- ✅ Añadido `useSectionContent('galeria')`
- ✅ Hero title editable (contentId: 300)
- ✅ Hero subtitle editable (contentId: 301)
- ✅ Search placeholder usa getContent (contentId: 302)
- ✅ **Resultado:** Botón azul residual ELIMINADO

## ⏳ Pendiente de Implementación

### 1. Contenido Dinámico Faltante

#### 📄 /secciones completa
**Archivo:** `app/secciones/page.tsx`
**Bloques hardcodeados:**
- Línea 19: "Nuestras Secciones" (título hero)
- Línea 20-22: Subtítulo hero
- Línea 30: "El Método Scout por Edades"
- Línea 31-35: Descripción método
- Línea 79: "Progresión Personal" (título)
- Línea 80-83: Descripción progresión
- Línea 101: "¿Quieres formar parte...?" (CTA)
- Línea 127-183: Array `sections` completo (5 secciones)
- Línea 186-211: Array `progressionSteps` (5 pasos)

**Recomendación:**
- Opción 1: EditableText para títulos/descripciones, guardar arrays como JSON
- Opción 2: Crear tabla `secciones_info` específica

#### 🕐 Timeline en Sobre Nosotros
**Archivo:** `app/sobre-nosotros/page.tsx`
**Ubicación:** Tab "Historia" (líneas ~210-280)
**Array hardcodeado:** `timelineEvents` con 6 eventos (1981-Actualidad)

**Implementación sugerida:**
```typescript
<EditableList
  contentId={250}
  identificador="timeline-events"
  seccion="sobre-nosotros"
  fallback={timelineEvents}
  emptyItem={{ year: '2025', title: '', description: '' }}
  render={(event) => (
    <div className="timeline-item">
      <h3>{event.year}</h3>
      <h4>{event.title}</h4>
      <p>{event.description}</p>
    </div>
  )}
  itemEditor={(item, onChange, onDelete) => (
    <div>
      <Input value={item.year} onChange={(e) => onChange({...item, year: e.target.value})} />
      <Input value={item.title} onChange={(e) => onChange({...item, title: e.target.value})} />
      <Textarea value={item.description} onChange={(e) => onChange({...item, description: e.target.value})} />
      <Button onClick={onDelete}>Eliminar</Button>
    </div>
  )}
/>
```

#### 💎 Valores en Sobre Nosotros
**Archivo:** `app/sobre-nosotros/page.tsx`
**Ubicación:** Tab "Valores" (líneas ~290-340)
**Array hardcodeado:** `values` con 6 valores

**Implementación:** Usar EditableList similar a timeline

#### 📚 Metodología en Sobre Nosotros
**Archivo:** `app/sobre-nosotros/page.tsx`
**Ubicación:** Tab "Metodología" (líneas ~350-400)
**Array hardcodeado:** `methodology` con 6 puntos

**Implementación:** Usar EditableList similar a timeline

#### 📋 Testimonios en Landing
**Archivo:** `app/page.tsx`
**Array hardcodeado:** `testimonials` (líneas ~430-460)

**Implementación:** Usar EditableList con campos: name, role, text, avatar

#### 🗓️ Actividades en Landing
**Archivo:** `app/page.tsx`
**Array hardcodeado:** `upcomingActivities` (líneas ~218-265)

**Implementación:**
- Opción 1: EditableList con JSON
- Opción 2: Integrar con tabla `actividades` existente

### 2. Scripts de Seed Necesarios

Crear script para poblar `contenido_editable` con:

```sql
-- Landing
INSERT INTO contenido_editable (id, seccion, identificador, tipo, contenido, metadata) VALUES
(120, 'landing', 'sections-title', 'texto', 'Nuestras Secciones', '{}'),
(121, 'landing', 'sections-subtitle', 'texto', 'El escultismo se adapta...', '{}'),
(122, 'landing', 'activities-title', 'texto', 'Próximas Actividades', '{}'),
(123, 'landing', 'activities-subtitle', 'texto', 'Descubre las actividades...', '{}'),
(124, 'landing', 'join-title', 'texto', '¿Quieres formar parte...?', '{}'),
(125, 'landing', 'join-description', 'texto', 'Si estás interesado...', '{}'),
(126, 'landing', 'testimonials-title', 'texto', 'Testimonios', '{}'),
(127, 'landing', 'testimonials-subtitle', 'texto', 'Descubre lo que opinan...', '{}');

-- Galería
INSERT INTO contenido_editable (id, seccion, identificador, tipo, contenido, metadata) VALUES
(300, 'galeria', 'hero-title', 'texto', 'Galería de Fotos', '{}'),
(301, 'galeria', 'hero-subtitle', 'texto', 'Revive nuestras aventuras...', '{}'),
(302, 'galeria', 'search-placeholder', 'texto', 'Buscar fotos...', '{}');

-- Timeline (JSON)
INSERT INTO contenido_editable (id, seccion, identificador, tipo, contenido, metadata) VALUES
(250, 'sobre-nosotros', 'timeline-events', 'json', '[
  {"year": "1981", "title": "Fundación...", "description": "..."},
  {"year": "1990", "title": "10º aniversario...", "description": "..."},
  ...
]', '{}');

-- Valores (JSON)
INSERT INTO contenido_editable (id, seccion, identificador, tipo, contenido, metadata) VALUES
(260, 'sobre-nosotros', 'valores-list', 'json', '[
  {"title": "Comunidad", "description": "...", "icon": "users"},
  ...
]', '{}');

-- Metodología (JSON)
INSERT INTO contenido_editable (id, seccion, identificador, tipo, contenido, metadata) VALUES
(270, 'sobre-nosotros', 'metodologia-list', 'json', '[
  {"title": "La Promesa y la Ley Scout", "description": "..."},
  ...
]', '{}');
```

### 3. Próximos Pasos Recomendados

#### Fase 1: Completar editables de texto simple
1. ✅ Añadir EditableText en `/secciones` para títulos/descripciones
2. ✅ Crear seed script para nuevos contentIds

#### Fase 2: Implementar arrays editables
1. ✅ Timeline en sobre-nosotros
2. ✅ Valores en sobre-nosotros
3. ✅ Metodología en sobre-nosotros
4. ✅ Testimonios en landing
5. ⚠️ Actividades (decidir si usar EditableList o integrar con tabla `actividades`)

#### Fase 3: Secciones dinámicas
1. ✅ Convertir array `sections` en `/secciones` a editable
2. ✅ Permitir añadir nuevas secciones desde la UI

## 🗃️ Base de Datos

### Estructura Actual

```sql
CREATE TABLE contenido_editable (
  id SERIAL PRIMARY KEY,
  seccion VARCHAR(100),
  identificador VARCHAR(100),
  tipo VARCHAR(50), -- 'texto', 'imagen', 'json'
  contenido TEXT,
  url_archivo TEXT,
  metadata JSONB,
  orden INTEGER,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tipos de Contenido

1. **tipo='texto'**: Texto plano o HTML
   - Se edita con EditableText
   - Contenido en columna `contenido`

2. **tipo='imagen'**: URLs de imágenes
   - Se edita con EditableImage
   - URL en columna `url_archivo` o `contenido`

3. **tipo='json'**: Arrays u objetos JSON
   - Se edita con EditableList
   - JSON string en columna `contenido`
   - Permite añadir/eliminar elementos dinámicamente

## 📝 Patrones de Código Establecidos

### EditableText
```typescript
<EditableText
  contentId={120}
  identificador="sections-title"
  seccion="landing"
  as="h2"
  className="text-3xl font-bold"
>
  {getContent('sections-title', 'Fallback Text')}
</EditableText>
```

### EditableImage
```typescript
<EditableImage
  contentId={108}
  identificador="hero-image"
  seccion="landing"
  className="rounded-lg"
  alt="Descripción"
>
  {getContent('hero-image', '/placeholder.svg')}
</EditableImage>
```

### EditableList (Nuevo)
```typescript
<EditableList
  contentId={250}
  identificador="timeline-events"
  seccion="sobre-nosotros"
  fallback={defaultEvents}
  emptyItem={{ year: '', title: '', description: '' }}
  render={(event, index) => (
    <TimelineEvent event={event} />
  )}
  itemEditor={(item, onChange, onDelete) => (
    <EventEditor item={item} onChange={onChange} onDelete={onDelete} />
  )}
/>
```

### Hidratación de Contenido
```typescript
const { content, isLoading } = useSectionContent('seccion-slug')

const getContent = (key: string, fallback: string) => {
  return content[key]?.contenido || fallback
}
```

## 🔄 Flujo de Edición Completo

1. **Usuario inicia sesión como admin/scouter**
   - Se llama `await refreshUser()` → contexto actualizado
   - Botón "Editar Página" aparece inmediatamente

2. **Activa modo edición**
   - Click en "Editar Página" (toggle)
   - Todos los componentes EditableText/EditableImage muestran controles

3. **Edita contenido**
   - EditableText: inline editing con textarea
   - EditableImage: click para subir nueva imagen
   - EditableList: añadir/eliminar/reordenar items

4. **Guarda cambios**
   - Click en "Guardar Cambios" (botón verde)
   - Se envían todos los pendingChanges al backend
   - PUT `/api/content/:id` para cada cambio

5. **Recarga página**
   - useSectionContent hace GET `/api/content/page/:seccion`
   - Los componentes hidratan con el contenido actualizado
   - Cambios persisten ✅

## 📊 Resumen de Contentidos Editables

### Actualmente Editables ✅

| Página | Sección | Contenido | ContentID Range |
|--------|---------|-----------|----------------|
| Landing | Hero | Título, subtítulo, badges | 100-107 |
| Landing | Join Us | Imagen | 108 |
| Landing | Valores | Título, subtítulo, 4 valores | 109-119 |
| Landing | Secciones | Título, subtítulo | 120-121 |
| Landing | Actividades | Título, subtítulo | 122-123 |
| Landing | Join CTA | Título, descripción | 124-125 |
| Landing | Testimonios | Título, subtítulo | 126-127 |
| Sobre Nosotros | Hero | Título, subtítulo | 200-201 |
| Sobre Nosotros | Historia | Párrafos, imagen, caption | 202-209 |
| Galería | Hero | Título, subtítulo | 300-301 |
| Galería | Search | Placeholder | 302 |
| Contacto | Completo | Todos los bloques | 400+ |
| Secciones Scout | Completo | Hero, actividades, metodología, equipo | 1000+ |

### Pendientes de Editar ⏳

| Página | Sección | Tipo de Implementación |
|--------|---------|------------------------|
| /secciones | Títulos y descripciones | EditableText |
| /secciones | Array de secciones | EditableList JSON |
| /secciones | Array progresión | EditableList JSON |
| Sobre Nosotros | Timeline | EditableList JSON |
| Sobre Nosotros | Valores (tab) | EditableList JSON |
| Sobre Nosotros | Metodología (tab) | EditableList JSON |
| Landing | Testimonios (array) | EditableList JSON |
| Landing | Actividades (array) | Integrar con tabla o JSON |

## 🚀 Comandos Útiles

```bash
# Iniciar desarrollo
npm run dev

# Verificar imágenes en backend
curl -I http://localhost:5000/uploads/content/test.png

# Verificar contenido de una sección
curl http://localhost:5000/api/content/page/landing | jq

# Insertar contenido en BD (desde API)
curl -X POST http://localhost:5000/api/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"seccion":"landing","identificador":"test","tipo":"texto","contenido":"Test"}'
```

## 📚 Documentación Relacionada

- `DONDE_VER_LOS_CAMBIOS.md` - Guía de testing del sistema
- `RESUMEN_CAMBIOS_EDICION.md` - Historial de cambios
- `CLAUDE.md` - Documentación del proyecto completo

## ✅ Estado Final

### Totalmente Funcional ✅
- Login → refresh inmediato → botón aparece
- Edición de texto inline
- Upload y persistencia de imágenes
- Backend sirve imágenes correctamente
- Landing con bloques editables
- Galería sin PageEditor legacy

### Próximos Pasos 🔜
1. Completar `/secciones` con EditableText
2. Implementar timeline con EditableList
3. Implementar valores/metodología con EditableList
4. Crear scripts seed para nuevos contentIds
5. Testing completo del flujo end-to-end
