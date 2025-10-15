# 🎭 Configuración Playwright MCP para Osyris

## 📋 Descripción

Este documento detalla la configuración completa del servidor MCP (Model Context Protocol) de Playwright para el proyecto Osyris Scout Management. Esta configuración permite a Claude Code realizar pruebas automatizadas E2E, capturas de pantalla y auditorías de rendimiento.

## 🚀 Configuración Implementada

### Archivos de Configuración

- **`.claude/.mcp.json`** - Configuración principal del servidor MCP
- **`.claude/playwright-mcp.config.json`** - Configuración específica de Playwright
- **`.claude/playwright-automation-scenarios.json`** - Escenarios de automatización E2E
- **`scripts/test-playwright-mcp.sh`** - Script de verificación y prueba

### Parámetros Optimizados

```json
{
  "playwright": {
    "command": "npx",
    "args": [
      "-y",
      "@playwright/mcp@latest",
      "--headless",
      "--browser=chromium", 
      "--viewport-size=1280x720",
      "--timeout-action=10000",
      "--timeout-navigation=30000",
      "--output-dir=./screenshots",
      "--save-trace",
      "--ignore-https-errors"
    ]
  }
}
```

## 🔧 Características Principales

### ✅ Navegador Configurado
- **Chromium** como navegador principal
- Modo **headless** para mejor rendimiento
- Viewport optimizado **1280x720**
- Timeouts ajustados para tu entorno

### ✅ Directorios de Salida
```bash
screenshots/  # Capturas de pantalla
videos/       # Grabaciones (opcional)
traces/       # Trazas de debugging
```

### ✅ Seguridad y Red
- Ignora errores HTTPS para desarrollo local
- Configurado para trabajar con localhost:3000 y localhost:5000
- Sandbox deshabilitado para entorno Linux

## 🎯 Escenarios de Automatización Incluidos

### 1. **Flujo de Autenticación**
- Login completo
- Validación de credenciales
- Redirección al dashboard
- Capturas de pantalla automáticas

### 2. **Navegación por Dashboard**
- Prueba de menús de navegación
- Verificación de secciones principales
- Test de responsividad

### 3. **Panel de Administración**
- Acceso a funciones admin
- Verificación de permisos
- Control de errores en consola

### 4. **Diseño Responsivo**
- Tests en múltiples resoluciones
- Desktop: 1920x1080
- Tablet: 768x1024
- Móvil: 375x667

### 5. **Validación de Formularios**
- Campos requeridos
- Formato de email
- Mensajes de error/éxito

### 6. **Auditoría de Rendimiento**
- First Contentful Paint
- Largest Contentful Paint
- Cumulative Layout Shift
- Análisis de peticiones de red

## 🚀 Uso con Claude Code

### Comandos Básicos

```bash
# Capturar pantalla de la página principal
"Toma una captura de pantalla de http://localhost:3000"

# Probar el flujo de login
"Ejecuta el escenario de autenticación completo"

# Verificar responsividad
"Prueba el diseño responsivo en diferentes resoluciones"

# Auditoría de rendimiento
"Realiza una auditoría de rendimiento de la página principal"
```

### Comandos Avanzados

```bash
# Test específico de formularios
"Valida el formulario de contacto con datos incorrectos"

# Navegación completa
"Prueba toda la navegación del dashboard y toma capturas"

# Verificación de admin
"Verifica que el panel de administración carga correctamente"
```

## 🔍 Debugging y Monitoreo

### Logs y Trazas
- **Screenshots**: `./screenshots/` - Capturas automáticas
- **Traces**: `./traces/` - Archivos de traza para debugging
- **Logs**: `./logs/mcp-*` - Logs del servidor MCP

### Verificación del Estado
```bash
# Ejecutar script de verificación
./scripts/test-playwright-mcp.sh

# Verificar instalación de navegadores
npx playwright install --dry-run

# Probar servidor MCP manualmente
npx -y @playwright/mcp@latest --help
```

## 🛠️ Resolución de Problemas

### Error: "Cannot find browser"
```bash
npx playwright install chromium
```

### Error: "MCP server not responding"
1. Verificar que Node.js está actualizado
2. Reinstalar dependencias: `npm install`
3. Limpiar cache: `npm cache clean --force`

### Error: "Permission denied"
```bash
chmod +x scripts/test-playwright-mcp.sh
```

### Error: "Timeout en navegación"
- Aumentar timeout en configuración
- Verificar que el servidor local está corriendo
- Comprobar conectividad de red

## 📈 Mejores Prácticas

### 🎯 Para Testing E2E
1. **Siempre usar data-testid** para selectores estables
2. **Esperar elementos** antes de interactuar
3. **Capturar screenshots** en puntos clave
4. **Verificar console.errors** después de acciones

### 🚀 Para Rendimiento
1. **Usar networkidle** para esperar carga completa
2. **Medir métricas Core Web Vitals**
3. **Analizar peticiones de red**
4. **Optimizar timeouts según necesidad**

### 🔒 Para Seguridad
1. **No hardcodear credenciales** reales
2. **Usar datos de prueba** específicos
3. **Verificar permisos** en cada test
4. **Limpiar datos** después de tests

## 🔄 Mantenimiento

### Actualizaciones Regulares
```bash
# Actualizar Playwright MCP
npm update @playwright/test

# Actualizar navegadores
npx playwright install

# Verificar configuración
./scripts/test-playwright-mcp.sh
```

### Monitoreo de Rendimiento
- Revisar métricas de rendimiento semanalmente
- Comparar screenshots para detectar regresiones visuales
- Analizar logs para identificar problemas recurrentes

## 🎉 Estado Actual

✅ **Configuración Completa**
- Servidor MCP configurado y probado
- Navegadores instalados (Chromium)
- Directorios de salida creados
- Escenarios de automatización definidos
- Scripts de verificación listos

## 📞 Próximos Pasos

1. **Reinicia Claude Code** para aplicar la configuración
2. **Prueba comandos básicos** desde Claude Code
3. **Personaliza escenarios** según tus necesidades específicas
4. **Integra con CI/CD** para automatización completa

---

**Autor**: Vicente - DevOps Training  
**Fecha**: 2025-10-04  
**Versión**: 1.0.0  

¡Configuración de Playwright MCP lista para usar! 🚀
