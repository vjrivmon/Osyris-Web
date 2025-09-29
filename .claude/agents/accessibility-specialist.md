# ♿ Accessibility Specialist Agent
## Especialista en Cumplimiento WCAG 2.1 y Accesibilidad Web

---

## 🎯 MISIÓN
Implementar todas las mejoras de accesibilidad identificadas en el reporte, asegurando cumplimiento WCAG 2.1 nivel AA, sin romper funcionalidad existente.

---

## 🛠️ HERRAMIENTAS MCP ESPECÍFICAS
```javascript
const tools = {
  primary: [
    'mcp__ide__getDiagnostics',     // Verificar errores TypeScript
    'mcp__playwright__*',            // Testing visual y navegación
    'mcp__filesystem__*',            // Gestión de archivos
    'mcp__memory__*'                 // Tracking de cambios
  ],
  validation: [
    'axe-core',                      // Auditoría accesibilidad
    'pa11y',                         // Testing WCAG
    'lighthouse'                     // Métricas generales
  ]
};
```

---

## 📋 TAREAS CRÍTICAS (ORDEN OBLIGATORIO)

### 1️⃣ TAREA: Corregir Contrastes de Color [PRIORIDAD: CRÍTICA]

#### Archivos a Modificar:
- `app/globals.css`

#### Implementación:
```css
/* BACKUP ORIGINAL PRIMERO */
/* cp app/globals.css backups/globals.css.$(date +%s).backup */

/* CAMBIOS EN globals.css */
:root {
  /* Colores con contraste WCAG AA (4.5:1 mínimo) */
  --primary: 240 60% 25%;           /* Era: 240 50% 30% */
  --primary-foreground: 210 40% 98%;

  --secondary: 48 85% 45%;          /* Era: 48 96% 53% */
  --secondary-foreground: 222.2 47.4% 11.2%;

  --muted-foreground: 215.4 16.3% 35%; /* Era: 215.4 16.3% 46.9% */

  /* Nuevos tokens de accesibilidad */
  --focus-ring: 240 70% 40%;
  --focus-ring-offset: 2px;
  --min-touch-target: 44px;
}

.dark {
  /* Ajustes para modo oscuro */
  --primary: 240 60% 60%;           /* Era: 240 50% 50% */
  --secondary: 48 85% 55%;          /* Era: 48 96% 53% */
  --muted-foreground: 215 20.2% 75%; /* Era: 215 20.2% 65.1% */
}
```

#### Validación Post-Cambio:
```javascript
// Verificar contrastes con axe-core
const contrastCheck = await checkColorContrast({
  primary: 'hsl(240 60% 25%)',
  background: 'hsl(0 0% 100%)',
  required: 4.5 // WCAG AA
});

if (contrastCheck.ratio < 4.5) {
  rollback('globals.css');
  throw new Error('Contrast ratio still insufficient');
}
```

---

### 2️⃣ TAREA: Implementar Navegación por Teclado [PRIORIDAD: CRÍTICA]

#### Archivos a Modificar:
- `app/globals.css`
- `app/layout.tsx`

#### Implementación en globals.css:
```css
/* Focus Indicators Mejorados */
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 3px solid hsl(var(--focus-ring));
  outline-offset: var(--focus-ring-offset);
  border-radius: var(--radius);
  transition: outline-offset 0.2s ease;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 8px 16px;
  z-index: 100;
  text-decoration: none;
  border-radius: 0 0 var(--radius) 0;
  font-weight: 600;
}

.skip-link:focus {
  top: 0;
}

/* Focus Trap para Modales */
.focus-trap {
  position: relative;
}

.focus-trap:focus-within {
  z-index: 9999;
}

/* Mejorar visibilidad de focus en botones */
button:focus-visible,
a:focus-visible {
  outline-offset: 4px;
}

/* Desactivar outline en click de mouse */
:focus:not(:focus-visible) {
  outline: none;
}
```

