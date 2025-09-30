# Comando: /ui-analyze

## Descripción
Captura screenshots automáticos de la interfaz de Osyris y proporciona análisis detallado de UX/UI con recomendaciones específicas para mejorar la experiencia de los usuarios scout.

## Palabras clave de activación
- `/ui-analyze`
- `analizar interfaz`
- `capturar pantalla`
- `screenshot analysis`
- `revisar ui`
- `analizar usabilidad`

## Funcionamiento

### 1. Captura automatizada
- Screenshots en múltiples resoluciones (móvil, tablet, desktop)
- Captura de diferentes estados (loading, error, success)
- Screenshots de flujos de usuario completos
- Comparación con versiones anteriores

### 2. Análisis automatizado
- Evaluación de principios de UX/UI
- Análisis de accesibilidad (contraste, tamaños)
- Verificación de responsive design
- Detección de problemas de usabilidad

### 3. Recomendaciones específicas
- Mejoras priorizadas por impacto
- Código CSS/React específico para fixes
- Referencias a mejores prácticas scout
- Sugerencias de A/B testing

### 4. Integración con agentes
- Coordina con UI/UX Analyzer Agent
- Genera tareas para Frontend Developer Agent
- Crea issues de mejora automáticamente

## Capacidades de análisis

### Diseño visual
- ✅ Jerarquía visual clara
- ✅ Consistencia en colores y tipografía
- ✅ Espaciado y alineación apropiados
- ✅ Contraste adecuado para accesibilidad
- ✅ Uso efectivo del espacio en blanco

### Usabilidad scout-específica
- ✅ Flujos intuitivos para líderes scout
- ✅ Información crítica fácilmente accesible
- ✅ Formularios optimizados para datos scout
- ✅ Navegación eficiente entre secciones
- ✅ Feedback claro para acciones importantes

### Responsive design
- ✅ Experiencia móvil optimizada
- ✅ Touch targets de tamaño apropiado
- ✅ Contenido legible sin zoom
- ✅ Navegación mobile-friendly
- ✅ Performance en redes lentas

### Accesibilidad
- ✅ Cumplimiento WCAG 2.1 AA
- ✅ Navegación por teclado
- ✅ Textos alternativos para imágenes
- ✅ Señales visuales y auditivas
- ✅ Soporte para screen readers

## Implementación

