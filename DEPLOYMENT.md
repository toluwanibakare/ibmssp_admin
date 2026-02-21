# IBMSSP ADMIN — Deployment Guide
## Domain: admin.ibmssp.org.ng

---

## Architecture Overview

| Layer | Technology | Port |
|-------|-----------|------|
| Frontend | React + Vite (static build) | Nginx / port 80/443 |
| Backend API | Node.js / Express | 5000 (proxied) |
| Database | MySQL | 3306 |

---

## 1. Server Setup (Ubuntu 22.04)

```bash
# Update & install essentials
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server nodejs npm git certbot python3-certbot-nginx
```

---

## 2. MySQL Database

```bash
sudo mysql_secure_installation
sudo mysql -u root -p

CREATE DATABASE IBMSSP_ADMIN CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ibmssp_user'@'localhost' IDENTIFIED BY 'YourSecurePassword';
GRANT ALL PRIVILEGES ON IBMSSP_ADMIN.* TO 'ibmssp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 3. Backend Deployment

```bash
cd /var/www/ibmssp
git clone https://github.com/your-repo/registry-hub.git .
cd backend

# Install dependencies
npm install --production

# Create .env (copy .env.production and fill values)
cp .env.production .env
nano .env
# Edit DB_PASS and any other credentials

# Initialize database (first time only!)
npm run init-db

# Install PM2
npm install -g pm2

# Start backend
pm2 start src/server.js --name ibmssp-api
pm2 startup
pm2 save
```

---

## 4. Frontend Build & Deployment

```bash
cd /var/www/ibmssp

# Make sure VITE_API_URL is set in .env.production
cat .env.production
# Should contain: VITE_API_URL=https://admin.ibmssp.org.ng/api

# Install and build
npm install
npm run build

# Output is in /var/www/ibmssp/dist
```

---

## 5. Nginx Configuration

Create `/etc/nginx/sites-available/ibmssp-admin`:

```nginx
server {
    listen 80;
    server_name admin.ibmssp.org.ng;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name admin.ibmssp.org.ng;

    ssl_certificate /etc/letsencrypt/live/admin.ibmssp.org.ng/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.ibmssp.org.ng/privkey.pem;

    root /var/www/ibmssp/dist;
    index index.html;

    # Frontend SPA (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads/ {
        proxy_pass http://localhost:5000/uploads/;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ibmssp-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL Certificate
sudo certbot --nginx -d admin.ibmssp.org.ng
```

---

## 6. WordPress CF7 Webhook Settings

In your WordPress CF7 plugin (using CF7 to Webhook or similar plugin):

- **URL**: `https://admin.ibmssp.org.ng/api/register`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Header**: `x-api-key: ibmssp_admin_secret_key_2025`

---

## 7. Admin Login Credentials

| Field | Value |
|-------|-------|
| URL | https://admin.ibmssp.org.ng |
| Email | info@ibmssp.org.ng |
| Password | Master@123 |

> ⚠️ **Change the password after first login!**

---

## 8. Deployment Notification

Send deployment summary to: **admin@ibmssp.org.ng**

You can use the Email Composer in the admin panel after login to confirm the system is operational.
