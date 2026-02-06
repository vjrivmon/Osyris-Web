# 🎨 Rediseño: Simplificar Dashboard del Kraal (Aula Virtual)

## 🎯 Resumen Ejecutivo

**Problema:** El dashboard del Kraal tiene 6 tabs, de los cuales 3 están en desuso (Documentos, Solicitudes, Mensajes). Además, las nuevas funcionalidades de verificación de circulares (#5) y asistencia in-situ (#6) no tienen acceso claro desde la navegación.

**Solución:** Simplificar a 3 tabs permanentes + tabs contextuales que aparecen solo cuando hay campamento/salida ese día.

**Impacto:** UX más limpia, menos confusión, funcionalidades de campamento accesibles justo cuando se necesitan.

---

## 📋 Análisis Actual

### Navegación Actual (6 tabs)
```
Inicio | Educandos | Calendario | Documentos | Solicitudes | Mensajes
                                    ↑              ↑            ↑
                                 EN DESUSO     EN DESUSO    EN DESUSO
```

### Archivos Afectados

#### 🗑️ A ELIMINAR (páginas en desuso)
| Ruta | Archivo | Motivo |
|------|---------|--------|
| `/aula-virtual/documentos` | `page.tsx` | Funcionalidad no usada |
| `/aula-virtual/comunicaciones` | `page.tsx` | Funcionalidad no usada |
| `/aula-virtual/solicitudes-desbloqueo` | `page.tsx` | Funcionalidad no usada |

#### ✏️ A MODIFICAR (navegación)
| Componente | Archivo | Cambio |
|------------|---------|--------|
| NavTabs | `src/components/aula-virtual/nav-tabs.tsx` | Reducir a 3 tabs + contextuales |
| MobileNav | `src/components/aula-virtual/mobile-nav.tsx` | Reducir a 3 tabs + contextuales |

#### ✅ A MANTENER (sin cambios)
- `/aula-virtual/page.tsx` (Inicio)
- `/aula-virtual/educandos/page.tsx`
- `/aula-virtual/calendario/page.tsx`
- `/aula-virtual/verificacion-circulares/page.tsx`
- `/aula-virtual/asistencia/[actividadId]/page.tsx`
- `/aula-virtual/ajustes/page.tsx`
- `/aula-virtual/admin/page.tsx`
- `/aula-virtual/documentos-pendientes/page.tsx` (acceso desde notificaciones)

---

## 🔧 Propuesta de Diseño

### Navegación Propuesta

**Tabs Permanentes (siempre visibles):**
```
Inicio | Educandos | Calendario
```

**Tabs Contextuales (solo cuando hay campamento/salida HOY):**
```
Inicio | Educandos | Calendario | 🏕️ Asistencia | ✓ Circulares
                                       ↑               ↑
                               Solo visible si hay campamento hoy
```

### Lógica de Activación

```typescript
// Pseudo-código para determinar si mostrar tabs contextuales
const actividadesHoy = await getActividadesDelDia(new Date())
const hayCampamentoHoy = actividadesHoy.some(a => 
  a.tipo === 'campamento' || a.tipo === 'salida'
)

if (hayCampamentoHoy) {
  // Mostrar tabs: Asistencia, Circulares
  // Con badge indicando el campamento activo
}
```

### Diseño Visual de Tabs Contextuales

```
┌─────────────────────────────────────────────────────────────────┐
│ 🏕️ Osyris   │ Inicio │ Educandos │ Calendario │ 🔴 Asistencia │ 🔴 Circulares │
└─────────────────────────────────────────────────────────────────┘
                                                    ↑
                                        Badge rojo = "Campa Inicio"
```

---

## ⚠️ Edge Cases

| # | Escenario | Comportamiento |
|---|-----------|----------------|
| 1 | Campamento de varios días | Tabs visibles todos los días del campamento |
| 2 | Varios campamentos mismo día | Mostrar tabs con selector de campamento |
| 3 | Scouter accede fuera del día | Tabs no visibles (acceso directo por URL sí funciona) |
| 4 | Admin quiere ver cualquier día | Admin puede forzar visibilidad desde Ajustes |

---

## ✅ Criterios de Aceptación

### Funcionales
- [ ] Solo 3 tabs permanentes: Inicio, Educandos, Calendario
- [ ] Tabs contextuales aparecen solo si hay campamento/salida HOY
- [ ] Badge en tabs contextuales indica nombre del campamento
- [ ] Click en tab Asistencia → `/aula-virtual/asistencia/{actividadId}`
- [ ] Click en tab Circulares → `/aula-virtual/verificacion-circulares?campamento={id}`
- [ ] URLs directas siguen funcionando (para compartir)

### No Funcionales
- [ ] Responsive: tabs colapsan correctamente en móvil
- [ ] Performance: query de actividades del día debe ser < 200ms
- [ ] Accesibilidad: tabs navegables con teclado

### Eliminación Limpia
- [ ] Eliminar carpeta `documentos/`
- [ ] Eliminar carpeta `comunicaciones/`
- [ ] Eliminar carpeta `solicitudes-desbloqueo/`
- [ ] Eliminar hook `useSolicitudesDesbloqueo` si no se usa en otro sitio
- [ ] Eliminar rutas del API si las hay

---

## 🧪 Plan de Testing

### Tests Manuales
1. [ ] Login como scouter → solo ver 3 tabs
2. [ ] Simular fecha de campamento → ver 5 tabs
3. [ ] Click en Asistencia → llegar a página correcta
4. [ ] Click en Circulares → llegar a página correcta
5. [ ] Probar en móvil (menú hamburguesa)

---

## 🚀 Plan de Implementación

### Fase 1: Eliminar páginas en desuso (30 min)
- [ ] Eliminar `/aula-virtual/documentos/`
- [ ] Eliminar `/aula-virtual/comunicaciones/`
- [ ] Eliminar `/aula-virtual/solicitudes-desbloqueo/`
- [ ] Limpiar imports huérfanos

### Fase 2: Crear hook para actividades del día (30 min)
- [ ] Crear `useActividadesHoy.ts`
- [ ] Query a API de actividades filtrado por fecha
- [ ] Exponer: `actividadesHoy`, `hayCampamentoHoy`, `campamentoActivo`

### Fase 3: Rediseñar navegación (1h)
- [ ] Modificar `nav-tabs.tsx` con lógica contextual
- [ ] Modificar `mobile-nav.tsx` con lógica contextual
- [ ] Añadir badge con nombre de campamento

### Fase 4: Testing y pulido (30 min)
- [ ] Probar todos los escenarios
- [ ] Verificar responsive
- [ ] Commit y PR

---

## 📎 Archivos Relacionados

```
src/
├── app/aula-virtual/
│   ├── documentos/           # 🗑️ ELIMINAR
│   ├── comunicaciones/       # 🗑️ ELIMINAR
│   ├── solicitudes-desbloqueo/ # 🗑️ ELIMINAR
│   ├── verificacion-circulares/ # ✅ MANTENER (tab contextual)
│   ├── asistencia/           # ✅ MANTENER (tab contextual)
│   ├── educandos/            # ✅ MANTENER (tab permanente)
│   ├── calendario/           # ✅ MANTENER (tab permanente)
│   └── page.tsx              # ✅ MANTENER (tab permanente)
├── components/aula-virtual/
│   ├── nav-tabs.tsx          # ✏️ MODIFICAR
│   └── mobile-nav.tsx        # ✏️ MODIFICAR
└── hooks/
    ├── useSolicitudesDesbloqueo.ts  # 🗑️ ELIMINAR (si no se usa)
    └── useActividadesHoy.ts         # 🆕 CREAR
```

---

## 🎯 Prioridad

**Alta** - Mejora significativa de UX y limpieza de código muerto.

## 📊 Estimación

**2.5 - 3 horas** de desarrollo