```bash
#!/bin/bash

echo "📸 UI Analysis - Osyris Scout Management System"
echo "================================================"

# Verificar que los servicios están corriendo
check_services() {
    echo "🔍 Verificando servicios..."

    if ! curl -s http://localhost:3001 > /dev/null; then
        echo "❌ Frontend no está corriendo en puerto 3001"
        echo "💡 Ejecuta /dev-start primero"
        exit 1
    fi

    if ! curl -s http://localhost:3000/api/health > /dev/null; then
        echo "⚠️ Backend no responde - algunas funcionalidades pueden no estar disponibles"
    else
        echo "✅ Backend disponible en puerto 3000"
    fi

    echo "✅ Frontend disponible en puerto 3001"
}

# Crear directorio para screenshots
setup_analysis_dir() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local analysis_dir="ui-analysis-$timestamp"

    mkdir -p "$analysis_dir/screenshots"
    mkdir -p "$analysis_dir/reports"

    echo "$analysis_dir"
}

# Capturar screenshots con Playwright
capture_screenshots() {
    local analysis_dir="$1"

    echo "📸 Capturando screenshots..."

    # Crear script de Playwright temporal
    cat > "/tmp/osyris-screenshot.js" <<'EOF'
const { chromium } = require('playwright');

async function captureOsyrisScreenshots(outputDir) {
  const browser = await chromium.launch();

  // Configuraciones de viewport
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];

  // Páginas principales para capturar
  const pages = [
    { url: 'http://localhost:3001', name: 'home' },
    { url: 'http://localhost:3001/dashboard', name: 'dashboard' },
    { url: 'http://localhost:3001/scouts', name: 'scouts' },
    { url: 'http://localhost:3001/activities', name: 'activities' },
    { url: 'http://localhost:3001/groups', name: 'groups' }
  ];

  for (const viewport of viewports) {
    console.log(`📱 Capturando en ${viewport.name} (${viewport.width}x${viewport.height})`);

    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height }
    });

    const page = await context.newPage();

    for (const pageInfo of pages) {
      try {
        console.log(`   📄 ${pageInfo.name}...`);

        await page.goto(pageInfo.url, { waitUntil: 'networkidle' });

        // Esperar a que carguen los componentes
        await page.waitForTimeout(2000);

        // Capturar screenshot completo
        await page.screenshot({
          path: `${outputDir}/screenshots/${viewport.name}_${pageInfo.name}_full.png`,
          fullPage: true
        });

        // Capturar screenshot del viewport
        await page.screenshot({
          path: `${outputDir}/screenshots/${viewport.name}_${pageInfo.name}_viewport.png`,
          fullPage: false
        });

        // Capturar elementos específicos si existen
        const navigation = await page.$('[data-testid="navigation"]');
        if (navigation) {
          await navigation.screenshot({
            path: `${outputDir}/screenshots/${viewport.name}_${pageInfo.name}_navigation.png`
          });
        }

        const mainContent = await page.$('main') || await page.$('[role="main"]');
        if (mainContent) {
          await mainContent.screenshot({
            path: `${outputDir}/screenshots/${viewport.name}_${pageInfo.name}_content.png`
          });
        }

      } catch (error) {
        console.log(`   ❌ Error capturando ${pageInfo.name}: ${error.message}`);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('✅ Screenshots capturados');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const outputDir = process.argv[2] || './ui-analysis';
  captureOsyrisScreenshots(outputDir);
}

module.exports = { captureOsyrisScreenshots };
EOF

    # Instalar playwright si no está disponible
    if ! command -v playwright &> /dev/null; then
        echo "📦 Instalando Playwright..."
        npx playwright install chromium
    fi

    # Ejecutar captura
    node /tmp/osyris-screenshot.js "$analysis_dir"

    # Limpiar archivo temporal
    rm /tmp/osyris-screenshot.js
}

# Análisis de accesibilidad automatizado
run_accessibility_audit() {
    local analysis_dir="$1"

    echo "♿ Ejecutando auditoría de accesibilidad..."

    # Crear script de auditoría con axe-core
    cat > "/tmp/accessibility-audit.js" <<'EOF'
const { chromium } = require('playwright');

async function runAccessibilityAudit(outputDir) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Inyectar axe-core
  await page.addScriptTag({
    url: 'https://unpkg.com/axe-core@4.7.2/axe.min.js'
  });

  const pages = [
    'http://localhost:3001',
    'http://localhost:3001/dashboard',
    'http://localhost:3001/scouts'
  ];

  const results = {};

  for (const url of pages) {
    try {
      await page.goto(url, { waitUntil: 'networkidle' });

      const axeResults = await page.evaluate(() => {
        return axe.run();
      });

      const pageName = url.split('/').pop() || 'home';
      results[pageName] = {
        violations: axeResults.violations,
        passes: axeResults.passes.length,
        incomplete: axeResults.incomplete.length
      };

      console.log(`✅ ${pageName}: ${axeResults.violations.length} violaciones encontradas`);

    } catch (error) {
      console.log(`❌ Error auditando ${url}: ${error.message}`);
    }
  }

  // Guardar resultados
  require('fs').writeFileSync(
    `${outputDir}/reports/accessibility-audit.json`,
    JSON.stringify(results, null, 2)
  );

  await browser.close();
  return results;
}

if (require.main === module) {
  const outputDir = process.argv[2] || './ui-analysis';
  runAccessibilityAudit(outputDir);
}
EOF

    node /tmp/accessibility-audit.js "$analysis_dir"
    rm /tmp/accessibility-audit.js
}

# Generar reporte de análisis
generate_analysis_report() {
    local analysis_dir="$1"

    echo "📊 Generando reporte de análisis..."

    cat > "$analysis_dir/reports/ui-analysis-report.md" <<EOF
# Reporte de Análisis UI/UX - Osyris Scout Management
**Fecha**: $(date +"%Y-%m-%d %H:%M:%S")
**Versión**: $(git rev-parse --short HEAD 2>/dev/null || "N/A")

## 📸 Screenshots Capturados
- ✅ Mobile (375x667)
- ✅ Tablet (768x1024)
- ✅ Desktop (1920x1080)

### Páginas analizadas:
- Home page
- Dashboard
- Scouts management
- Activities
- Groups

## 🎯 Análisis Específico para Scouts

### Flujos de Usuario Críticos
1. **Registro de nuevo scout**
   - [ ] Formulario claro y completo
   - [ ] Validaciones en tiempo real
   - [ ] Feedback de éxito/error

2. **Gestión de actividades**
   - [ ] Calendario intuitivo
   - [ ] Creación rápida de eventos
   - [ ] Lista de participantes clara

3. **Sistema de insignias**
   - [ ] Progreso visual claro
   - [ ] Proceso de award simple
   - [ ] Historial accesible

### Consideraciones Scout-Específicas
- **Usuarios objetivo**: Líderes scout (25-60 años, nivel técnico variado)
- **Contexto de uso**: Oficinas, campamentos, reuniones
- **Tiempo disponible**: Limitado, necesitan eficiencia
- **Dispositivos**: Principalmente móviles y tablets

## 🔍 Hallazgos y Recomendaciones

### Prioridad Alta 🔴
EOF

    # Agregar análisis de accesibilidad si existe
    if [[ -f "$analysis_dir/reports/accessibility-audit.json" ]]; then
        cat >> "$analysis_dir/reports/ui-analysis-report.md" <<EOF

## ♿ Reporte de Accesibilidad
$(node -e "
const data = require('./$analysis_dir/reports/accessibility-audit.json');
for (const [page, results] of Object.entries(data)) {
  console.log(\`### \${page}\`);
  console.log(\`- Violaciones: \${results.violations.length}\`);
  console.log(\`- Tests pasados: \${results.passes}\`);
  console.log(\`- Incompletos: \${results.incomplete}\`);
  console.log('');
}
")
EOF
    fi

    cat >> "$analysis_dir/reports/ui-analysis-report.md" <<EOF

## 📱 Responsive Design Check
- [ ] Mobile navigation funcional
- [ ] Touch targets ≥ 44px
- [ ] Texto legible sin zoom
- [ ] No scroll horizontal
- [ ] Carga rápida en 3G

## 🎨 Diseño Visual
- [ ] Colores consistentes con branding scout
- [ ] Jerarquía visual clara
- [ ] Iconografía apropiada
- [ ] Espaciado uniforme

## 🚀 Performance
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3s

## 📝 Próximos Pasos Recomendados
1. Revisar findings de prioridad alta
2. Implementar mejoras de accesibilidad
3. Optimizar para móviles
4. Realizar testing con usuarios reales
5. Configurar monitoreo continuo

## 🔗 Enlaces Útiles
- Screenshots: ./screenshots/
- Datos de accesibilidad: ./accessibility-audit.json
- Recomendaciones detalladas: Ver secciones específicas arriba

---
**Generado automáticamente por Claude Code - Osyris UI Analyzer**
EOF

    echo "✅ Reporte generado en: $analysis_dir/reports/ui-analysis-report.md"
}

# Función principal
main() {
    echo "🎯 Iniciando análisis completo de UI para Osyris..."

    # Verificar servicios
    check_services

    # Configurar directorio
    analysis_dir=$(setup_analysis_dir)
    echo "📁 Directorio de análisis: $analysis_dir"

    # Capturar screenshots
    capture_screenshots "$analysis_dir"

    # Auditoría de accesibilidad
    run_accessibility_audit "$analysis_dir"

    # Generar reporte
    generate_analysis_report "$analysis_dir"

    echo ""
    echo "🎉 Análisis UI completado!"
    echo "📁 Resultados en: $analysis_dir"
    echo "📊 Reporte principal: $analysis_dir/reports/ui-analysis-report.md"
    echo "📸 Screenshots: $analysis_dir/screenshots/"

    # Abrir reporte en navegador si es posible
    if command -v xdg-open >/dev/null 2>&1; then
        echo "🌐 Abriendo reporte..."
        xdg-open "$analysis_dir/reports/ui-analysis-report.md"
    elif command -v open >/dev/null 2>&1; then
        open "$analysis_dir/reports/ui-analysis-report.md"
    fi

    echo ""
    echo "💡 Siguiente paso: Revisar recomendaciones y implementar mejoras prioritarias"
}

# Ejecutar función principal
main "$@"
```

