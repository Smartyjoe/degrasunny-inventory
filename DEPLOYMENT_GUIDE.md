# 🚀 Deployment Guide - crypto.smatatech.com.ng

## Production Deployment Configuration

---

## 📋 Pre-Deployment Checklist

### 1. ✅ Build Verification
- [x] All TypeScript errors fixed
- [x] Product creation working
- [x] AI service properly configured
- [x] All features tested locally

### 2. ✅ Environment Variables
- [ ] Backend `.env` configured for production
- [ ] Frontend `.env.production` created
- [ ] Database credentials secured
- [ ] API keys added

### 3. ✅ Database Setup
- [ ] Production database created
- [ ] Migrations run
- [ ] Seeders executed (optional)
- [ ] Backup strategy in place

---

## 🔧 Backend Deployment (Laravel)

### Step 1: Prepare Backend Environment

Create `backend/.env` for production:

```bash
# Application
APP_NAME="Grasunny Inventory"
APP_ENV=production
APP_KEY=base64:your-generated-key-here
APP_DEBUG=false
APP_URL=https://crypto.smatatech.com.ng

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_secure_password

# CORS - Allow frontend domain
CORS_ALLOWED_ORIGINS=https://crypto.smatatech.com.ng

# Sanctum
SANCTUM_STATEFUL_DOMAINS=crypto.smatatech.com.ng
SESSION_DOMAIN=.smatatech.com.ng

# Cache & Session
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# Filesystem
FILESYSTEM_DISK=public
```

### Step 2: Deploy Backend Files

1. **Upload files to server:**
   ```bash
   # Via FTP/SFTP or Git
   rsync -avz backend/ user@server:/path/to/crypto.smatatech.com.ng/
   ```

2. **Install dependencies:**
   ```bash
   cd /path/to/crypto.smatatech.com.ng/backend
   composer install --no-dev --optimize-autoloader
   ```

3. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

4. **Run migrations:**
   ```bash
   php artisan migrate --force
   ```

5. **Create storage symlink:**
   ```bash
   php artisan storage:link
   ```

6. **Set permissions:**
   ```bash
   chmod -R 775 storage bootstrap/cache
   chown -R www-data:www-data storage bootstrap/cache
   ```

### Step 3: Configure Web Server

**Apache (.htaccess in public directory):**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /api/
    
    # Redirect to backend/public
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [L]
</IfModule>
```

**Nginx:**
```nginx
location /api {
    alias /path/to/backend/public;
    try_files $uri $uri/ /api/index.php?$query_string;
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $request_filename;
        include fastcgi_params;
    }
}
```

---

## 🎨 Frontend Deployment (React + Vite)

### Step 1: Create Production Environment File

Create `.env.production` in project root:

```bash
# Backend API URL (Production)
VITE_API_BASE_URL=https://crypto.smatatech.com.ng/api
VITE_API_URL=https://crypto.smatatech.com.ng/api

# OpenRouter API Key for AI Features
VITE_OPENROUTER_API_KEY=sk-or-v1-your-production-key-here
```

### Step 2: Build for Production

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This creates the `dist/` folder with optimized assets.

### Step 3: Deploy Frontend Files

1. **Upload dist folder to server:**
   ```bash
   # Via FTP/SFTP
   rsync -avz dist/ user@server:/path/to/crypto.smatatech.com.ng/public_html/
   ```

2. **Or use deployment service:**
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - DigitalOcean App Platform

### Step 4: Configure Web Server

**Apache (.htaccess in root):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

**Nginx:**
```nginx
server {
    listen 80;
    server_name crypto.smatatech.com.ng;
    root /path/to/public_html;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        alias /path/to/backend/public;
        try_files $uri $uri/ /api/index.php?$query_string;
        
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            include fastcgi_params;
        }
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-apache

# Get certificate
sudo certbot --apache -d crypto.smatatech.com.ng

# Auto-renewal (run as cron job)
sudo certbot renew --dry-run
```

---

## 🗄️ Database Setup

### Option 1: Using cPanel/phpMyAdmin

1. Create new MySQL database
2. Create database user
3. Grant all privileges
4. Import schema (if needed)
5. Update `.env` with credentials

### Option 2: Command Line

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE grasunny_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user
CREATE USER 'grasunny_user'@'localhost' IDENTIFIED BY 'secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON grasunny_inventory.* TO 'grasunny_user'@'localhost';
FLUSH PRIVILEGES;

# Exit
EXIT;
```

---

## 📂 Directory Structure on Server

