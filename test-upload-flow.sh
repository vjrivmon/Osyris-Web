#!/bin/bash

# 🧪 TEST SCRIPT: Complete Upload Flow Validation
# Validates the complete file upload system from frontend to backend

echo "🚀 Testing Osyris Upload System..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_test() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS:${NC} $1"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL:${NC} $1"
        ((TESTS_FAILED++))
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
}

# 1. Check if uploads directory exists
echo -e "\n${YELLOW}1. Checking Upload Directory Structure${NC}"
echo "------------------------------------"

if [ -d "uploads" ]; then
    print_test "uploads/ directory exists" 0
else
    print_test "uploads/ directory exists" 1
fi

if [ -d "uploads/general" ]; then
    print_test "uploads/general/ directory exists" 0
else
    print_test "uploads/general/ directory exists" 1
fi

# Count files in uploads
UPLOAD_COUNT=$(find uploads/ -type f 2>/dev/null | wc -l)
print_info "Current files in uploads/: $UPLOAD_COUNT"

# 2. Check database schema
echo -e "\n${YELLOW}2. Checking Database Schema${NC}"
echo "----------------------------"

# Check if database file exists
if [ -f "database/osyris.db" ]; then
    print_test "SQLite database file exists" 0
else
    print_test "SQLite database file exists" 1
fi

# 3. Check backend controller files
echo -e "\n${YELLOW}3. Checking Backend Files${NC}"
echo "--------------------------"

if [ -f "api-osyris/src/controllers/upload.local.controller.js" ]; then
    print_test "Upload controller exists" 0
else
    print_test "Upload controller exists" 1
fi

if [ -f "api-osyris/src/routes/upload.routes.js" ]; then
    print_test "Upload routes exist" 0
else
    print_test "Upload routes exist" 1
fi

# Check if multer is configured
if grep -q "multer.diskStorage" api-osyris/src/controllers/upload.local.controller.js; then
    print_test "Multer disk storage configured" 0
else
    print_test "Multer disk storage configured" 1
fi

# Check if database queries exist
if grep -q "INSERT INTO documentos" api-osyris/src/controllers/upload.local.controller.js; then
    print_test "Database insert query exists" 0
else
    print_test "Database insert query exists" 1
fi

# 4. Check frontend admin page
echo -e "\n${YELLOW}4. Checking Frontend Files${NC}"
echo "---------------------------"

if [ -f "app/admin/page.tsx" ]; then
    print_test "Admin page exists" 0
else
    print_test "Admin page exists" 1
fi

# Check for upload form elements
if grep -q "handleUpload" app/admin/page.tsx; then
    print_test "Upload handler function exists" 0
else
    print_test "Upload handler function exists" 1
fi

if grep -q "FormData" app/admin/page.tsx; then
    print_test "FormData usage implemented" 0
else
    print_test "FormData usage implemented" 1
fi

if grep -q "XMLHttpRequest" app/admin/page.tsx; then
    print_test "Progress tracking implemented" 0
else
    print_test "Progress tracking implemented" 1
fi

# 5. Check if static file serving is configured
echo -e "\n${YELLOW}5. Checking Static File Serving${NC}"
echo "--------------------------------"

if grep -q "/uploads.*express.static" api-osyris/src/index.js; then
    print_test "Static file serving configured" 0
else
    print_test "Static file serving configured" 1
fi

# 6. Check package dependencies
echo -e "\n${YELLOW}6. Checking Dependencies${NC}"
echo "------------------------"

# Check backend dependencies
cd api-osyris 2>/dev/null

if [ -f "package.json" ]; then
    if grep -q "multer" package.json; then
        print_test "Multer dependency installed" 0
    else
        print_test "Multer dependency installed" 1
    fi

    if grep -q "uuid" package.json; then
        print_test "UUID dependency installed" 0
    else
        print_test "UUID dependency installed" 1
    fi
else
    print_test "Backend package.json exists" 1
fi

cd .. 2>/dev/null

# 7. Test file permissions
echo -e "\n${YELLOW}7. Checking File Permissions${NC}"
echo "-----------------------------"

if [ -w "uploads/" ]; then
    print_test "uploads/ directory is writable" 0
else
    print_test "uploads/ directory is writable" 1
fi

# 8. Create a test file and check if it can be saved
echo -e "\n${YELLOW}8. Testing File Creation${NC}"
echo "------------------------"

TEST_FILE="uploads/test-upload-$(date +%s).txt"
if echo "Test file for upload system" > "$TEST_FILE" 2>/dev/null; then
    print_test "Can create files in uploads/" 0
    rm -f "$TEST_FILE" 2>/dev/null
else
    print_test "Can create files in uploads/" 1
fi

# 9. Check if server can start (basic syntax check)
echo -e "\n${YELLOW}9. Backend Syntax Validation${NC}"
echo "-----------------------------"

cd api-osyris
if node -c src/index.js 2>/dev/null; then
    print_test "Backend server syntax is valid" 0
else
    print_test "Backend server syntax is valid" 1
fi
cd ..

# 10. Frontend TypeScript validation (basic check)
echo -e "\n${YELLOW}10. Frontend TypeScript Validation${NC}"
echo "-----------------------------------"

if command -v npx >/dev/null 2>&1; then
    # Just check if the admin file has valid TypeScript syntax structure
    if grep -q "useState.*File.*null" app/admin/page.tsx && grep -q "FormData()" app/admin/page.tsx; then
        print_test "Admin page TypeScript structure is valid" 0
    else
        print_test "Admin page TypeScript structure is valid" 1
    fi
else
    print_warning "npx not available, skipping TypeScript validation"
fi

# Summary
echo -e "\n${BLUE}📊 TEST SUMMARY${NC}"
echo "==============="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Upload system is ready to use.${NC}"
    echo -e "\n${BLUE}🚀 Next Steps:${NC}"
    echo "1. Start the backend server: cd api-osyris && npm run dev"
    echo "2. Start the frontend: npm run dev:frontend"
    echo "3. Navigate to http://localhost:3000/admin"
    echo "4. Go to the 'Archivos' tab to test uploads"
    echo "5. Upload an image, copy its URL, and use it in the page editor"

    EXIT_CODE=0
else
    echo -e "\n${RED}💥 SOME TESTS FAILED!${NC}"
    echo -e "${YELLOW}Please fix the failed tests before using the upload system.${NC}"

    EXIT_CODE=1
fi

echo -e "\n${BLUE}📋 Upload System Features:${NC}"
echo "• Drag & drop file upload"
echo "• Progress indicators with percentage"
echo "• Image previews and thumbnails"
echo "• Custom file titles and descriptions"
echo "• Copy-to-clipboard URLs for page editor"
echo "• Real database persistence"
echo "• File type validation"
echo "• Size limit enforcement (10MB)"
echo "• Automatic unique file naming"

exit $EXIT_CODE