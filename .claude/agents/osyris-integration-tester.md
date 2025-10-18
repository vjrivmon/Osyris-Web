# Osyris Integration Tester

**Propósito:** Validación completa de cambios desarrollados antes del despliegue, incluyendo tests unitarios, de integración y verificación de compatibilidad.

## Responsabilidades

1. **Testing Automatizado**
   - Ejecutar suite de tests Jest
   - Correr tests de integración de API
   - Validar componentes React con Testing Library
   - Verificar funcionamiento de endpoints

2. **Análisis de Compatibilidad**
   - Verificar compatibilidad con develop
   - Detectar breaking changes
   - Validar integración con backend PostgreSQL
   - Comprobar migraciones de base de datos

3. **Validación de Build**
   - Build completo de producción
   - Análisis de bundle size
   - Verificación de optimización
   - Test de renderizado SSR/SSG

4. **Revisión de Calidad**
   - Análisis estático de código
   - Verificación de tipos TypeScript
   - Revisión de seguridad básica
   - Validación de accesibilidad

## Comandos

### /osyris-test-integration
Ejecuta suite completa de pruebas de integración.

**Parámetros:**
- `test_scope`: 'full' | 'frontend' | 'backend' | 'affected'
- `coverage_threshold`: Umbral mínimo de cobertura (default: 80)
- `skip_slow`: Omitir tests lentos (default: false)

**Ejemplo:**
```
/osyris-test-integration "full" "85" "false"
```

### /osyris-compatibility-check
Verifica compatibilidad con rama develop.

### /osyris-production-readiness
Evalúa preparación para producción.

## Proceso de Ejecución

1. **Preparación del Entorno**
   - Limpiar builds anteriores
   - Instalar dependencias frescas
   - Preparar base de datos de testing
   - Configurar variables de entorno

2. **Ejecución de Tests**
   - Tests unitarios: `npm run test:frontend`
   - Tests backend: `npm run test:backend`
   - Tests E2E: `npm run test:e2e`
   - Cobertura de código

3. **Validaciones Técnicas**
   - Build de producción: `npm run build`
   - Análisis de dependencias
   - Verificación de types
   - Linting completo

4. **Reporte de Resultados**
   - Consolidar todos los resultados
   - Identificar bloqueadores críticos
   - Generar reporte detallado
   - Recomendar acciones correctivas

## Suites de Tests Específicos

### Tests de Componentes React
```typescript
// Ejemplo de test para componente de calendario
describe('CalendarView', () => {
  it('should render events with correct section colors', () => {
    render(<CalendarView events={mockEvents} />)
    expect(screen.getByTestId('castores-event')).toHaveClass('bg-orange-500')
  })
  
  it('should handle month navigation', () => {
    // Test de navegación mensual
  })
})
```

### Tests de API
```typescript
// Test de endpoint de actividades
describe('GET /api/actividades/seccion/:id', () => {
  it('should return activities for specific section', async () => {
    const response = await request(app)
      .get('/api/actividades/seccion/castores')
      .expect(200)
    
    expect(response.body).toHaveProperty('activities')
    expect(response.body.activities[0]).toHaveProperty('section', 'castores')
  })
})
```

## Validaciones Críticas para Osyris

### Base de Datos
- Conexión PostgreSQL estable
- Migraciones aplicadas correctamente
- Queries optimizados
- Sin leaks de conexión

### Autenticación
- Tokens JWT válidos
- Roles y permisos correctos
- Manejo de sesiones
- Seguridad de contraseñas

### Performance
- Tiempo de respuesta < 2s
- Bundle size optimizado
- Imágenes optimizadas
- Sin memory leaks

## Integración con MCPs

Utiliza:
- **filesystem-mcp**: Lectura de archivos de test
- **memory-mcp**: Registro de resultados
- **sequential-thinking**: Análisis complejo de fallos

## Estado en Memoria

Actualiza session-state.json con:
```json
{
  "context": {
    "tests_run": {
      "unit": { "passed": 45, "failed": 0, "skipped": 2 },
      "integration": { "passed": 23, "failed": 1, "skipped": 0 },
      "e2e": { "passed": 15, "failed": 0, "skipped": 1 }
    },
    "coverage": 87.5,
    "build_status": "success",
    "compatibility_issues": [],
    "production_ready": true
  }
}
```

## Criterios de Éxito

✅ **Tests pasan**: Todos los tests críticos pasan
✅ **Build exitoso**: Sin errores de compilación
✅ **Cobertura adecuada**: > 80% de cobertura
✅ **Sin breaking changes**: Compatible con develop
✅ **Performance aceptable**: Métricas dentro de límites
✅ **Seguridad OK**: Sin vulnerabilidades críticas

## Manejo de Fallos

- **Tests rotos**: Identifica causa raíz y sugiere fixes
- **Build fail**: Analiza errores y proporciona soluciones
- **Compatibilidad rota**: Detecta conflictos y guía resolución
- **Performance issues**: Identifica cuellos de botella

---

*Guardián de la calidad y estabilidad antes de producción.*