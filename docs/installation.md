# Installation Guide

## Prerequisites

- Docker 20.10 or higher
- Docker Compose 2.0 or higher
- 2GB RAM minimum
- RHEL 8/9 target server with SSH access

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/barBack.git
cd barBack
```

### 2. Build the Container
```bash
make build
```

### 3. Start the Application
```bash
make run
```

### 4. Access the Application
Open your browser to: http://localhost:3000

## Setting Up Test Environment

### UTM (Apple Silicon Macs)

1. Install UTM from https://mac.getutm.app/
2. Download RHEL ISO
3. Create VM with:
   - 4GB RAM
   - 40GB disk
   - Shared network
4. Install RHEL
5. Run setup script on VM:
```bash
curl -O https://raw.githubusercontent.com/yourusername/barBack/main/scripts/setup-vm.sh
bash setup-vm.sh
```

## Troubleshooting

### Container won't start
```bash
docker-compose logs
```

### Can't connect to RHEL server
```bash
# Test SSH connection
ssh user@server-ip
```
