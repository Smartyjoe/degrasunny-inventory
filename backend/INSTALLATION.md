# Complete Installation Guide

## Prerequisites

- PHP 8.2 or higher
- Composer
- MySQL 8.0 or higher
- Node.js (for frontend)

## Step-by-Step Setup

### 1. Install PHP and Required Extensions

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install php8.2 php8.2-cli php8.2-common php8.2-mysql \
  php8.2-xml php8.2-curl php8.2-mbstring php8.2-zip
```

**macOS (Homebrew):**
```bash
brew install php@8.2
brew install composer
```

**Windows:**
- Download and install XAMPP or Laragon

### 2. Install Composer

```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
sudo mv composer.phar /usr/local/bin/composer
```

### 3. Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE trader_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional)
CREATE USER 'trader_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON trader_inventory.* TO 'trader_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 5. Configure Environment

Edit `.env` file:

```env
APP_NAME="Trader Inventory API"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=trader_inventory
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000
SPA_URL=http://localhost:5173
```

### 6. Run Migrations and Seeders

```bash
# Run migrations
php artisan migrate

# OR fresh install with sample data
php artisan migrate:fresh --seed
```

This creates:
- All database tables
- 2 test users
- 5 sample products
- Stock data
- Sample sales

### 7. Start Development Server

```bash
php artisan serve
```

API runs at: `http://localhost:8000`

### 8. Setup Frontend

```bash
# Navigate to frontend (root directory)
cd ..

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Start frontend:
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 9. Test the Setup

1. Open browser: `http://localhost:5173`
2. Login with: `trader@example.com` / `password`
3. Navigate through dashboard, products, sales

## Production Setup

### 1. Server Requirements

- Ubuntu 22.04 LTS (recommended)
- Nginx or Apache
- PHP 8.2+ with FPM
- MySQL 8.0+
- SSL certificate

### 2. Install on Server

```bash
# Clone repository
git clone your-repo-url
cd your-repo/backend

# Install dependencies (production)
composer install --optimize-autoloader --no-dev

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate --force

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### 3. Nginx Configuration

Create `/etc/nginx/sites-available/trader-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/trader-api/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/trader-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### 5. Setup Cron for Scheduled Tasks

```bash
crontab -e
```

Add:
```
* * * * * cd /var/www/trader-api/backend && php artisan schedule:run >> /dev/null 2>&1
```

### 6. Setup Supervisor for Queue (Optional)

Create `/etc/supervisor/conf.d/trader-worker.conf`:

```ini
[program:trader-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/trader-api/backend/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/trader-api/backend/storage/logs/worker.log
```

### 7. Set Permissions

```bash
cd /var/www/trader-api/backend
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

## Docker Setup (Alternative)

Create `docker-compose.yml` in backend directory:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - .:/var/www
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_DATABASE=trader_inventory
      - DB_USERNAME=root
      - DB_PASSWORD=secret

  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: trader_inventory
    volumes:
      - dbdata:/var/lib/mysql

volumes:
  dbdata:
```

Create `Dockerfile`:

```dockerfile
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpng-dev libonig-dev libxml2-dev

RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install

CMD php artisan serve --host=0.0.0.0 --port=8000
```

Run:
```bash
docker-compose up -d
docker-compose exec app php artisan migrate --seed
```

## Troubleshooting

### Issue: "Class not found"
```bash
composer dump-autoload
php artisan config:clear
php artisan cache:clear
```

### Issue: "Access denied for user"
Check MySQL credentials in `.env`

### Issue: "SQLSTATE[HY000] [2002] Connection refused"
Ensure MySQL is running:
```bash
sudo systemctl status mysql
sudo systemctl start mysql
```

### Issue: CORS errors
Update `config/cors.php` with your frontend URL

### Issue: Token authentication fails
```bash
php artisan config:clear
php artisan cache:clear
```

Check `SANCTUM_STATEFUL_DOMAINS` in `.env`

## Next Steps

1. ✅ Backend running at `http://localhost:8000`
2. ✅ Test API at `http://localhost:8000/api`
3. ✅ Frontend running at `http://localhost:5173`
4. ✅ Login and test features
5. 🎉 Start building!

## Support

Check README.md for API documentation and usage examples.
