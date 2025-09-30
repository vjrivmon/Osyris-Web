# 🎨 Osyris Scout Management - Design System

## 📐 **Principios de Diseño**

### 🎯 **Filosofía Visual**
- **Profesional pero Accesible:** Interfaz limpia que inspire confianza a las familias
- **Scout Identity:** Colores y elementos que reflejen los valores scout
- **Funcionalidad Primero:** UX/UI que priorice la facilidad de uso sobre la complejidad visual

### 🌟 **Valores Clave**
- **Claridad:** Información fácil de encontrar y entender
- **Consistencia:** Patrones repetibles en toda la aplicación
- **Accesibilidad:** Cumplimiento WCAG 2.1 AA
- **Responsividad:** Excelente experiencia en todos los dispositivos

## 🎨 **Sistema de Colores**

### 🏕️ **Colores Principales**
```css
/* Primary Scout Colors */
--primary: 142 69 133;        /* Verde Scout principal */
--primary-foreground: 98% 0% 0%;

/* Secondary */
--secondary: 210 40% 98%;
--secondary-foreground: 222.2 84% 4.9%;

/* Destructive */
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;
```

### 🏕️ **Colores de Secciones Scout**
```css
/* Colores oficiales por sección */
.castores {
  --section-color: 30 100% 50%;  /* Naranja */
  --section-bg: 30 100% 95%;
}

.lobatos {
  --section-color: 45 100% 50%;  /* Amarillo */
  --section-bg: 45 100% 95%;
}

.tropa {
  --section-color: 120 60% 40%;  /* Verde */
  --section-bg: 120 60% 95%;
}

.pioneros {
  --section-color: 0 84% 60%;    /* Rojo */
  --section-bg: 0 84% 95%;
}

.rutas {
  --section-color: 210 100% 40%; /* Azul */
  --section-bg: 210 100% 95%;
}
```

### 🌙 **Soporte Dark Mode**
- Implementado con CSS variables
- Transiciones suaves entre temas
- Respeto por preferencias del sistema

## 📱 **Sistema Responsivo**

### 📐 **Breakpoints**
```css
/* Tailwind CSS Breakpoints */
sm: 640px    /* Móvil grande */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop pequeño */
xl: 1280px   /* Desktop grande */
2xl: 1536px  /* Desktop ultra-wide */
```

### 📱 **Patrones Responsivos**
- **Mobile First:** Diseño pensado primero para móviles
- **Sidebar Adaptativo:** Colapsa en móvil, sidebar completo en desktop
- **Navegación Contextual:** Hamburger menu en móvil, navegación completa en desktop
- **Tipografía Escalable:** Tamaños que se adaptan según el dispositivo

## 🧩 **Componentes Base**

### 🔘 **Botones**
```typescript
// Variantes principales
variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
size: "default" | "sm" | "lg" | "icon"

// Ejemplos de uso
<Button variant="default">Acción Principal</Button>
<Button variant="outline">Acción Secundaria</Button>
<Button variant="ghost" size="icon">
  <Icon className="h-4 w-4" />
</Button>
```

### 📋 **Cards**
```typescript
// Estructura estándar
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción opcional</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenido principal */}
  </CardContent>
  <CardFooter>
    {/* Acciones opcionales */}
  </CardFooter>
</Card>
```

### 🏷️ **Badges**
```typescript
// Para secciones scout
<Badge className="bg-orange-100 text-orange-800">Castores</Badge>
<Badge className="bg-yellow-100 text-yellow-800">Lobatos</Badge>
<Badge className="bg-green-100 text-green-800">Tropa</Badge>
<Badge className="bg-red-100 text-red-800">Pioneros</Badge>
<Badge className="bg-blue-100 text-blue-800">Rutas</Badge>
```

## 🗂️ **Patrones de Layout**

### 📄 **Estructura de Página**
```typescript
// Layout estándar para páginas públicas
<div className="flex min-h-screen flex-col">
  <MainNav />
  <main className="flex-1">
    <div className="container mx-auto py-8 px-4">
      {/* Contenido principal */}
    </div>
  </main>
  <SiteFooter />
</div>
```

### 🎛️ **Dashboard Layout**
```typescript
// Layout para áreas privadas
<div className="flex h-screen overflow-hidden">
  <Sidebar />
  <div className="flex flex-1 flex-col">
    <Header />
    <main className="flex-1 overflow-auto p-6">
      <Breadcrumb />
      {children}
    </main>
  </div>
</div>
```

## 🎯 **Patrones de Navegación**

### 🧭 **Navegación Principal**
- **Logo:** Siempre visible, enlace a home
- **Menú Horizontal:** Secciones principales del sitio
- **CTA:** Botón destacado para login/registro
- **Responsive:** Hamburger menu en móvil

### 🔗 **Navegación Secundaria**
- **Breadcrumbs:** Orientación contextual
- **Tabs:** Para contenido relacionado
- **Sidebar:** Navegación de dashboard con iconos

### ✅ **Estados Activos**
```css
/* Estado activo en navegación */
.nav-active {
  @apply bg-primary/10 text-primary;
}

/* Hover states */
.nav-item:hover {
  @apply bg-accent text-accent-foreground;
}
```

## 📝 **Tipografía**

### 🔤 **Jerarquía de Títulos**
```css
h1: text-4xl font-bold      /* Títulos principales */
h2: text-2xl font-bold      /* Secciones importantes */
h3: text-lg font-medium     /* Subsecciones */
h4: text-base font-medium   /* Títulos de cards */
```

