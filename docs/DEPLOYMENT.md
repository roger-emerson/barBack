# Deployment Guide

## Quick Start (Production with Docker)

The easiest way to run barBack is using Docker. This bundles everything into a single container.

### 1. Build the Application

```bash
make build
```

This will:
- Build the React frontend
- Bundle it with the Node.js backend
- Create a production-optimized Docker image

### 2. Start the Application

```bash
make run
```

The application will be available at **http://localhost:3000**

**Default Credentials:**
- Username: `admin`
- Password: `password`

**⚠️ IMPORTANT:** Change the default password immediately after first login!

### 3. Stop the Application

```bash
make stop
```

## Other Useful Commands

```bash
make logs          # View application logs
make status        # Check if container is running
make restart       # Restart the application
make clean         # Remove containers and volumes (WARNING: deletes data!)
```

## Development Mode

If you want to develop with hot-reload:

```bash
make dev
```

This runs:
- Backend on http://localhost:3001
- Frontend on http://localhost:5173

## How It Works

### Production (Docker)

When you run `make build && make run`:

1. **Frontend Build** - React app is built into static files
2. **Backend Setup** - Node.js backend is configured
3. **Single Container** - Frontend static files are served by the backend
4. **Port 3000** - Everything accessible on one port
5. **Persistent Data** - User data stored in Docker volume

```
http://localhost:3000
         ↓
    [Docker Container]
         ↓
    Backend (Express)
    - Serves frontend files
    - Handles API requests
    - Manages authentication
    - Stores user data
```

### Development Mode

When you run `make dev`:

1. **Backend** runs on port 3001 with nodemon (auto-restart)
2. **Frontend** runs on port 5173 with Vite (hot-reload)
3. **CORS** enabled for cross-origin requests

```
Frontend (5173) ←→ API calls ←→ Backend (3001)
```

## Configuration

### Environment Variables

Edit the `.env` file in the project root:

```bash
# Session secret (change in production!)
SESSION_SECRET=your-secure-random-string-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### Port Configuration

To change the port from 3000 to something else:

1. Edit `docker-compose.yml`:
   ```yaml
   ports:
     - "8080:3001"  # Change 3000 to 8080 (or your preferred port)
   ```

2. Update the `FRONTEND_URL` in `docker-compose.yml`:
   ```yaml
   environment:
     - FRONTEND_URL=http://localhost:8080
   ```

3. Rebuild and restart:
   ```bash
   make build
   make run
   ```

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Build Docker image
      run: docker-compose build

    - name: Save Docker image
      run: docker save barback-system:latest | gzip > barback.tar.gz

    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: docker-image
        path: barback.tar.gz

  deploy:
    needs: build
    runs-on: ubuntu-latest

    steps:
    - name: Download artifact
      uses: actions/download-artifact@v3
      with:
        name: docker-image

    - name: Load Docker image
      run: docker load < barback.tar.gz

    - name: Deploy to server
      run: |
        # Add your deployment commands here
        # e.g., SSH to server and run docker commands
```

### Docker Registry Deployment

```bash
# Tag the image
docker tag barback-system:latest your-registry/barback:latest

# Push to registry
docker push your-registry/barback:latest

# On production server
docker pull your-registry/barback:latest
docker-compose up -d
```

### Manual Deployment

1. **Export the image:**
   ```bash
   make export
   ```
   This creates `barback-system-1.0.0.tar.gz`

2. **Transfer to server:**
   ```bash
   scp barback-system-1.0.0.tar.gz user@server:/path/
   ```

3. **On the server:**
   ```bash
   # Load the image
   docker load < barback-system-1.0.0.tar.gz

   # Run the container
   docker run -d \
     -p 3000:3001 \
     -v barback-data:/app/data \
     -v barback-backups:/app/backups \
     -e SESSION_SECRET=your-secure-secret \
     barback-system:latest
   ```

## Data Persistence

User data is stored in Docker volumes:

- `user-data` - User accounts and credentials
- `backup-data` - Backup files
- `backup-logs` - Application logs

### Backup User Data

```bash
# Backup the user data volume
docker run --rm \
  -v barback_user-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/user-data-backup.tar.gz -C /data .
```

### Restore User Data

```bash
# Restore the user data volume
docker run --rm \
  -v barback_user-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/user-data-backup.tar.gz -C /data
```

## Production Checklist

Before deploying to production:

- [ ] Change `SESSION_SECRET` to a strong random value
- [ ] Change default admin password
- [ ] Set up HTTPS/TLS (use a reverse proxy like nginx)
- [ ] Configure firewall rules
- [ ] Set up automated backups of Docker volumes
- [ ] Configure Google OAuth (if using SSO)
- [ ] Set up monitoring and logging
- [ ] Test backup and restore procedures

## Security Best Practices

1. **Use HTTPS** - Deploy behind a reverse proxy with SSL
2. **Strong Session Secret** - Generate with: `openssl rand -base64 32`
3. **Regular Updates** - Keep dependencies updated
4. **Backup Data** - Regularly backup the user-data volume
5. **Firewall** - Limit access to port 3000
6. **Change Defaults** - Change admin password immediately

## Reverse Proxy Example (nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Troubleshooting

### Container won't start

```bash
# Check logs
make logs

# Check container status
docker-compose ps

# Rebuild from scratch
make clean
make build
make run
```

### Login not working

1. Check that container is running: `docker-compose ps`
2. Check logs: `make logs`
3. Verify port 3000 is accessible: `curl http://localhost:3000/health`
4. Try default credentials: `admin` / `password`

### Cannot access from browser

- Verify port 3000 is not blocked by firewall
- Check that you're using `http://localhost:3000` not `http://localhost:3001`
- Check browser console for errors

### Data persistence issues

- Verify volumes are created: `docker volume ls`
- Check volume mounts in container: `docker inspect barback-system`

## Support

For issues and questions:
- Check the logs: `make logs`
- Review the [Authentication Guide](./AUTHENTICATION.md)
- Check the main [README](../README.md)
