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

- **🔒 Secure SSH Connection** - Industry-standard SSH2 protocol for secure remote access
- **📊 Real-time Dashboard** - Live monitoring of backup progress and system metrics
- **⚡ WebSocket Updates** - Instant progress updates without polling
- **💾 Full System Backup** - Complete RHEL system backup with compression
- **🔄 Easy Restore** - One-click restore from any backup point
- **🐳 Docker Ready** - Containerized deployment for easy setup
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
docker-compose up -d
```

### 3. Access the Application
```bash
open http://localhost:3000
```

### 4. Connect to Your RHEL Server
- Enter your server's IP address
- Provide SSH credentials (username/password or key)
- Click "Connect to Server"
- Start your first backup!

## 🎯 Usage

### Starting a Backup
1. Connect to your RHEL server
2. Configure backup destination path (default: `/backup`)
3. Set exclusion paths (e.g., `/proc,/sys,/dev`)
4. Click "Start Backup"
5. Monitor real-time progress on the dashboard

### Restoring from Backup
1. View backup history
2. Select a backup point
3. Click "Restore"
4. Confirm the restoration
5. Monitor restore progress

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Browser   │ ◄─────► │ Docker Container │ ◄─────► │ RHEL Server │
│  (Client)   │  HTTP/  │   ┌──────────┐   │   SSH   │   Target    │
│             │   WS    │   │ Frontend │   │         │             │
└─────────────┘         │   └──────────┘   │         └─────────────┘
                        │   ┌──────────┐   │
                        │   │ Backend  │   │
                        │   └──────────┘   │
                        └──────────────────┘
```

## 📚 Documentation

- [Installation Guide](docs/installation.md)
- [Configuration](docs/configuration.md)
- [API Reference](docs/api.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🔧 Development

### Setup Development Environment
```bash
# Install dependencies
make install

# Run in development mode
make dev

# Run tests
make test
```

## 📦 Building for Production

### Build Docker Image
```bash
make build
```

### Export Image
```bash
make export
```

## 🔐 Security Considerations

- SSH credentials are never stored persistently
- All connections use encrypted SSH tunnels
- No browser storage APIs used
- Password fields are properly masked
- Session management with unique session IDs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🗺️ Roadmap

- [ ] Multi-server support
- [ ] Incremental backups
- [ ] Backup scheduling (cron)
- [ ] Email notifications
- [ ] Backup encryption
- [ ] S3/Cloud storage support

---

<div align="center">

Made with ❤️ for DevSecOps

⭐ Star us on GitHub if this helped you!

</div>
