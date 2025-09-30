#!/bin/bash

# 🔄 Environment Switch Hook: Restart Services
# Restarts development services after configuration changes

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Restarting services after environment switch...${NC}"

# Function to log messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse hook context from environment variable
if [ -n "$HOOK_CONTEXT" ]; then
    TARGET_ENV=$(echo "$HOOK_CONTEXT" | grep -o '"to":"[^"]*"' | cut -d'"' -f4)
    log_info "Target environment: $TARGET_ENV"
else
    log_warning "No hook context provided, assuming development"
    TARGET_ENV="development"
fi

# Change to project root
cd "$(dirname "$0")/../../.."

# Kill existing processes
log_info "Stopping existing services..."

# Kill processes on ports 3000 and 5000
lsof -ti:3000,5000 | xargs -r kill -9 2>/dev/null || true

# Kill by process name
pkill -f "next dev" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true

log_success "Existing services stopped"

# Wait a moment for processes to fully terminate
sleep 2

# Install/update dependencies if needed
if [ "$TARGET_ENV" = "production" ]; then
    log_info "Checking production dependencies..."

    # Check if Supabase dependencies are installed
    if ! npm list @supabase/supabase-js > /dev/null 2>&1; then
        log_info "Installing Supabase dependencies..."
        cd api-osyris
        npm install @supabase/supabase-js @supabase/storage-js
        cd ..
    fi
elif [ "$TARGET_ENV" = "development" ]; then
    log_info "Checking development dependencies..."

    # Check if SQLite dependencies are installed
    if ! npm list sqlite3 > /dev/null 2>&1; then
        log_info "Installing SQLite dependencies..."
        cd api-osyris
        npm install sqlite3
        cd ..
    fi
fi

# Start services based on environment
log_info "Starting services for $TARGET_ENV environment..."

if [ "$TARGET_ENV" = "production" ]; then
    # Production mode - start with production settings
    log_info "Starting in production mode..."

    # Set production environment variables
    export NODE_ENV=production
    export DATABASE_TYPE=supabase

    # Start services
    npm run dev:backend &
    BACKEND_PID=$!

    sleep 5  # Give backend time to start

    npm run dev:frontend &
    FRONTEND_PID=$!

    log_success "Services started in production mode"
    log_info "Backend PID: $BACKEND_PID"
    log_info "Frontend PID: $FRONTEND_PID"

else
    # Development mode - start with SQLite
    log_info "Starting in development mode..."

    # Set development environment variables
    export NODE_ENV=development
    export DATABASE_TYPE=sqlite

    # Initialize SQLite database if needed
    if [ ! -f "api-osyris/database/osyris.db" ]; then
        log_info "Creating SQLite database..."
        mkdir -p api-osyris/database
        cd api-osyris
        node -e "
        const { initializeDatabase } = require('./src/config/db.config');
        initializeDatabase().then(() => {
            console.log('✅ SQLite database initialized');
            process.exit(0);
        }).catch(err => {
            console.error('❌ Failed to initialize database:', err);
            process.exit(1);
        });"
        cd ..
    fi

    # Start development services using the existing script
    ./scripts/dev-start.sh &
    DEV_PID=$!

    log_success "Services started in development mode"
    log_info "Development script PID: $DEV_PID"
fi

# Health check
log_info "Performing health check..."
sleep 10  # Give services time to fully start

# Check if backend is responding
if curl -s http://localhost:5000 > /dev/null; then
    log_success "✅ Backend is responding on port 5000"
else
    log_warning "⚠️ Backend may not be fully started yet"
fi

# Check if frontend is responding
if curl -s http://localhost:3000 > /dev/null; then
    log_success "✅ Frontend is responding on port 3000"
else
    log_warning "⚠️ Frontend may not be fully started yet"
fi

# Save process information for monitoring
echo "{
    \"timestamp\": \"$(date -Iseconds)\",
    \"environment\": \"$TARGET_ENV\",
    \"backend_port\": 5000,
    \"frontend_port\": 3000,
    \"status\": \"restarted\"
}" > .claude/logs/service-status.json

log_success "🎉 Services restart completed for $TARGET_ENV environment"

# Display access information
echo ""
echo -e "${GREEN}🌐 Service URLs:${NC}"
echo -e "   Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "   Backend:  ${BLUE}http://localhost:5000${NC}"
echo -e "   API Docs: ${BLUE}http://localhost:5000/api-docs${NC}"
echo ""

exit 0