# Comando: /new-feature

## Descripción
Crea una nueva rama de feature siguiendo las convenciones de la industria, gestiona el stash automático, y configura el entorno para desarrollo de nuevas funcionalidades.

## Palabras clave de activación
- `/new-feature`
- `nueva funcionalidad`
- `crear feature`
- `nueva rama`
- `start feature`

## Funcionamiento

### 1. Análisis del estado actual
- Verificar branch actual
- Detectar cambios sin commitear
- Validar que estamos en una rama segura (no main/master)
- Comprobar estado del repositorio

### 2. Gestión de cambios pendientes
- Hacer stash automático de cambios no commiteados
- Ofrecer commit rápido si es apropiado
- Limpiar workspace para nueva feature

### 3. Sincronización con remoto
- Fetch últimos cambios del remoto
- Actualizar rama principal (main/develop)
- Verificar conflictos potenciales

### 4. Creación de rama
- Seguir nomenclatura estándar: `feature/OSYR-{ID}-{descripcion-corta}`
- Crear desde la rama principal actualizada
- Configurar tracking con remoto

### 5. Configuración inicial
- Crear estructura de archivos si es necesario
- Configurar tests para la nueva feature
- Generar documentación base

## Tipos de features soportadas

### Frontend Features
- `feature/OSYR-{ID}-ui-{componente}` - Nuevos componentes UI
- `feature/OSYR-{ID}-page-{pagina}` - Nuevas páginas
- `feature/OSYR-{ID}-form-{formulario}` - Nuevos formularios
- `feature/OSYR-{ID}-dashboard-{seccion}` - Secciones del dashboard

### Backend Features
- `feature/OSYR-{ID}-api-{endpoint}` - Nuevos endpoints
- `feature/OSYR-{ID}-auth-{funcionalidad}` - Funcionalidades de autenticación
- `feature/OSYR-{ID}-db-{modelo}` - Nuevos modelos de datos
- `feature/OSYR-{ID}-integration-{servicio}` - Integraciones externas

### Full-Stack Features
- `feature/OSYR-{ID}-scout-{funcionalidad}` - Gestión de scouts
- `feature/OSYR-{ID}-activity-{funcionalidad}` - Gestión de actividades
- `feature/OSYR-{ID}-badge-{funcionalidad}` - Sistema de insignias
- `feature/OSYR-{ID}-report-{tipo}` - Reportes y analytics

## Implementación

