#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  PRE-TOOL VALIDATE - Osyris Web
#  Se ejecuta antes de cada comando Bash para validar seguridad
# ═══════════════════════════════════════════════════════════════════════════

# Variables de entrada desde Claude Code
TOOL_INPUT="${TOOL_INPUT:-}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# Colores
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Extraer el comando del input JSON
COMMAND=$(echo "$TOOL_INPUT" | grep -oP '"command"\s*:\s*"\K[^"]+' 2>/dev/null || echo "$TOOL_INPUT")

# ─────────────────────────────────────────────────────────────────────────────
# Lista de comandos peligrosos bloqueados
# ─────────────────────────────────────────────────────────────────────────────
DANGEROUS_PATTERNS=(
    "rm -rf /"
    "rm -rf /*"
    "rm -rf ~"
    ":(){ :|:& };:"      # Fork bomb
    "> /dev/sda"
    "dd if=/dev/"
    "chmod 777 /"
    "chmod -R 777"
    "sudo rm -rf"
    "git push --force origin main"
    "git push -f origin main"
    "git push --force origin master"
    "git push -f origin master"
    "DROP DATABASE"
    "DROP TABLE"
    "TRUNCATE TABLE"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if [[ "$COMMAND" == *"$pattern"* ]]; then
        echo -e "${RED}❌ COMANDO BLOQUEADO: Patrón peligroso detectado${NC}" >&2
        echo -e "${RED}   Patrón: $pattern${NC}" >&2
        exit 1
    fi
done

# ─────────────────────────────────────────────────────────────────────────────
# Advertencias para comandos sensibles
# ─────────────────────────────────────────────────────────────────────────────

# Advertir sobre modificación de archivos de producción
if [[ "$COMMAND" == *".env.production"* ]] || [[ "$COMMAND" == *"production"* && "$COMMAND" == *"rm"* ]]; then
    echo -e "${YELLOW}⚠️  ADVERTENCIA: Operación en archivos de producción${NC}" >&2
fi

# Advertir sobre operaciones de Docker en producción
if [[ "$COMMAND" == *"docker"* && "$COMMAND" == *"--rm"* && "$COMMAND" == *"osyris-db"* ]]; then
    echo -e "${YELLOW}⚠️  ADVERTENCIA: Operación destructiva en contenedor de BD${NC}" >&2
fi

# Advertir sobre push sin verificación
if [[ "$COMMAND" == *"git push"* && "$COMMAND" != *"--dry-run"* ]]; then
    echo -e "${YELLOW}⚠️  Recuerda: Push directo sin --dry-run${NC}" >&2
fi

# Advertir sobre migraciones de BD
if [[ "$COMMAND" == *"migrate"* ]] || [[ "$COMMAND" == *"prisma"* && "$COMMAND" == *"push"* ]]; then
    echo -e "${YELLOW}⚠️  MIGRACIÓN DE BD: Asegúrate de tener backup${NC}" >&2
fi

# ─────────────────────────────────────────────────────────────────────────────
# Comando aprobado
# ─────────────────────────────────────────────────────────────────────────────
exit 0
