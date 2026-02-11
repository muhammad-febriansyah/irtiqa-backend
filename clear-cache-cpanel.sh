#!/bin/bash
# Script untuk clear cache di cPanel via SSH
# Upload script ini ke server dan jalankan: bash clear-cache-cpanel.sh

cd "$(dirname "$0")"

echo "Clearing Laravel cache on cPanel..."

php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo "Cache cleared successfully!"
echo "Now try accessing the login page again."
