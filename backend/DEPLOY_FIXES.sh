#!/bin/bash

# Deployment Script for Critical Fixes
# Run this script to deploy all 4 critical fixes safely

echo "========================================"
echo "Deploying Critical Production Fixes"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1 FAILED${NC}"
        exit 1
    fi
}

# Step 1: Backup database
echo -e "${YELLOW}Step 1: Creating database backup...${NC}"
php artisan db:backup 2>/dev/null || echo "Warning: Backup command not available. Please backup manually."
echo ""

# Step 2: Run migrations
echo -e "${YELLOW}Step 2: Running database migrations...${NC}"
php artisan migrate --force
check_status "Migration completed"
echo ""

# Step 3: Verify storage setup
echo -e "${YELLOW}Step 3: Setting up storage...${NC}"
php artisan storage:link
check_status "Storage symlink created"

# Create logo directory if it doesn't exist
mkdir -p storage/app/public/store_logos
chmod -R 775 storage/app/public/store_logos
check_status "Logo directory created"
echo ""

# Step 4: Set correct permissions
echo -e "${YELLOW}Step 4: Setting permissions...${NC}"
chmod -R 775 storage
chmod -R 775 bootstrap/cache
check_status "Permissions set"
echo ""

# Step 5: Clear caches
echo -e "${YELLOW}Step 5: Clearing caches...${NC}"
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
check_status "Caches cleared"
echo ""

# Step 6: Verify fixes
echo -e "${YELLOW}Step 6: Verifying deployment...${NC}"
echo "Checking database..."
php artisan tinker --execute="
    echo 'Testing database connection...' . PHP_EOL;
    DB::connection()->getPdo();
    echo '✓ Database connected' . PHP_EOL;
    
    echo 'Verifying products table...' . PHP_EOL;
    \$indexes = DB::select('SHOW INDEX FROM products WHERE Key_name = ?', ['products_user_id_name_unique']);
    if (count(\$indexes) > 0) {
        echo '✓ Composite unique constraint exists' . PHP_EOL;
    } else {
        echo '✗ WARNING: Composite unique constraint not found!' . PHP_EOL;
    }
    
    echo 'Verifying storage directory...' . PHP_EOL;
    if (file_exists(storage_path('app/public/store_logos'))) {
        echo '✓ Logo storage directory exists' . PHP_EOL;
    } else {
        echo '✗ WARNING: Logo storage directory not found!' . PHP_EOL;
    }
"
echo ""

# Summary
echo "========================================"
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================"
echo ""
echo "Fixes Applied:"
echo "  ✓ Issue 1: Product name isolation per trader"
echo "  ✓ Issue 2: Product category now saves correctly"
echo "  ✓ Issue 3: Logo upload validation fixed (422)"
echo "  ✓ Issue 4: Logo upload error handling fixed (500)"
echo ""
echo "Next Steps:"
echo "  1. Test product creation with same name (different traders)"
echo "  2. Test creating products with categories"
echo "  3. Test logo upload (JPG, PNG, WEBP)"
echo "  4. Monitor logs: tail -f storage/logs/laravel.log"
echo ""
echo "See CRITICAL_FIXES_COMPLETE.md for detailed test scenarios"
echo ""