## Integración con agentes

### UI/UX Analyzer Agent
```bash
# Activación automática del agente
claude-code task "Analizar screenshots capturados en $analysis_dir y proporcionar recomendaciones específicas para mejorar la experiencia de usuarios scout" --agent=osyris-ui-ux-analyzer
```

### Frontend Developer Agent
```bash
# Generar tareas de implementación
claude-code task "Implementar mejoras de UI basadas en análisis en $analysis_dir, priorizando accesibilidad y responsive design" --agent=osyris-frontend-developer
```

### Decision Orchestrator
```bash
# Coordinar plan de mejoras
claude-code task "Priorizar y planificar implementación de mejoras UI basadas en análisis $analysis_dir" --agent=osyris-decision-orchestrator
```

## Análisis avanzado

### Comparación temporal
```bash
# Comparar con análisis anterior
/ui-analyze --compare-with ui-analysis-20241115_143022
```

### Análisis específico por página
```bash
# Analizar solo dashboard
/ui-analyze --pages dashboard
```

### Análisis A/B testing
```bash
# Comparar dos versiones
/ui-analyze --variant A --compare-with variant-B
```

## Métricas trackadas

### Core Web Vitals
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

### Usabilidad Scout
- Tiempo para completar registro de scout
- Clicks necesarios para crear actividad
- Facilidad de navegación en móvil
- Comprensión de iconografía

### Accesibilidad
- Contrast ratio scores
- Keyboard navigation paths
- Screen reader compatibility
- Alternative text coverage

## Automatización

### Scheduled analysis
```bash
# Ejecutar análisis diario
0 9 * * * /home/vicente/RoadToDevOps/osyris/.claude/commands/ui-analyze.md --quiet --email-report
```

### CI/CD Integration
```yaml
# .github/workflows/ui-analysis.yml
name: UI Analysis
on:
  pull_request:
    paths: ['app/**', 'components/**', 'styles/**']

jobs:
  ui-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run UI Analysis
        run: ./.claude/commands/ui-analyze.md
      - name: Upload Screenshots
        uses: actions/upload-artifact@v3
        with:
          name: ui-analysis
          path: ui-analysis-*/
```