```bash
#!/bin/bash

echo "🌿 Creando nueva feature para Osyris..."

# Función para limpiar input del usuario
clean_input() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g'
}

# Solicitar información de la feature
echo "📝 Información de la nueva feature:"
read -p "Tipo de feature (scout/activity/badge/ui/api/auth): " feature_type
read -p "ID del ticket (ej: 123): " ticket_id
read -p "Descripción corta (ej: registration-form): " description

# Limpiar inputs
feature_type=$(clean_input "$feature_type")
description=$(clean_input "$description")

# Validar inputs
if [ -z "$feature_type" ] || [ -z "$ticket_id" ] || [ -z "$description" ]; then
    echo "❌ Todos los campos son obligatorios"
    exit 1
fi

# Crear nombre de rama
branch_name="feature/OSYR-${ticket_id}-${feature_type}-${description}"

echo "🎯 Rama a crear: $branch_name"

# Verificar estado actual
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Rama actual: $current_branch"

# Verificar cambios pendientes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️ Hay cambios sin commitear"
    read -p "¿Hacer stash de los cambios? (y/n): " stash_choice

    if [ "$stash_choice" = "y" ]; then
        git stash push -m "Auto-stash antes de crear feature $branch_name"
        echo "📦 Cambios guardados en stash"
    else
        echo "❌ No se puede continuar con cambios pendientes"
        exit 1
    fi
fi

# Cambiar a rama principal para crear feature
echo "🔄 Cambiando a rama principal..."
git checkout main 2>/dev/null || git checkout master 2>/dev/null || git checkout develop

# Actualizar rama principal
echo "📡 Actualizando desde remoto..."
git fetch origin
git pull origin $(git rev-parse --abbrev-ref HEAD)

# Crear nueva rama
echo "✨ Creando rama $branch_name..."
git checkout -b "$branch_name"

# Configurar tracking con remoto
git push -u origin "$branch_name"

echo "✅ Rama creada y configurada con éxito!"

# Configurar estructura inicial según tipo de feature
case "$feature_type" in
    "scout"|"activity"|"badge")
        echo "📁 Configurando estructura full-stack..."

        # Frontend structure
        mkdir -p "app/(dashboard)/${feature_type}s"
        mkdir -p "components/${feature_type}s"
        mkdir -p "__tests__/components/${feature_type}s"

        # Backend structure
        mkdir -p "api-osyris/src/controllers/${feature_type}Controller"
        mkdir -p "api-osyris/src/models/${feature_type}"
        mkdir -p "api-osyris/src/routes/${feature_type}"
        mkdir -p "api-osyris/__tests__/api/${feature_type}s"

        echo "🎨 Creando archivo base de componente..."
        cat > "components/${feature_type}s/${feature_type^}Card.tsx" <<EOF
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ${feature_type^}CardProps {
  // Props del ${feature_type}
}

export function ${feature_type^}Card({ }: ${feature_type^}CardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>${feature_type^} Card</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Contenido del ${feature_type} */}
      </CardContent>
    </Card>
  );
}
EOF
        ;;

    "ui")
        echo "🎨 Configurando estructura frontend..."
        mkdir -p "components/ui"
        mkdir -p "__tests__/components/ui"
        ;;

    "api")
        echo "🔧 Configurando estructura backend..."
        mkdir -p "api-osyris/src/controllers"
        mkdir -p "api-osyris/src/routes"
        mkdir -p "api-osyris/__tests__/api"
        ;;
esac

# Crear archivo TODO para la feature
echo "📋 Creando checklist de desarrollo..."
cat > "FEATURE_CHECKLIST.md" <<EOF
# Feature: $branch_name

## 📋 Checklist de Desarrollo

### Análisis y Diseño
- [ ] Definir requisitos funcionales
- [ ] Crear mockups/wireframes si aplica
- [ ] Definir modelos de datos
- [ ] Planificar tests

### Desarrollo Backend (si aplica)
- [ ] Crear modelo de datos
- [ ] Implementar endpoints de API
- [ ] Añadir validaciones
- [ ] Documentar API con Swagger

### Desarrollo Frontend (si aplica)
- [ ] Crear componentes UI
- [ ] Implementar formularios
- [ ] Conectar con API
- [ ] Añadir navegación

### Testing
- [ ] Tests unitarios (Frontend)
- [ ] Tests unitarios (Backend)
- [ ] Tests de integración
- [ ] Tests E2E

### Documentación
- [ ] Actualizar README
- [ ] Documentar nuevos endpoints
- [ ] Añadir ejemplos de uso

### Review y Deploy
- [ ] Code review
- [ ] Tests de performance
- [ ] Verificar accesibilidad
- [ ] Mergear a develop

## 🎯 Objetivo
Describir el objetivo de esta feature...

## 📝 Notas de Desarrollo
- Añadir notas importantes aquí...
EOF

echo ""
echo "🎉 ¡Feature configurada con éxito!"
echo "🌿 Rama: $branch_name"
echo "📁 Estructura creada para tipo: $feature_type"
echo "📋 Checklist disponible en: FEATURE_CHECKLIST.md"
echo ""
echo "🚀 Siguiente paso: ¡Empezar a desarrollar!"
echo "💡 Usa /dev-start para levantar el entorno de desarrollo"
```

## Integración con agentes

### Decision Orchestrator
- Analiza el tipo de feature y asigna agentes apropiados
- Coordina el plan de desarrollo
- Establece prioridades y dependencias

### Frontend Developer Agent
- Se activa automáticamente para features de UI
- Propone estructura de componentes
- Sugiere patrones de diseño apropiados

### Backend Developer Agent
- Se activa para features de API
- Propone estructura de endpoints
- Sugiere optimizaciones de base de datos

### Test Engineer Agent
- Crea plan de testing específico
- Prepara estructura de tests
- Define criterios de aceptación

## Configuración avanzada

### Template personalizado
```yaml
# .claude/feature-templates/scout-management.yml
name: "Scout Management Feature"
structure:
  frontend:
    - "app/(dashboard)/scouts/[feature]"
    - "components/scouts/[Feature]Component.tsx"
    - "__tests__/scouts/[feature].test.tsx"
  backend:
    - "api-osyris/src/controllers/scout[Feature]Controller.js"
    - "api-osyris/src/models/Scout[Feature].js"
    - "api-osyris/__tests__/scout-[feature].test.js"
tests:
  - "User can create scout"
  - "User can view scout details"
  - "User can update scout information"
```

### Hooks de post-creación
- Crear branch en GitHub automáticamente
- Asignar labels apropiados
- Notificar al equipo via Slack/Discord
- Generar task en sistema de project management

## Troubleshooting

### Error: Rama ya existe
- Verificar si la rama existe localmente o remotamente
- Ofrecer opciones: sobrescribir, usar diferente nombre, continuar

### Error: Cambios no guardados
- Ofrecer stash automático
- Mostrar diferencias para revisión
- Permitir commit rápido

### Error: Sin conexión a remoto
- Crear rama localmente
- Configurar tracking cuando vuelva la conexión
- Guardar configuración para retry automático