```
/path/to/crypto.smatatech.com.ng/
├── public_html/              # Frontend (React build)
│   ├── index.html
│   ├── assets/
│   │   ├── index-xxx.js
│   │   └── index-xxx.css
│   ├── logo.png
│   └── .htaccess
│
└── backend/                  # Laravel API
    ├── app/
    ├── config/
    ├── public/              # API entry point
    │   └── index.php
    ├── storage/
    ├── .env                 # Production environment
    └── ...
```

---

## 🧪 Post-Deployment Testing

### 1. Backend API Test

```bash
# Test API endpoint
curl https://crypto.smatatech.com.ng/api/health

# Expected response:
{"status":"ok","message":"API is running"}
```

### 2. Frontend Test

1. Visit: https://crypto.smatatech.com.ng
2. Check:
   - [x] Page loads
   - [x] Logo appears
   - [x] Login works
   - [x] Dashboard loads
   - [x] Products can be created
   - [x] Sales can be recorded
   - [x] AI chat works (if API key configured)

### 3. Database Connection Test

```bash
# SSH into server
cd /path/to/backend
php artisan tinker

# In tinker:
DB::connection()->getPdo();
# Should return: PDO object (connection successful)
```

---

## 🔄 Automated Deployment (Optional)

### Using Git Hooks

Create `deploy.sh`:

```bash
#!/bin/bash

# Pull latest changes
git pull origin main

# Backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
cd ..

# Frontend
npm install
npm run build

# Sync to public_html
rsync -avz dist/ public_html/

echo "Deployment complete!"
```

---

## 📊 Performance Optimization

### Backend

```bash
# Cache config
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

### Frontend

- ✅ Already optimized by Vite build
- Assets are minified
- Code splitting enabled
- Gzip compression (via server)

---

## 🐛 Troubleshooting

### Issue: 500 Internal Server Error

**Solution:**
1. Check Laravel logs: `backend/storage/logs/laravel.log`
2. Verify `.env` is configured correctly
3. Check file permissions
4. Run `php artisan config:clear`

### Issue: API CORS Error

**Solution:**
Add to `backend/config/cors.php`:
```php
'allowed_origins' => ['https://crypto.smatatech.com.ng'],
```

### Issue: Frontend Blank Page

**Solution:**
1. Check browser console for errors
2. Verify `.env.production` has correct API URL
3. Rebuild: `npm run build`
4. Check `.htaccess` rewrite rules

### Issue: Database Connection Failed

**Solution:**
1. Verify database credentials in `.env`
2. Check database server is running
3. Verify user has correct privileges
4. Test connection: `php artisan tinker`

---

## 🔐 Security Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] Strong `APP_KEY` generated
- [ ] Secure database passwords
- [ ] HTTPS/SSL enabled
- [ ] CORS properly configured
- [ ] File permissions set correctly (755 for dirs, 644 for files)
- [ ] Sensitive files not publicly accessible
- [ ] Regular backups scheduled
- [ ] Security headers configured

---

## 💾 Backup Strategy

### Database Backup

```bash
# Create backup
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u username -p database_name < backup_20260125.sql
```

### File Backup

```bash
# Backup uploaded files
tar -czf storage_backup_$(date +%Y%m%d).tar.gz backend/storage/app/public
```

---

## 🎯 Deployment Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database created and migrated
- [ ] SSL certificate installed
- [ ] DNS pointing to server
- [ ] Backend API accessible
- [ ] Frontend loads correctly
- [ ] Test user registration
- [ ] Test product creation
- [ ] Test sales recording
- [ ] Test reports generation
- [ ] Test AI features (if enabled)
- [ ] Check all pages load
- [ ] Verify mobile responsiveness
- [ ] Test on different browsers
- [ ] Monitor error logs
- [ ] Set up automated backups

---

## 📞 Support

If you encounter issues during deployment:

1. Check Laravel logs: `backend/storage/logs/laravel.log`
2. Check browser console for frontend errors
3. Verify server requirements:
   - PHP >= 8.1
   - MySQL >= 5.7
   - Composer installed
   - Node.js >= 16 (for build)

---

## ✅ Deployment Complete!

Once all steps are completed:

1. Your app will be live at: https://crypto.smatatech.com.ng
2. Users can register and start using the system
3. Each user gets isolated data (multi-tenant)
4. All features are production-ready

**Congratulations on your deployment! 🎉**

---

**Last Updated:** 2026-01-25  
**Domain:** crypto.smatatech.com.ng  
**Status:** Ready for Production
