# Comando: /smart-commit

## Descripción
Realiza commits inteligentes analizando automáticamente los cambios y generando mensajes siguiendo Conventional Commits, asegurando calidad y consistencia en el historial del proyecto.

## Palabras clave de activación
- `/smart-commit`
- `commit inteligente`
- `conventional commit`
- `commit automático`
- `guardar cambios`

## Funcionamiento

### 1. Análisis de cambios
- Detectar archivos modificados, añadidos y eliminados
- Clasificar cambios por tipo (frontend, backend, config, docs)
- Identificar patrones para sugerir tipo de commit apropiado
- Analizar impacto y scope de los cambios

### 2. Generación de mensaje
- Aplicar Conventional Commits format: `type(scope): description`
- Sugerir tipo basado en los archivos modificados
- Proponer scope específico del módulo afectado
- Generar descripción clara y concisa

### 3. Validación pre-commit
- Ejecutar linters (ESLint, Prettier)
- Correr tests relevantes para archivos modificados
- Verificar que no hay secrets o datos sensibles
- Comprobar que no se rompe la build

### 4. Commit con metadata
- Incluir co-author de Claude Code
- Añadir enlaces a issues/PRs si es relevante
- Generar tags automáticos según semantic versioning

## Tipos de commit soportados

### Frontend Changes
- `feat(ui):` - Nuevos componentes o páginas
- `feat(form):` - Nuevos formularios o inputs
- `style(ui):` - Cambios visuales sin nueva funcionalidad
- `fix(ui):` - Correcciones de bugs en interfaz
- `refactor(component):` - Reestructuración de componentes

### Backend Changes
- `feat(api):` - Nuevos endpoints o funcionalidades
- `feat(auth):` - Cambios en autenticación/autorización
- `fix(api):` - Correcciones de bugs en API
- `perf(db):` - Optimizaciones de base de datos
- `feat(integration):` - Nuevas integraciones externas

### Scout-Specific Features
- `feat(scout):` - Funcionalidades de gestión de scouts
- `feat(activity):` - Sistema de actividades
- `feat(badge):` - Sistema de insignias
- `feat(group):` - Gestión de grupos scout
- `feat(report):` - Reportes y estadísticas

### Infrastructure
- `build:` - Cambios en build system o dependencias
- `ci:` - Cambios en CI/CD
- `docs:` - Documentación
- `test:` - Añadir o modificar tests
- `chore:` - Tareas de mantenimiento

## Implementación

