# Local Deployment Guide for Mac

## Prerequisites

Before deploying locally on Mac, ensure you have:

1. **Node.js** (version 18 or higher)
   ```bash
   # Check your Node.js version
   node --version
   
   # If not installed, download from https://nodejs.org/
   # Or install via Homebrew:
   brew install node
   ```

2. **PostgreSQL Database**
   ```bash
   # Install PostgreSQL via Homebrew
   brew install postgresql@15
   
   # Start PostgreSQL service
   brew services start postgresql@15
   
   # Create a database for the application
   createdb roofing_assistant
   ```

3. **Git** (to clone the repository)
   ```bash
   # Check if Git is installed
   git --version
   
   # If not installed:
   brew install git
   ```

## Deployment Steps

### 1. Clone and Setup Project

```bash
# Create a directory for your project
mkdir roofing-assistant
cd roofing-assistant

# Copy all project files from Replit to this directory
# You can download as ZIP from Replit or use git if available
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
# Create environment file
touch .env
```

Add the following to your `.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/roofing_assistant
PGHOST=localhost
PGPORT=5432
PGDATABASE=roofing_assistant
PGUSER=your_username
PGPASSWORD=your_password

# OpenAI Configuration (required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Development Environment
NODE_ENV=development
```

**Replace the database credentials with your actual PostgreSQL settings:**
- `your_username`: Your Mac username (usually)
- `your_password`: Your PostgreSQL password (if set)
- `your_openai_api_key_here`: Your actual OpenAI API key

### 4. Database Setup

```bash
# Push the database schema
npm run db:push

# This will create all necessary tables with the pre-loaded product data
```

### 5. Verify File Structure

Ensure you have all these key files:
```
├── client/                 # Frontend React application
├── server/                 # Backend Express server
├── shared/                 # Shared types and schemas
├── attached_assets/        # Product PDF files
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
├── drizzle.config.ts      # Database configuration
└── .env                   # Environment variables
```

### 6. Start the Application

```bash
# Start the development server
npm run dev
```

This will start:
- Backend server on port 5000
- Frontend development server (proxied through Vite)
- Automatic reloading for both frontend and backend

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check if PostgreSQL is running
   brew services list | grep postgresql
   
   # Start PostgreSQL if not running
   brew services start postgresql@15
   
   # Verify database exists
   psql -l | grep roofing_assistant
   ```

2. **Port Already in Use**
   ```bash
   # Find what's using port 5000
   lsof -i :5000
   
   # Kill the process if needed
   kill -9 <PID>
   ```

3. **Missing OpenAI API Key**
   - The application will work without OpenAI, but AI features won't function
   - Get an API key from https://platform.openai.com/api-keys
   - Add it to your `.env` file

4. **File Upload Issues**
   ```bash
   # Ensure uploads directory exists
   mkdir -p uploads
   chmod 755 uploads
   ```

### Performance Optimization

For better performance on Mac:

1. **Use Node.js 18+ with native performance features**
2. **Increase Node.js memory limit if needed:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run dev
   ```

3. **Enable file watching optimization:**
   ```bash
   # Add to your shell profile (.zshrc or .bash_profile)
   export CHOKIDAR_USEPOLLING=false
   ```

## Production Deployment

For production deployment on Mac:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Use PM2 for process management:**
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Start with PM2
   pm2 start npm --name "roofing-assistant" -- start
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

3. **Set up reverse proxy with nginx (optional):**
   ```bash
   # Install nginx
   brew install nginx
   
   # Configure nginx to proxy to your app
   # Edit /usr/local/etc/nginx/nginx.conf
   ```

## Security Considerations

1. **Environment Variables:** Never commit `.env` files to version control
2. **Database Security:** Use strong passwords and limit database access
3. **API Keys:** Restrict OpenAI API key permissions and monitor usage
4. **File Uploads:** The app validates PDF uploads, but monitor upload directory size

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check that all required ports are available

The application includes comprehensive logging to help diagnose issues.