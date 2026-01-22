#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
#  POST-TOOL FORMAT - Osyris Web
#  Se ejecuta después de editar o crear archivos para formatear
# ═══════════════════════════════════════════════════════════════════════════

TOOL_INPUT="${TOOL_INPUT:-}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Extraer el path del archivo del input
FILE_PATH=$(echo "$TOOL_INPUT" | grep -oP '"file_path"\s*:\s*"\K[^"]+' 2>/dev/null || echo "")

# Si no hay archivo, salir
if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
    exit 0
fi

# Obtener extensión
EXTENSION="${FILE_PATH##*.}"

# ─────────────────────────────────────────────────────────────────────────────
# Formatear según el tipo de archivo
# ─────────────────────────────────────────────────────────────────────────────

case "$EXTENSION" in
    ts|tsx|js|jsx|mjs|cjs)
        # TypeScript/JavaScript - usar Prettier si está disponible
        if command -v prettier &> /dev/null; then
            prettier --write "$FILE_PATH" --log-level error 2>/dev/null || true
        elif [ -f "$PROJECT_DIR/node_modules/.bin/prettier" ]; then
            "$PROJECT_DIR/node_modules/.bin/prettier" --write "$FILE_PATH" --log-level error 2>/dev/null || true
        fi
        ;;

    json)
        # JSON - formatear con jq si está disponible
        if command -v jq &> /dev/null && [ -s "$FILE_PATH" ]; then
            TMP_FILE=$(mktemp)
            if jq '.' "$FILE_PATH" > "$TMP_FILE" 2>/dev/null; then
                mv "$TMP_FILE" "$FILE_PATH"
            else
                rm -f "$TMP_FILE"
            fi
        fi
        ;;

    css|scss|less)
        # CSS - usar Prettier
        if command -v prettier &> /dev/null; then
            prettier --write "$FILE_PATH" --log-level error 2>/dev/null || true
        fi
        ;;

    md)
        # Markdown - no formatear automáticamente para preservar estructura
        ;;

    sql)
        # SQL - preservar formato manual
        ;;

    sh|bash)
        # Shell scripts - verificar sintaxis
        bash -n "$FILE_PATH" 2>/dev/null || echo -e "${YELLOW}⚠️  Posible error de sintaxis en $FILE_PATH${NC}"
        ;;

    *)
        # Otros archivos - no formatear
        ;;
esac

exit 0
