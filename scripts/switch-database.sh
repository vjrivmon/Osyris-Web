#!/bin/bash

# 🔄 Script para cambiar entre SQLite y Supabase
# Uso: ./scripts/switch-database.sh [sqlite|supabase]

ENV_FILE="api-osyris/.env"

function switch_to_sqlite() {
    echo "🔄 Cambiando a SQLite..."
    sed -i 's/DATABASE_TYPE=supabase/DATABASE_TYPE=sqlite/' $ENV_FILE
    sed -i 's/STORAGE_TYPE=supabase/STORAGE_TYPE=local/' $ENV_FILE
    echo "✅ Configurado para SQLite local"
}

function switch_to_supabase() {
    echo "☁️ Cambiando a Supabase..."
    sed -i 's/DATABASE_TYPE=sqlite/DATABASE_TYPE=supabase/' $ENV_FILE
    sed -i 's/STORAGE_TYPE=local/STORAGE_TYPE=supabase/' $ENV_FILE
    echo "✅ Configurado para Supabase"
}

function show_status() {
    echo "📊 Estado actual:"
    grep "DATABASE_TYPE=" $ENV_FILE
    grep "STORAGE_TYPE=" $ENV_FILE
}

case "$1" in
    sqlite)
        switch_to_sqlite
        show_status
        echo ""
        echo "🚀 Reinicia el servidor con: ./scripts/dev-start.sh"
        ;;
    supabase)
        switch_to_supabase
        show_status
        echo ""
        echo "⚠️  Asegúrate de haber ejecutado el esquema en Supabase primero!"
        echo "🚀 Reinicia el servidor con: ./scripts/dev-start.sh"
        ;;
    status)
        show_status
        ;;
    *)
        echo "Uso: $0 {sqlite|supabase|status}"
        echo ""
        show_status
        exit 1
        ;;
esac