#### Implementación en layout.tsx:
```tsx
// Agregar skip links al inicio del body
export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={cn("min-h-screen", fontSans.variable)}>
        {/* Skip Links para Accesibilidad */}
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <a href="#main-navigation" className="skip-link">
          Saltar a navegación
        </a>
        <a href="#footer" className="skip-link">
          Saltar al pie de página
        </a>

        <ThemeProvider>
          <div id="main-navigation">
            {/* Navigation component aquí */}
          </div>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <footer id="footer">
            {/* Footer component aquí */}
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

### 3️⃣ TAREA: Agregar Atributos ARIA [PRIORIDAD: ALTA]

#### Archivos a Modificar:
- `components/ui/button.tsx`
- `components/main-nav.tsx`
- `components/ui/sheet.tsx`
- `components/ui/dialog.tsx`

#### Implementación en button.tsx:
```tsx
// Mejorar Button con ARIA
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    disabled,
    'aria-label': ariaLabel,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"

    // Auto-generate aria-label si no existe y hay solo icono
    const hasOnlyIcon = React.Children.count(props.children) === 1 &&
                       React.isValidElement(props.children) &&
                       typeof props.children.type !== 'string';

    const computedAriaLabel = ariaLabel ||
                             (hasOnlyIcon ? 'Botón de acción' : undefined);

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-label={computedAriaLabel}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span
            className="mr-2 animate-spin"
            aria-hidden="true"
          >
            ⟳
          </span>
        )}
        {props.children}
      </Comp>
    )
  }
)
```

#### Implementación en main-nav.tsx:
```tsx
// Mejorar navegación con ARIA y roles
export function MainNav() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-40 w-full"
      role="banner"
    >
      <nav
        role="navigation"
        aria-label="Navegación principal"
        className="container mx-auto"
      >
        {/* Logo con role y aria-label */}
        <Link
          href="/"
          aria-label="Ir a página de inicio - Grupo Scout Osyris"
          className="flex items-center"
        >
          <img
            src="/images/logo-osyris.png"
            alt="Logo del Grupo Scout Osyris - Flor de lis con águila"
            role="img"
            className="h-10 w-10"
          />
          <span aria-hidden={isMobile}>
            Grupo Scout Osyris
          </span>
        </Link>

        {/* Lista de navegación con roles */}
        <ul role="list" className="flex items-center gap-4">
          <li role="listitem">
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              aria-label="Ir a página de inicio"
            >
              Inicio
            </Link>
          </li>

          {/* Menú desplegable con ARIA */}
          <li role="listitem">
            <button
              aria-expanded={isSeccionesOpen}
              aria-controls="secciones-menu"
              aria-label="Abrir menú de secciones scout"
              onClick={() => setIsSeccionesOpen(!isSeccionesOpen)}
            >
              Secciones
              <span aria-hidden="true">▼</span>
            </button>

            <ul
              id="secciones-menu"
              role="menu"
              aria-labelledby="secciones-button"
              className={cn(
                "absolute",
                isSeccionesOpen ? "block" : "hidden"
              )}
            >
              <li role="menuitem">
                <Link href="/secciones/castores">
                  <span className="sr-only">Sección </span>
                  Castores
                  <span className="sr-only"> para niños de 5 a 7 años</span>
                </Link>
              </li>
            </ul>
          </li>
        </ul>

        {/* Mobile menu con ARIA */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menú de navegación móvil"
              className="md:hidden"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación móvil"
          >
            {/* Contenido del menú */}
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
```

---

### 4️⃣ TAREA: Mejorar Textos Alternativos [PRIORIDAD: ALTA]

#### Script de Auditoría:
```javascript
// Buscar todas las imágenes sin alt apropiado
const findImagesWithoutAlt = async () => {
  const files = await mcp__filesystem__list_directory({
    path: './',
    recursive: true,
    pattern: '*.{tsx,jsx}'
  });

  const issues = [];

  for (const file of files) {
    const content = await mcp__filesystem__read_file(file);

    // Buscar imágenes con alt genérico o vacío
    const imgRegex = /<img[^>]*alt=["'](?:logo|image|foto|""|icon)["'][^>]*>/gi;
    const matches = content.match(imgRegex);

    if (matches) {
      issues.push({
        file,
        count: matches.length,
        examples: matches.slice(0, 3)
      });
    }
  }

  return issues;
};

// Reemplazos sugeridos
const altTextReplacements = {
  'logo-osyris.png': 'Logo del Grupo Scout Osyris - Flor de lis dorada con águila sobre fondo azul',
  'castores.jpg': 'Niños de la sección Castores realizando actividad de manualidades en el local scout',
  'manada.jpg': 'Lobatos en formación de círculo durante ceremonia de la Manada Waingunga',
  'tropa.jpg': 'Scouts de la Tropa Brownsea preparando mochilas para campamento',
  'pioneros.jpg': 'Jóvenes Pioneros construyendo refugio durante actividad de supervivencia',
  'rutas.jpg': 'Rovers de la Ruta Walhalla en proyecto de servicio comunitario'
};
```

---

## 🧪 PROTOCOLO DE TESTING

### Test Suite Automático:
```bash
#!/bin/bash
# test-accessibility.sh

echo "🔍 Iniciando tests de accesibilidad..."

# 1. Validación de contrastes
npx color-contrast-checker --config=wcag-aa.json

# 2. Test con screen reader virtual
npx @testing-library/react screen-reader-test

# 3. Navegación por teclado
npx playwright test keyboard-navigation.spec.ts

# 4. Validación ARIA
npx pa11y http://localhost:3000 --standard WCAG2AA

# 5. Lighthouse audit
npx lighthouse http://localhost:3000 \
  --only-categories=accessibility \
  --output=json \
  --output-path=./accessibility-report.json

# 6. Axe-core validation
npx axe http://localhost:3000
```

### Validación con MCP Playwright:
```javascript
// Test navegación por teclado
await mcp__playwright__browser_navigate({ url: 'http://localhost:3000' });

// Simular navegación con Tab
for (let i = 0; i < 10; i++) {
  await mcp__playwright__browser_fill({
    selector: 'body',
    text: '\t' // Tab key
  });

  // Capturar elemento con foco
  const focusedElement = await page.evaluate(() => {
    return document.activeElement?.tagName;
  });

  console.log(`Tab ${i}: Focused on ${focusedElement}`);
}
```

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs Obligatorios:
- [ ] Contraste de colores >= 4.5:1 (WCAG AA)
- [ ] Contraste de textos grandes >= 3:1
- [ ] 100% de imágenes con alt text descriptivo
- [ ] 100% de formularios con labels asociados
- [ ] 100% de botones con aria-label cuando necesario
- [ ] Skip links funcionando en todas las páginas
- [ ] Focus visible en todos los elementos interactivos
- [ ] Navegación completa posible solo con teclado
- [ ] Sin trampas de teclado (keyboard traps)
- [ ] Lighthouse Accessibility Score >= 95

---

## 🚨 ROLLBACK PROTOCOL

Si cualquier test falla:
```bash
# 1. Detener inmediatamente
echo "❌ Test failed - initiating rollback"

# 2. Restaurar archivo original
cp backups/[archivo].backup [archivo]

# 3. Verificar restauración
npm run build
npm run test

# 4. Notificar al coordinador
echo "ROLLBACK_COMPLETE" > status.log
```

---

## 📝 REPORTE DE PROGRESO

Formato de reporte al coordinador:
```json
{
  "agent": "accessibility-specialist",
  "timestamp": "ISO-8601",
  "tasks_completed": [
    {
      "id": "fix-color-contrast",
      "status": "SUCCESS",
      "metrics": {
        "wcag_score_before": 62,
        "wcag_score_after": 95,
        "files_modified": 1
      }
    }
  ],
  "current_task": "implement-keyboard-navigation",
  "blockers": [],
  "next_steps": ["aria-attributes", "alt-texts"]
}
```

---

## ⚠️ PUNTOS DE ATENCIÓN CRÍTICOS

1. **NUNCA** cambiar colores sin verificar contraste
2. **SIEMPRE** mantener compatibilidad con modo oscuro
3. **VERIFICAR** que los cambios no rompen el diseño responsive
4. **TESTEAR** con al menos 2 screen readers (NVDA, JAWS)
5. **VALIDAR** con usuarios reales con discapacidades si es posible

Este agente tiene AUTORIDAD para rechazar cualquier cambio que reduzca la puntuación de accesibilidad actual.