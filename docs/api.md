# API Reference

## REST Endpoints

### POST /api/connect
Connect to RHEL server via SSH

**Request Body:**
```json
{
  "host": "192.168.1.100",
  "port": 22,
  "username": "admin",
  "password": "secret"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "192.168.1.100-1234567890",
  "systemInfo": { ... }
}
```

### POST /api/backup/start
Start backup operation

**Request Body:**
```json
{
  "sessionId": "session-id",
  "backupPath": "/backup",
  "excludePaths": "/proc,/sys,/dev"
}
```

### GET /api/backups/:sessionId
Get backup history

### POST /api/restore/start
Start restore operation

## WebSocket Events

### backup-progress
Real-time backup progress updates

### backup-complete
Backup completion notification

### restore-progress
Real-time restore progress updates
