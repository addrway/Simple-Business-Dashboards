# DigitalOcean / Nginx Deployment Guide

This guide explains how to deploy the SBD Pro application securely on a single DigitalOcean Droplet running Ubuntu, using Nginx as a reverse proxy, PM2 for the Node backend, and serving the Create React App frontend.

## 1. Prerequisites
- A DigitalOcean Droplet (Ubuntu 20.04 or newer recommended).
- Node.js (v18+) and npm installed on the Droplet.
- PM2 installed globally: `sudo npm install -g pm2`
- Nginx installed: `sudo apt update && sudo apt install nginx`
- Your domain name pointed to the Droplet's IP address.

## 2. Environment Variables
Create a `.env` file in the project root (`/var/www/sbd/.env`) and add the following securely. **Do not hardcode these in source control.**

```env
# Frontend
REACT_APP_SUPABASE_URL=https://cfzlglnnqyetjtbtixlx.supabase.co
REACT_APP_SUPABASE_KEY=your-anon-key
REACT_APP_API_BASE_URL=https://yourdomain.com/api

# Backend
PORT=5000
ANTHROPIC_API_KEY=your-anthropic-key
SUPABASE_URL=https://cfzlglnnqyetjtbtixlx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=your-stripe-secret-key
```

## 3. Build the Frontend
Since SBD is built with Create React App, you must build it before deploying.

```bash
cd /var/www/sbd
npm install
npm run build
```
The output will be in the `/var/www/sbd/build` directory (not `/dist`).

## 4. Run the Backend API with PM2
Start the backend Express server using PM2 to ensure it runs continuously.

```bash
cd /var/www/sbd/backend
pm2 start server.js --name "sbd-api"
pm2 save
pm2 startup
```

## 5. Configure Nginx
Create or edit your Nginx site configuration (`/etc/nginx/sites-available/sbd`).

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        root /var/www/sbd/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 50M;
}
```

Enable the configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/sbd /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. Secure with SSL
Use Certbot to automatically configure SSL for your domain.
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

The application is now deployed! The frontend will interact with the secure backend API, and your API keys will remain safely on the server.
