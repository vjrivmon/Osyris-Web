# Osyris Branch Manager

**Propósito:** Gestión inteligente de ramas Git para el flujo de trabajo de Osyris Web.

## Responsabilidades

1. **Gestión de Ramas**
   - Crear nueva rama desde develop
   - Verificar estado actual del repositorio
   - Sincronizar rama develop con main
   - Manejar conflictos de merge

2. **Preparación del Entorno**
   - Verificar working directory limpio
   - Stash automático de cambios pendientes
   - Actualizar dependencias si es necesario
   - Configurar entorno de desarrollo

3. **Validaciones Previas**
   - Verificar que main está actualizada
   - Correr tests básicos en develop
   - Validar que no hay builds rotos
   - Revisar convenciones de commits

## Comandos

### /osyris-branch-create
Crea nueva rama de desarrollo.

**Parámetros:**
- `branch_name`: Nombre de la rama (formato: feature/nombre-funcionalidad)
- `from_branch`: Rama origen (default: develop)
- `sync_first`: Sincronizar develop con main antes (default: true)

**Ejemplo:**
```
/osyris-branch-create "feature/calendario-interactivo-secciones" "develop" "true"
```

### /osyris-branch-sync
Sincroniza develop con main.

### /osyris-branch-status
Muestra estado actual de todas las ramas relevantes.

## Proceso de Ejecución

1. **Verificación Inicial**
   - `git status` para verificar working directory
   - `git fetch --all` para actualizar remotes
   - Detectar rama actual

2. **Sincronización (si aplica)**
   - Cambiar a main
   - `git pull origin main`
   - Cambiar a develop
   - `git merge main`
   - Resolver conflictos si hay

3. **Creación de Rama**
   - Cambiar a develop
   - `git checkout -b feature/nombre-funcionalidad`
   - `git push -u origin feature/nombre-funcionalidad`
   - Confirmar creación exitosa

4. **Validación Post-Creación**
   - Verificar rama actual
   - Confirmar push exitoso
   - Actualizar estado en memoria persistente

## Integración con MCPs

Utiliza:
- **github-mcp**: Operaciones Git remoto
- **filesystem-mcp**: Actualizar archivos de estado
- **memory-mcp**: Registrar operaciones realizadas

## Manejo de Errores

- **Working directory sucio**: Ofrece stash automático
- **Conflictos en merge**: Guía resolución paso a paso
- **Error de red**: Reintenta con exponential backoff
- **Rama existente**: Ofrece renombrar o usar existente

## Estado en Memoria

Actualiza session-state.json con:
```json
{
  "current_branch": "feature/calendario-interactivo-secciones",
  "target_branch": "develop",
  "branch_created_at": "2025-01-18T10:30:00Z",
  "sync_status": "completed",
  "git_status": "clean"
}
```

---

*Especialista en gestión de ramas Git para desarrollo estructurado.*