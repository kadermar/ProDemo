# Deploy Roofing Assistant on Your Own Domain

This guide covers deploying your roofing product information system on your own custom domain using various hosting platforms.

## Deployment Options

### 1. Vercel (Recommended - Easy & Fast)

**Pros:** Automatic deployments, built-in PostgreSQL, custom domains, excellent performance
**Cost:** Free tier available, paid plans from $20/month

#### Setup Steps:

1. **Prepare Repository:**
   ```bash
   # Create a new repository on GitHub
   # Upload all your project files (excluding node_modules and .env)
   ```

2. **Configure for Vercel:**
   Create `vercel.json` in project root:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/index.ts",
         "use": "@vercel/node",
         "config": {
           "includeFiles": ["attached_assets/**", "server/**", "shared/**"]
         }
       },
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist/public"
         }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "/dist/public/$1"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy:**
   - Connect your GitHub repo to Vercel
   - Add environment variables in Vercel dashboard:
     - `DATABASE_URL`
     - `OPENAI_API_KEY`
   - Deploy automatically

4. **Custom Domain:**
   - In Vercel dashboard, go to Domains
   - Add your custom domain (e.g., roofing-assistant.yourdomain.com)
   - Follow DNS configuration instructions

---

### 2. Railway (Great for Full-Stack Apps)

**Pros:** PostgreSQL included, simple deployment, fair pricing
**Cost:** $5/month per service

#### Setup Steps:

1. **Connect Repository:**
   - Sign up at railway.app
   - Connect your GitHub repository

2. **Configure Services:**
   ```bash
   # Railway will auto-detect and deploy
   # Add environment variables in Railway dashboard
   ```

3. **Custom Domain:**
   - In Railway dashboard, go to Settings
   - Add custom domain
   - Configure DNS records as instructed

---

### 3. DigitalOcean App Platform

**Pros:** Full control, scalable, PostgreSQL managed database
**Cost:** $12/month for basic app + $15/month for managed PostgreSQL

#### Setup Steps:

1. **Create App:**
   - Connect GitHub repository
   - Configure build and run commands:
     ```
     Build Command: npm run build
     Run Command: npm start
     ```

2. **Add Database:**
   - Create managed PostgreSQL database
   - Connect to your app via DATABASE_URL

3. **Custom Domain:**
   - Add domain in App settings
   - Configure DNS records

---

### 4. VPS Deployment (Full Control)

**Pros:** Complete control, cost-effective for high traffic
**Providers:** DigitalOcean Droplets, Linode, AWS EC2, Google Cloud

#### Setup Steps:

1. **Server Setup:**
   ```bash
   # Create Ubuntu 22.04 server
   # SSH into server
   ssh root@your-server-ip
   
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   
   # Install PostgreSQL
   apt install postgresql postgresql-contrib -y
   
   # Install Nginx
   apt install nginx -y
   
   # Install PM2 (process manager)
   npm install -g pm2
   ```

2. **Database Setup:**
   ```bash
   # Configure PostgreSQL
   sudo -u postgres createuser --interactive
   sudo -u postgres createdb roofing_assistant
   
   # Set password for database user
   sudo -u postgres psql
   ALTER USER your_username PASSWORD 'your_password';
   ```

3. **Deploy Application:**
   ```bash
   # Clone your repository
   git clone https://github.com/yourusername/roofing-assistant.git
   cd roofing-assistant
   
   # Install dependencies
   npm install
   
   # Create environment file
   nano .env
   # Add your environment variables
   
   # Build application
   npm run build
   
   # Push database schema
   npm run db:push
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Nginx Configuration:**
   Create `/etc/nginx/sites-available/roofing-assistant`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL Certificate:**
   ```bash
   # Install Certbot
   apt install certbot python3-certbot-nginx -y
   
   # Get SSL certificate
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## DNS Configuration

For any hosting option, you'll need to configure DNS:

1. **A Record:** Point your domain to the server IP
2. **CNAME Record:** Point www.yourdomain.com to yourdomain.com
3. **TTL:** Set to 300 seconds for faster propagation during setup

Example DNS records:
```
Type    Name    Value               TTL
A       @       192.168.1.100       300
CNAME   www     yourdomain.com      300
```

---

## Environment Variables Required

Regardless of hosting platform, you'll need:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key

# Environment
NODE_ENV=production
PORT=5000

# Optional: For session security
SESSION_SECRET=your_random_secret_key
```

---

## Performance Optimization

### CDN Setup (Optional but Recommended)
- Use Cloudflare for free CDN and SSL
- Configure caching rules for static assets
- Enable compression and minification

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_data_system ON product_data(system);
CREATE INDEX IF NOT EXISTS idx_product_data_manufacturer ON product_data(manufacturer);
CREATE INDEX IF NOT EXISTS idx_documents_filename ON documents(filename);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
```

---

## Cost Comparison

| Platform | Monthly Cost | Pros | Best For |
|----------|-------------|------|----------|
| Vercel | $0-$20 | Easy, automatic scaling | Small to medium traffic |
| Railway | $5-$20 | Simple, includes DB | Rapid deployment |
| DigitalOcean App | $27+ | Managed, scalable | Growing businesses |
| VPS | $5-$20 | Full control, customizable | High traffic, custom needs |

---

## Monitoring and Maintenance

1. **Application Monitoring:**
   - Set up error tracking (Sentry)
   - Monitor performance metrics
   - Set up uptime monitoring

2. **Database Backup:**
   ```bash
   # Automated backup script
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Security Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Regular server patching (for VPS)

---

## Domain Considerations

- **SSL Certificate:** All platforms provide free SSL
- **Email:** Consider setting up professional email (Google Workspace, Microsoft 365)
- **Subdomain Strategy:** Consider using subdomains for different environments:
  - `app.yourdomain.com` (production)
  - `staging.yourdomain.com` (testing)

Your roofing assistant will run perfectly on your own domain with all 205 product sheets, AI capabilities, and document analysis features intact.