```bash
#!/bin/bash

echo "🧠 Smart Commit para Osyris - Análisis de cambios..."

# Verificar que estamos en un repositorio git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ No estamos en un repositorio git"
    exit 1
fi

# Verificar que hay cambios para commitear
if git diff --cached --quiet && git diff --quiet; then
    echo "📝 No hay cambios para commitear"
    echo "💡 Tip: Usa 'git add .' para añadir todos los cambios"
    exit 0
fi

# Función para analizar cambios
analyze_changes() {
    echo "🔍 Analizando cambios..."

    # Obtener archivos modificados
    local staged_files=$(git diff --cached --name-only)
    local unstaged_files=$(git diff --name-only)
    local all_files="$staged_files $unstaged_files"

    # Contadores por tipo
    local frontend_changes=0
    local backend_changes=0
    local test_changes=0
    local doc_changes=0
    local config_changes=0

    # Scopes específicos detectados
    local scopes=()
    local change_types=()

    # Analizar cada archivo
    while IFS= read -r file; do
        if [[ -z "$file" ]]; then continue; fi

        case "$file" in
            # Frontend changes
            "app/"*|"components/"*|"lib/"*|"styles/"*)
                ((frontend_changes++))
                if [[ "$file" == *"scout"* ]]; then
                    scopes+=("scout")
                elif [[ "$file" == *"activity"* ]]; then
                    scopes+=("activity")
                elif [[ "$file" == *"badge"* ]]; then
                    scopes+=("badge")
                elif [[ "$file" == *"auth"* ]]; then
                    scopes+=("auth")
                else
                    scopes+=("ui")
                fi
                ;;

            # Backend changes
            "api-osyris/"*)
                ((backend_changes++))
                if [[ "$file" == *"controller"* ]]; then
                    scopes+=("api")
                elif [[ "$file" == *"model"* ]]; then
                    scopes+=("db")
                elif [[ "$file" == *"auth"* ]]; then
                    scopes+=("auth")
                elif [[ "$file" == *"route"* ]]; then
                    scopes+=("api")
                else
                    scopes+=("backend")
                fi
                ;;

            # Tests
            "*test*"|"*spec*"|"__tests__/"*|"e2e/"*)
                ((test_changes++))
                scopes+=("test")
                ;;

            # Documentation
            "*.md"|"docs/"*)
                ((doc_changes++))
                scopes+=("docs")
                ;;

            # Configuration
            "package.json"|"*.config.*"|"*.json"|".env"*|"docker"*)
                ((config_changes++))
                scopes+=("config")
                ;;
        esac
    done <<< "$all_files"

    # Determinar tipo de commit principal
    local commit_type="chore"
    local primary_scope=""

    if [[ $frontend_changes -gt 0 && $backend_changes -gt 0 ]]; then
        commit_type="feat"
        primary_scope="fullstack"
    elif [[ $frontend_changes -gt $backend_changes ]]; then
        commit_type="feat"
        primary_scope=$(printf '%s\n' "${scopes[@]}" | grep -E "(scout|activity|badge|ui)" | head -1)
        [[ -z "$primary_scope" ]] && primary_scope="ui"
    elif [[ $backend_changes -gt 0 ]]; then
        commit_type="feat"
        primary_scope=$(printf '%s\n' "${scopes[@]}" | grep -E "(api|db|auth)" | head -1)
        [[ -z "$primary_scope" ]] && primary_scope="api"
    elif [[ $test_changes -gt 0 ]]; then
        commit_type="test"
        primary_scope="test"
    elif [[ $doc_changes -gt 0 ]]; then
        commit_type="docs"
        primary_scope="docs"
    elif [[ $config_changes -gt 0 ]]; then
        commit_type="build"
        primary_scope="config"
    fi

    echo "$commit_type:$primary_scope"
}

# Ejecutar análisis
analysis_result=$(analyze_changes)
suggested_type=$(echo $analysis_result | cut -d: -f1)
suggested_scope=$(echo $analysis_result | cut -d: -f2)

echo "📊 Resumen de cambios:"
git status --short

echo ""
echo "🤖 Análisis automático:"
echo "   Tipo sugerido: $suggested_type"
echo "   Scope sugerido: $suggested_scope"

# Permitir al usuario personalizar
echo ""
echo "📝 Personalizar commit:"
read -p "Tipo de commit [$suggested_type]: " user_type
read -p "Scope [$suggested_scope]: " user_scope
read -p "Descripción del cambio: " description

# Usar valores por defecto si no se especifica
commit_type=${user_type:-$suggested_type}
commit_scope=${user_scope:-$suggested_scope}

# Validar que hay descripción
if [[ -z "$description" ]]; then
    echo "❌ La descripción es obligatoria"
    exit 1
fi

# Construir mensaje de commit
if [[ -n "$commit_scope" ]]; then
    commit_message="$commit_type($commit_scope): $description"
else
    commit_message="$commit_type: $description"
fi

echo ""
echo "📋 Mensaje de commit generado:"
echo "   $commit_message"
echo ""

# Añadir archivos no staged si el usuario quiere
if ! git diff --quiet; then
    read -p "¿Añadir archivos no staged al commit? (y/n): " add_unstaged
    if [[ "$add_unstaged" == "y" ]]; then
        git add .
        echo "✅ Archivos añadidos al staging area"
    fi
fi

# Ejecutar validaciones pre-commit
echo "🔍 Ejecutando validaciones..."

# Lint check (si existe)
if [[ -f "package.json" ]] && npm list eslint &>/dev/null; then
    echo "   Ejecutando ESLint..."
    if ! npm run lint --silent 2>/dev/null; then
        echo "⚠️ Hay warnings de ESLint, pero continuamos..."
    fi
fi

# Type check (si es TypeScript)
if [[ -f "tsconfig.json" ]]; then
    echo "   Verificando tipos TypeScript..."
    if ! npx tsc --noEmit 2>/dev/null; then
        echo "❌ Errores de TypeScript detectados"
        read -p "¿Continuar de todas formas? (y/n): " continue_anyway
        if [[ "$continue_anyway" != "y" ]]; then
            exit 1
        fi
    fi
fi

# Verificar que no hay secrets
echo "   Verificando secrets..."
if git diff --cached | grep -iE "(password|secret|key|token)" | grep -v "// Placeholder" | grep -q .; then
    echo "⚠️ Posibles secrets detectados en los cambios"
    git diff --cached | grep -iE "(password|secret|key|token)" | head -3
    read -p "¿Continuar de todas formas? (y/n): " continue_secrets
    if [[ "$continue_secrets" != "y" ]]; then
        exit 1
    fi
fi

# Confirmación final
echo ""
read -p "¿Proceder con el commit? (y/n): " confirm_commit

if [[ "$confirm_commit" == "y" ]]; then
    # Realizar commit con metadata
    git commit -m "$commit_message

🤖 Generated with Claude Code for Osyris Scout Management

Co-authored-by: Claude <noreply@anthropic.com>"

    echo "✅ Commit realizado con éxito!"
    echo "📝 Hash: $(git rev-parse --short HEAD)"

    # Sugerir próximos pasos
    echo ""
    echo "🚀 Próximos pasos sugeridos:"

    # Verificar si estamos en feature branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$current_branch" == feature/* ]]; then
        echo "   • Continuar desarrollando la feature"
        echo "   • Ejecutar tests: npm test"
        echo "   • Push a remoto: git push"
        echo "   • Crear PR cuando esté lista"
    else
        echo "   • Verificar que todo funciona: /dev-start"
        echo "   • Ejecutar tests completos: npm test"
        echo "   • Push a remoto: git push"
    fi

    # Mostrar estado actual
    echo ""
    echo "📊 Estado del repositorio:"
    git log --oneline -3
else
    echo "❌ Commit cancelado"
fi
```

