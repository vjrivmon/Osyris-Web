# Comando: /run-tests

## Descripción
Ejecuta la suite completa de tests automatizados para Osyris, incluyendo tests unitarios, de integración y E2E, con reportes detallados y análisis de cobertura.

## Palabras clave de activación
- `/run-tests`
- `ejecutar tests`
- `correr pruebas`
- `test suite`
- `verificar calidad`

## Funcionamiento

### 1. Tests unitarios
- Frontend: Jest + React Testing Library
- Backend: Jest + Supertest
- Componentes individuales y funciones puras
- Mocks y stubs para dependencias

### 2. Tests de integración
- API endpoints con base de datos real
- Integración frontend-backend
- Flujos de autenticación completos
- Integraciones con servicios externos

### 3. Tests E2E
- Playwright para simulación de usuario real
- Flujos completos de scout management
- Verificación cross-browser
- Tests de responsive design

### 4. Análisis de calidad
- Cobertura de código
- Performance testing
- Security scanning
- Accessibility testing

## Implementación

```bash
#!/bin/bash

echo "🧪 Test Suite - Osyris Scout Management System"
echo "=============================================="

# Configuración
TEST_MODE=${1:-"all"}
VERBOSE=${2:-false}
COVERAGE_THRESHOLD=80

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones auxiliares
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar prerrequisitos
check_prerequisites() {
    log_info "Verificando prerrequisitos..."

    # Node.js y npm
    if ! command -v node &> /dev/null; then
        log_error "Node.js no está instalado"
        exit 1
    fi

    # Dependencias instaladas
    if [[ ! -d "node_modules" ]]; then
        log_info "Instalando dependencias del frontend..."
        npm install
    fi

    if [[ ! -d "api-osyris/node_modules" ]]; then
        log_info "Instalando dependencias del backend..."
        cd api-osyris && npm install && cd ..
    fi

    # Playwright
    if [[ ! -f "node_modules/.bin/playwright" ]]; then
        log_info "Instalando Playwright..."
        npx playwright install
    fi

    log_success "Prerrequisitos verificados"
}

# Setup del entorno de testing
setup_test_environment() {
    log_info "Configurando entorno de testing..."

    # Variables de entorno para testing
    export NODE_ENV=test
    export DB_NAME=osyris_test
    export JWT_SECRET=test_secret_key
    export PORT=3333

    # Crear directorio de reportes
    mkdir -p test-reports/coverage
    mkdir -p test-reports/junit
    mkdir -p test-reports/screenshots

    # Limpiar reportes anteriores
    rm -rf test-reports/coverage/*
    rm -rf test-reports/junit/*
    rm -rf test-reports/screenshots/*

    log_success "Entorno de testing configurado"
}

# Tests unitarios Frontend
run_frontend_unit_tests() {
    log_info "Ejecutando tests unitarios del frontend..."

    cd Osyris-Web

    # Configurar Jest para CI
    npm test -- \
        --coverage \
        --watchAll=false \
        --reporters=default \
        --reporters=jest-junit \
        --coverageReporters=text \
        --coverageReporters=lcov \
        --coverageReporters=html \
        --testResultsProcessor=jest-junit

    local exit_code=$?

    # Mover reportes
    if [[ -f "coverage/lcov.info" ]]; then
        cp -r coverage/* ../test-reports/coverage/frontend/
    fi

    if [[ -f "junit.xml" ]]; then
        cp junit.xml ../test-reports/junit/frontend-unit.xml
    fi

    cd ..

    if [[ $exit_code -eq 0 ]]; then
        log_success "Tests unitarios frontend: PASSED"
    else
        log_error "Tests unitarios frontend: FAILED"
    fi

    return $exit_code
}

# Tests unitarios Backend
run_backend_unit_tests() {
    log_info "Ejecutando tests unitarios del backend..."

    cd api-osyris

    # Setup base de datos de test
    npm run test:setup 2>/dev/null || true

    # Ejecutar tests
    npm test -- \
        --coverage \
        --reporters=default \
        --reporters=jest-junit \
        --coverageReporters=text \
        --coverageReporters=lcov \
        --coverageReporters=html

    local exit_code=$?

    # Mover reportes
    if [[ -f "coverage/lcov.info" ]]; then
        cp -r coverage/* ../test-reports/coverage/backend/
    fi

    if [[ -f "junit.xml" ]]; then
        cp junit.xml ../test-reports/junit/backend-unit.xml
    fi

    cd ..

    if [[ $exit_code -eq 0 ]]; then
        log_success "Tests unitarios backend: PASSED"
    else
        log_error "Tests unitarios backend: FAILED"
    fi

    return $exit_code
}

# Tests de integración
run_integration_tests() {
    log_info "Ejecutando tests de integración..."

    # Iniciar servicios de testing
    log_info "Iniciando servicios para tests de integración..."

    # Backend en modo test
    cd api-osyris
    NODE_ENV=test npm start &
    BACKEND_PID=$!
    cd ..

    # Esperar a que el backend esté listo
    for i in {1..30}; do
        if curl -s http://localhost:3333/api/health > /dev/null; then
            break
        fi
        sleep 1
    done

    # Frontend en modo test
    cd Osyris-Web
    NODE_ENV=test npm run build
    npm start &
    FRONTEND_PID=$!
    cd ..

    # Esperar a que el frontend esté listo
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null; then
            break
        fi
        sleep 1
    done

    # Ejecutar tests de integración
    npm run test:integration

    local exit_code=$?

    # Limpiar procesos
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true

    if [[ $exit_code -eq 0 ]]; then
        log_success "Tests de integración: PASSED"
    else
        log_error "Tests de integración: FAILED"
    fi

    return $exit_code
}

# Tests E2E con Playwright
run_e2e_tests() {
    log_info "Ejecutando tests E2E..."

    # Verificar que los servicios están corriendo
    if ! curl -s http://localhost:3001 > /dev/null; then
        log_warning "Frontend no está corriendo, iniciando..."
        cd Osyris-Web
        npm run dev -- --port 3001 &
        FRONTEND_PID=$!
        cd ..

        # Esperar a que esté listo
        for i in {1..60}; do
            if curl -s http://localhost:3001 > /dev/null; then
                break
            fi
            sleep 1
        done
    fi

    if ! curl -s http://localhost:3000 > /dev/null; then
        log_warning "Backend no está corriendo, iniciando..."
        cd api-osyris
        npm run dev &
        BACKEND_PID=$!
        cd ..

        # Esperar a que esté listo
        for i in {1..60}; do
            if curl -s http://localhost:3000/api/health > /dev/null; then
                break
            fi
            sleep 1
        done
    fi

    # Ejecutar tests E2E
    npx playwright test \
        --reporter=html \
        --reporter=junit \
        --output-dir=test-reports/screenshots

    local exit_code=$?

    # Mover reportes
    if [[ -f "test-results/results.xml" ]]; then
        cp test-results/results.xml test-reports/junit/e2e.xml
    fi

    if [[ $exit_code -eq 0 ]]; then
        log_success "Tests E2E: PASSED"
    else
        log_error "Tests E2E: FAILED"
        log_info "Screenshots disponibles en: test-reports/screenshots/"
    fi

    return $exit_code
}

# Tests de performance
run_performance_tests() {
    log_info "Ejecutando tests de performance..."

    # Usar Lighthouse para auditoría de performance
    npx lighthouse http://localhost:3001 \
        --output=json \
        --output=html \
        --output-path=test-reports/lighthouse \
        --chrome-flags="--headless" \
        --quiet

    # Extraer métricas clave
    local fcp=$(node -e "console.log(require('./test-reports/lighthouse.report.json').audits['first-contentful-paint'].numericValue)")
    local lcp=$(node -e "console.log(require('./test-reports/lighthouse.report.json').audits['largest-contentful-paint'].numericValue)")

    echo "📊 Métricas de Performance:"
    echo "   First Contentful Paint: ${fcp}ms"
    echo "   Largest Contentful Paint: ${lcp}ms"

    # Verificar umbrales
    local performance_passed=true
    if (( $(echo "$fcp > 1500" | bc -l) )); then
        log_warning "FCP excede el umbral de 1500ms"
        performance_passed=false
    fi

    if (( $(echo "$lcp > 2500" | bc -l) )); then
        log_warning "LCP excede el umbral de 2500ms"
        performance_passed=false
    fi

    if [[ "$performance_passed" == true ]]; then
        log_success "Tests de performance: PASSED"
        return 0
    else
        log_error "Tests de performance: FAILED"
        return 1
    fi
}

# Análisis de cobertura
analyze_coverage() {
    log_info "Analizando cobertura de código..."

    # Combinar reportes de cobertura
    if command -v nyc &> /dev/null; then
        nyc merge test-reports/coverage/ .nyc_output/coverage.json
        nyc report --reporter=text --reporter=html --report-dir=test-reports/coverage/combined
    fi

    # Verificar umbral de cobertura
    local frontend_coverage=0
    local backend_coverage=0

    if [[ -f "test-reports/coverage/frontend/lcov.info" ]]; then
        frontend_coverage=$(lcov --summary test-reports/coverage/frontend/lcov.info 2>/dev/null | grep "lines" | grep -o "[0-9]*\.[0-9]*%" | head -1 | sed 's/%//')
    fi

    if [[ -f "test-reports/coverage/backend/lcov.info" ]]; then
        backend_coverage=$(lcov --summary test-reports/coverage/backend/lcov.info 2>/dev/null | grep "lines" | grep -o "[0-9]*\.[0-9]*%" | head -1 | sed 's/%//')
    fi

    echo "📊 Cobertura de Código:"
    echo "   Frontend: ${frontend_coverage}%"
    echo "   Backend: ${backend_coverage}%"

    # Verificar umbrales
    local coverage_passed=true
    if (( $(echo "$frontend_coverage < $COVERAGE_THRESHOLD" | bc -l) )); then
        log_warning "Cobertura frontend por debajo del umbral ($COVERAGE_THRESHOLD%)"
        coverage_passed=false
    fi

    if (( $(echo "$backend_coverage < $COVERAGE_THRESHOLD" | bc -l) )); then
        log_warning "Cobertura backend por debajo del umbral ($COVERAGE_THRESHOLD%)"
        coverage_passed=false
    fi

    if [[ "$coverage_passed" == true ]]; then
        log_success "Cobertura de código: PASSED"
        return 0
    else
        log_error "Cobertura de código: FAILED"
        return 1
    fi
}

# Generar reporte final
generate_final_report() {
    local total_passed=$1
    local total_failed=$2

    log_info "Generando reporte final..."

    cat > test-reports/test-summary.md <<EOF
# Test Report - Osyris Scout Management System
**Fecha**: $(date +"%Y-%m-%d %H:%M:%S")
**Commit**: $(git rev-parse --short HEAD 2>/dev/null || "N/A")
**Branch**: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || "N/A")

## 📊 Resumen Ejecutivo
- **Tests Pasados**: $total_passed
- **Tests Fallidos**: $total_failed
- **Estado General**: $(if [[ $total_failed -eq 0 ]]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

## 📝 Detalles por Categoría

### Tests Unitarios
- Frontend: $(if [[ -f "test-reports/junit/frontend-unit.xml" ]]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)
- Backend: $(if [[ -f "test-reports/junit/backend-unit.xml" ]]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

### Tests de Integración
- API Integration: $(if [[ -f "test-reports/junit/integration.xml" ]]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

### Tests E2E
- User Flows: $(if [[ -f "test-reports/junit/e2e.xml" ]]; then echo "✅ PASSED"; else echo "❌ FAILED"; fi)

### Performance
- Lighthouse Audit: $(if [[ -f "test-reports/lighthouse.report.html" ]]; then echo "✅ COMPLETED"; else echo "❌ FAILED"; fi)

## 📁 Archivos Generados
- Cobertura Frontend: \`test-reports/coverage/frontend/\`
- Cobertura Backend: \`test-reports/coverage/backend/\`
- Screenshots E2E: \`test-reports/screenshots/\`
- Reporte Lighthouse: \`test-reports/lighthouse.report.html\`

## 🎯 Recomendaciones
$(if [[ $total_failed -gt 0 ]]; then
    echo "- Revisar tests fallidos antes de merge"
    echo "- Verificar logs de error en CI/CD"
    echo "- Considerar fix immediato para tests críticos"
else
    echo "- ✅ Todos los tests pasaron - Safe to merge!"
    echo "- Considerar deploy a staging environment"
    echo "- Monitorear métricas en producción"
fi)

---
**Generado automáticamente por Osyris Test Suite**
EOF

    echo "✅ Reporte generado en: test-reports/test-summary.md"
}

# Función principal
main() {
    local failed_suites=0
    local passed_suites=0

    echo "🚀 Iniciando Test Suite completa para Osyris..."

    # Setup
    check_prerequisites
    setup_test_environment

    case "$TEST_MODE" in
        "unit")
            log_info "Modo: Solo tests unitarios"
            run_frontend_unit_tests && ((passed_suites++)) || ((failed_suites++))
            run_backend_unit_tests && ((passed_suites++)) || ((failed_suites++))
            ;;
        "integration")
            log_info "Modo: Solo tests de integración"
            run_integration_tests && ((passed_suites++)) || ((failed_suites++))
            ;;
        "e2e")
            log_info "Modo: Solo tests E2E"
            run_e2e_tests && ((passed_suites++)) || ((failed_suites++))
            ;;
        "performance")
            log_info "Modo: Solo tests de performance"
            run_performance_tests && ((passed_suites++)) || ((failed_suites++))
            ;;
        "all"|*)
            log_info "Modo: Suite completa"
            run_frontend_unit_tests && ((passed_suites++)) || ((failed_suites++))
            run_backend_unit_tests && ((passed_suites++)) || ((failed_suites++))
            run_integration_tests && ((passed_suites++)) || ((failed_suites++))
            run_e2e_tests && ((passed_suites++)) || ((failed_suites++))
            run_performance_tests && ((passed_suites++)) || ((failed_suites++))
            analyze_coverage && ((passed_suites++)) || ((failed_suites++))
            ;;
    esac

    # Reporte final
    generate_final_report $passed_suites $failed_suites

    echo ""
    echo "🏁 Test Suite completada!"
    echo "📊 Resultado: $passed_suites passed, $failed_suites failed"

    if [[ $failed_suites -eq 0 ]]; then
        log_success "🎉 Todos los tests pasaron! Safe to deploy!"
        exit 0
    else
        log_error "💥 Algunos tests fallaron. Revisar antes de continuar."
        exit 1
    fi
}

# Verificar argumentos de línea de comandos
case "$1" in
    "unit"|"integration"|"e2e"|"performance"|"all")
        main
        ;;
    "--help"|"-h")
        echo "Uso: /run-tests [tipo] [verbose]"
        echo "Tipos: unit, integration, e2e, performance, all (default)"
        echo "Ejemplo: /run-tests unit true"
        ;;
    *)
        main
        ;;
esac
```

## Configuración de Jest

### Frontend (Osyris-Web/jest.config.js)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
```

### Backend (api-osyris/jest.config.js)
```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.{test,spec}.js',
  ],
};
```

## Integración con CI/CD

### GitHub Actions
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Run Test Suite
        run: ./.claude/commands/run-tests.md all
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./test-reports/coverage/lcov.info
```

## Comandos rápidos

```bash
# Tests unitarios solamente
/run-tests unit

# Tests E2E solamente
/run-tests e2e

# Suite completa con logs verbose
/run-tests all true

# Solo performance
/run-tests performance
```