### 📰 **Texto Corporativo**
```css
.text-body: text-sm         /* Texto base */
.text-muted: text-xs text-muted-foreground  /* Texto secundario */
.text-caption: text-xs      /* Captions y metadatos */
```

## 🎪 **Micro-interacciones**

### ⚡ **Transiciones**
```css
/* Transiciones estándar */
.transition-standard {
  transition: all 0.2s ease-in-out;
}

/* Hover effects */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}
```

### 🎭 **Estados de Loading**
- **Skeleton Loaders:** Para contenido que se está cargando
- **Spinners:** Para acciones que requieren espera
- **Progress Bars:** Para procesos con progreso medible

## ♿ **Accesibilidad**

### 🎯 **Estándares**
- **WCAG 2.1 AA** compliance
- **Contraste mínimo:** 4.5:1 para texto normal
- **Focus visible:** Outline claro en navegación por teclado
- **ARIA labels:** Descripciones para lectores de pantalla

### ⌨️ **Navegación por Teclado**
```typescript
// Atributos importantes
tabIndex={0}                    // Elemento enfocable
aria-label="Descripción"       // Etiqueta para SR
aria-current="page"            // Página actual
role="button"                  // Rol del elemento
```

## 📊 **Componentes Específicos**

### 📅 **Calendario**
- **Vista Mensual:** Grid 7x6 para días
- **Eventos:** Colores por sección scout
- **Responsivo:** Vista compacta en móvil
- **Interactivo:** Click para detalles

### 💬 **Logout Confirmation**
```typescript
// Patrón para confirmaciones críticas
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost">Cerrar sesión</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
      <AlertDialogDescription>
        Descripción del impacto de la acción.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive">
        Confirmar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## 🔧 **Herramientas y Setup**

### 🎨 **Stack de Styling**
- **Tailwind CSS:** Utility-first CSS framework
- **Shadcn/ui:** Componentes base consistentes
- **CSS Variables:** Para theming dinámico
- **Clsx/CN:** Para clases condicionales

### 📏 **Espaciado Consistente**
```css
/* Sistema de espaciado basado en 4px */
space-1: 0.25rem  /* 4px */
space-2: 0.5rem   /* 8px */
space-4: 1rem     /* 16px */
space-6: 1.5rem   /* 24px */
space-8: 2rem     /* 32px */
```

## 🚀 **Futuras Mejoras**

### 🎯 **Roadmap UX/UI**
1. **Animaciones:** Micro-interacciones más sofisticadas
2. **Themes:** Temas personalizables por sección
3. **PWA:** Funcionalidades offline
4. **Performance:** Lazy loading optimizado
5. **A11y:** Audit completo de accesibilidad

### 📱 **Mobile Enhancements**
- **Gestos:** Swipe navigation
- **Touch:** Áreas de touch más grandes
- **Offline:** Funcionalidad sin conexión
- **Native:** Integración con funciones del dispositivo

## 📏 **Principio de No-Scroll**

### 🎯 **# to memorize: Regla Fundamental**
- **Siempre que sea posible, el contenido debe mostrarse sin necesidad de hacer scroll**
- **Especialmente importante en:** Calendarios, dashboards, formularios principales
- **Técnica:** Usar `height: 100vh`, `flex-1`, `overflow-hidden` para layouts de altura completa

### 📅 **Ejemplo: Calendario Optimizado**
```css
/* Estructura sin scroll */
.calendar-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.calendar-header {
  flex-shrink: 0; /* Header fijo */
}

.calendar-content {
  flex: 1;        /* Toma espacio restante */
  min-height: 0;  /* Permite shrinking */
}
```

## 🚫 **Política de Datos Mock**

### 🎯 **# to memorize: Sin Datos Falsos**
- **Prohibido:** Usar datos mock en calendarios y componentes principales
- **Requerido:** Mostrar estados vacíos informativos
- **Patrón:** Siempre incluir mensaje explicativo cuando no hay datos

### 📅 **Ejemplo: Estado Vacío del Calendario**
```typescript
// ❌ MAL: Datos mock
const events = [
  { title: "Evento falso", date: "2024-12-01" }
]

// ✅ BIEN: Sin datos mock
const events: CalendarEvent[] = []

// ✅ BIEN: Estado vacío informativo
{events.length === 0 && (
  <Card>
    <CardContent>
      <p>Las actividades se mostrarán cuando sean programadas.</p>
      <p>Contacto: kraal@grupoosyris.es</p>
    </CardContent>
  </Card>
)}
```

---

## 🎨 **Resumen para Desarrolladores**

**Al desarrollar nuevas funcionalidades:**

1. ✅ **Usar componentes Shadcn/ui** existentes cuando sea posible
2. ✅ **Seguir patrones de layout** establecidos
3. ✅ **Implementar responsive design** desde el inicio
4. ✅ **Incluir estados de accesibilidad** (focus, aria-labels)
5. ✅ **Usar colores de sección** para badges y elementos scout
6. ✅ **Implementar confirmaciones** para acciones destructivas
7. ✅ **Seguir convenciones de naming** de CSS y componentes
8. ✅ **# to memorize: Evitar scroll innecesario** - contenido visible sin desplazamiento
9. ✅ **# to memorize: Sin datos mock** - usar estados vacíos informativos

**Este design system garantiza una experiencia coherente y profesional en toda la aplicación Osyris.**