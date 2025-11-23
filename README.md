# barBack

<div align="center">

![barBack](https://img.shields.io/badge/barBack-RHEL%20Backup-red?style=for-the-badge&logo=redhat)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)

Enterprise-grade backup and restore solution for Red Hat Enterprise Linux systems with real-time monitoring and progress tracking.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#️-architecture)

</div>

---

## 🚀 Features

- **🔐 Authentication System** - Secure login with username/password + optional Google SSO
- **👥 User Management** - Create and manage multiple users with role-based access
- **🔒 Secure SSH Connection** - Industry-standard SSH2 protocol for secure remote access
- **📊 Real-time Dashboard** - Live monitoring of backup progress and system metrics
- **⚡ WebSocket Updates** - Instant progress updates without polling
- **💾 Full System Backup** - Complete RHEL system backup with compression
- **🔄 Easy Restore** - One-click restore from any backup point
- **🐳 Docker Ready** - Containerized deployment with single-command setup
- **📈 Progress Tracking** - Detailed file count and byte-level progress
- **🎯 Exclusion Patterns** - Configurable paths to exclude from backup
- **📜 Backup History** - Complete audit trail of all backup operations
- **🖥️ System Monitoring** - CPU, memory, and disk usage tracking

## 📋 Prerequisites

- Docker (20.10+) and Docker Compose (2.0+)
- RHEL 8/9 target server with SSH access
- macOS (or Linux/Windows with Docker Desktop)
- 2GB RAM minimum for container
- Network connectivity to target server

## 🏃 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/barBack.git
cd barBack
```

### 2. Build and Run
```bash
# Using Make (recommended)
make build
make run

# Or using Docker Compose directly
docker-compose build
docker-compose up -d
```

### 3. Access the Application
```bash
open http://localhost:3000
```

### 4. Login
**Default Credentials:**
- Username: `admin`
- Password: `password`

⚠️ **IMPORTANT:** Change the default password immediately after first login!

### 5. Connect to Your RHEL Server
- Click "Configure" to go to settings
- Enter your server's IP address
- Provide SSH credentials (username/password or key)
- Click "Connect to Server"
- Start your first backup!

## 🎯 Usage

### First-Time Setup
1. **Login** with default credentials (`admin` / `password`)
2. **Change admin password** (Configure → User Management → Edit admin)
3. **(Optional) Add more users** (Configure → User Management → Add User)
4. **(Optional) Enable Google SSO** - See [Google SSO Setup Guide](docs/GOOGLE_SSO_SETUP.md)

### Starting a Backup
1. Login to the application
2. Click "Configure" to enter server details
3. Connect to your RHEL server
4. Configure backup destination path (default: `/backup`)
5. Set exclusion paths (e.g., `/proc,/sys,/dev`)
6. Click "Start Backup"
7. Monitor real-time progress on the dashboard

### Restoring from Backup
1. View backup history on the dashboard
2. Select a backup point
3. Click "Restore"
4. Confirm the restoration
5. Monitor restore progress

### Managing Users
1. Login as admin
2. Go to "Configure" → User Management
3. Add, edit, or delete users as needed
4. All users can access backups once authenticated

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────────┐
│   Browser   │ ◄─────► │  Docker Container    │ ◄─────► │ RHEL Server │
│  (Client)   │  HTTP/  │   ┌──────────────┐   │   SSH   │   Target    │
│             │   WS    │   │  Frontend    │   │         │             │
└─────────────┘         │   │  (React)     │   │         └─────────────┘
                        │   └──────────────┘   │
                        │   ┌──────────────┐   │
                        │   │  Backend     │   │
                        │   │  (Express)   │   │
                        │   │  + Auth      │   │
                        │   │  + Sessions  │   │
                        │   └──────────────┘   │
                        │   ┌──────────────┐   │
                        │   │  User Data   │   │
                        │   │  (Volume)    │   │
                        │   └──────────────┘   │
                        └──────────────────────┘
```

### Key Components

- **Frontend (React)**: Modern UI with real-time updates
- **Backend (Express)**: REST API + WebSocket server
- **Authentication**: Session-based auth with passport.js
- **User Storage**: JSON file-based user database (Docker volume)
- **SSH Client**: node-ssh for remote RHEL connections
- **Data Persistence**: Docker volumes for user data and backups

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment and CI/CD

### Authentication & Security
- **[Authentication Guide](docs/AUTHENTICATION.md)** - User management and security
- **[Google SSO Setup](docs/GOOGLE_SSO_SETUP.md)** - Enable Google Single Sign-On

### Reference
- [Installation Guide](docs/installation.md) *(if exists)*
- [Configuration](docs/configuration.md) *(if exists)*
- [API Reference](docs/api.md) *(if exists)*
- [Troubleshooting](docs/troubleshooting.md) *(if exists)*

## 🔧 Development

### Setup Development Environment
```bash
# Install dependencies
make install

# Run in development mode (hot-reload)
make dev
# Backend: http://localhost:3001
# Frontend: http://localhost:5173

# Run tests
make test
```

### Development vs Production

**Development Mode (`make dev`):**
- Frontend and backend run separately
- Hot-reload enabled for both
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

**Production Mode (`make build && make run`):**
- Single Docker container
- Optimized build
- Everything on http://localhost:3000
- Frontend served as static files from backend

## 📦 Building for Production

### Standard Deployment
```bash
# Build and run
make build
make run

# Application available at http://localhost:3000
```

### Export for Transfer
```bash
# Export Docker image to file
make export

# Creates: barback-system-1.0.0.tar.gz
# Transfer to server and load with: docker load < barback-system-1.0.0.tar.gz
```

### CI/CD Integration
See [Deployment Guide](docs/DEPLOYMENT.md) for:
- GitHub Actions workflows
- Docker registry deployment
- Automated builds
- Production checklist

## 🔐 Security Considerations

### Authentication & Sessions
- **Session-based authentication** with secure HTTP-only cookies
- **Password hashing** using bcrypt (10 rounds)
- **Default credentials** must be changed on first login
- **Google SSO** optional, disabled by default
- **24-hour session expiration** for security

### Data Protection
- **User data persisted** in Docker volumes (encrypted at rest by Docker)
- **SSH credentials never stored** - sessions only
- **All SSH connections** use encrypted tunnels
- **No browser storage** - credentials never touch localStorage
- **Password fields** properly masked in UI

### Best Practices
- ✅ Change default admin password immediately
- ✅ Use strong passwords (min 8 characters)
- ✅ Set custom `SESSION_SECRET` in production
- ✅ Enable HTTPS in production (via reverse proxy)
- ✅ Regularly backup user data volume
- ✅ Keep dependencies updated
- ⚠️ Never commit `.env` with real credentials

See [Authentication Guide](docs/AUTHENTICATION.md) for detailed security information.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🗺️ Roadmap

### ✅ Completed
- [x] User authentication system
- [x] Google SSO integration
- [x] User management interface
- [x] Docker containerization
- [x] Session management

### 🚧 Planned
- [ ] Multi-server support
- [ ] Role-based access control (RBAC)
- [ ] Incremental backups
- [ ] Backup scheduling (cron)
- [ ] Email notifications
- [ ] Backup encryption
- [ ] S3/Cloud storage support
- [ ] Audit logging
- [ ] 2FA/MFA support

## 🐛 Troubleshooting

### Login Issues
- **Default credentials not working?** Make sure you're using `admin` / `password`
- **Session expires on refresh?** This was a bug, fixed in latest version - rebuild with `make build`
- **Can't access on port 3000?** Check if port is already in use: `lsof -ti:3000`

### Google SSO Issues
- **"Error 401: invalid_client"?** Google SSO is not configured - it's optional! See [Google SSO Setup](docs/GOOGLE_SSO_SETUP.md)
- **Google button not appearing?** This is expected when Google SSO is not configured

### Docker Issues
- **Build fails?** Ensure you have Docker 20.10+ and enough disk space
- **Container won't start?** Check logs: `make logs`
- **Port conflicts?** Change port in `docker-compose.yml` from `3000:3001` to another port

### Data Persistence
- **Users disappear after restart?** User data is stored in Docker volume - check: `docker volume ls | grep barback`
- **Need to reset everything?** Run `make clean` (WARNING: deletes all data!)

For more help, see existing documentation or open an issue on GitHub.

---

<div align="center">

Made with ❤️ for DevSecOps

⭐ Star us on GitHub if this helped you!

</div>
