# barBack - Quick Start Guide

## Installation & Running

### Option 1: Production (Docker) - Recommended

This is the simplest way to run barBack. Everything runs in a single container.

```bash
# Build the application
make build

# Start the application
make run
```

That's it! Open your browser to **http://localhost:3000**

**Login:**
- Username: `admin`
- Password: `password`

⚠️ **Change the default password immediately after first login!**

### Option 2: Development Mode

For development with hot-reload:

```bash
# Install dependencies (first time only)
make install

# Start development servers
make dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Common Commands

```bash
make build      # Build Docker image
make run        # Start application
make stop       # Stop application
make restart    # Restart application
make logs       # View logs
make clean      # Remove everything (WARNING: deletes data!)
```

## What You Get

✅ **Authentication System**
- Login page with username/password
- Google SSO support (optional)
- User management in settings
- Session-based authentication

✅ **Production Ready**
- Single Docker container
- Persistent data storage
- Health checks
- Optimized build

✅ **Easy Deployment**
- Works with CI/CD pipelines
- Can be exported and transferred
- Docker registry compatible

## After Login

1. **Change Admin Password**
   - Click "Configure" button
   - Scroll to "User Management"
   - Click edit icon next to admin user
   - Enter new password

2. **Add Users** (optional)
   - In User Management section
   - Click "Add User"
   - Fill in username, password, email
   - Click "Add User"

3. **Configure Backup**
   - Enter remote server details
   - Click "Connect to Server"
   - Use backup controls on dashboard

## Google SSO Setup (Optional)

1. Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Edit `.env` file in project root
3. Add your credentials:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
4. Rebuild and restart:
   ```bash
   make build
   make run
   ```

## Troubleshooting

**Login not working?**
- Use default credentials: `admin` / `password`
- Check logs: `make logs`
- Verify health: `curl http://localhost:3000/health`

**Port 3000 already in use?**
- Edit `docker-compose.yml`
- Change `"3000:3001"` to `"8080:3001"` (or your preferred port)
- Run `make build && make run`

**Need to start fresh?**
```bash
make clean    # Removes everything including user data!
make build
make run
```

## Next Steps

- Read [Authentication Guide](docs/AUTHENTICATION.md) for detailed auth docs
- Read [Deployment Guide](docs/DEPLOYMENT.md) for CI/CD setup
- Check main [README](README.md) for full documentation

## Key Differences from npm start/dev

**Before (Development):**
- Run `npm start` in backend folder
- Run `npm run dev` in frontend folder
- Two separate processes
- Backend on port 3001, Frontend on port 5173

**Now (Production with Docker):**
- Single command: `make run`
- Single container running everything
- Everything on port 3000
- Production-optimized build

**Both approaches still work!** Use Docker for production, use `make dev` for development.