## Integración con agentes

### Decision Orchestrator
- Analiza el impacto de los cambios
- Sugiere si se necesitan reviews adicionales
- Coordina con otros agentes para validaciones

### Frontend Developer Agent
- Revisa cambios en componentes UI
- Sugiere mejoras de código
- Valida patrones de diseño

### Backend Developer Agent
- Analiza cambios en API
- Verifica seguridad de endpoints
- Sugiere optimizaciones

### Test Engineer Agent
- Ejecuta tests relevantes
- Sugiere tests adicionales necesarios
- Valida cobertura de código

## Configuración avanzada

### Conventional Commits personalizado
```json
{
  "types": {
    "feat": "Nueva funcionalidad",
    "fix": "Corrección de bug",
    "docs": "Documentación",
    "style": "Cambios de formato",
    "refactor": "Refactorización",
    "perf": "Mejora de performance",
    "test": "Tests",
    "build": "Build system",
    "ci": "CI/CD",
    "chore": "Mantenimiento",
    "revert": "Revertir cambios"
  },
  "scopes": {
    "osyris": ["scout", "activity", "badge", "group", "report"],
    "technical": ["ui", "api", "db", "auth", "integration"],
    "infrastructure": ["config", "build", "deploy", "docs"]
  }
}
```

### Templates de commit
```yaml
# .claude/commit-templates/
scout-feature:
  type: "feat"
  scope: "scout"
  template: "feat(scout): add [description] functionality for scout management"

api-endpoint:
  type: "feat"
  scope: "api"
  template: "feat(api): implement [endpoint] endpoint with [description]"

ui-component:
  type: "feat"
  scope: "ui"
  template: "feat(ui): create [component] component for [purpose]"
```

## Validaciones automáticas

### Pre-commit hooks
- Formateo automático con Prettier
- Lint automático con ESLint
- Type checking con TypeScript
- Tests unitarios para archivos modificados

### Semantic versioning
- Automáticamente detecta si es patch/minor/major
- Sugiere actualización de version en package.json
- Genera changelog automático

### Quality gates
- Cobertura de tests mínima
- Complexity score máximo
- Performance budget compliance
- Accessibility standards check

## Troubleshooting

### Error: Lint failures
- Auto-fix con --fix flag
- Mostrar errores específicos
- Ofrecer bypass para emergencias

### Error: Type errors
- Mostrar errores claros de TypeScript
- Sugerir fixes automáticos
- Permitir bypass con justificación

### Error: Test failures
- Ejecutar solo tests relacionados
- Mostrar logs detallados
- Ofrecer skip con warning