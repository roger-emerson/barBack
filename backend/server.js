import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import session from 'express-session';
import SSHManager from './ssh-manager.js';
import BackupManager from './backup-manager.js';
import logger from './utils/logger.js';
import passport from './auth/passport.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import userStore from './auth/userStore.js';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'barback-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

await userStore.initialize();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const sshManagers = new Map();
const backupManagers = new Map();

wss.on('connection', (ws) => {
  logger.info('Client connected via WebSocket');
  ws.on('close', () => logger.info('Client disconnected'));
});

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

const requireAuthMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

app.post('/api/connect', requireAuthMiddleware, async (req, res) => {
  try {
    const { host, port, username, password, privateKey } = req.body;
    const sessionId = `${host}-${Date.now()}`;
    
    const sshManager = new SSHManager({
      host,
      port: parseInt(port) || 22,
      username,
      password,
      privateKey
    });
    
    await sshManager.connect();
    sshManagers.set(sessionId, sshManager);
    
    const systemInfo = await sshManager.getSystemInfo();
    
    res.json({ success: true, sessionId, systemInfo });
  } catch (error) {
    logger.error('Connection error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/system-info/:sessionId', requireAuthMiddleware, async (req, res) => {
  try {
    const sshManager = sshManagers.get(req.params.sessionId);
    if (!sshManager) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const systemInfo = await sshManager.getSystemInfo();
    res.json(systemInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/backup/start', requireAuthMiddleware, async (req, res) => {
  try {
    const { sessionId, backupPath, excludePaths } = req.body;
    const sshManager = sshManagers.get(sessionId);
    
    if (!sshManager) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const backupManager = new BackupManager(sshManager, {
      backupPath,
      excludePaths: excludePaths.split(',').map(p => p.trim())
    });
    
    backupManagers.set(sessionId, backupManager);
    
    backupManager.on('progress', (data) => {
      broadcast({ type: 'backup-progress', sessionId, data });
    });
    
    backupManager.on('complete', (data) => {
      broadcast({ type: 'backup-complete', sessionId, data });
    });
    
    backupManager.on('error', (error) => {
      broadcast({ type: 'backup-error', sessionId, error: error.message });
    });
    
    backupManager.startBackup().catch(error => {
      logger.error('Backup failed:', error.message);
    });
    
    res.json({ success: true, message: 'Backup started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/backup/stop/:sessionId', requireAuthMiddleware, async (req, res) => {
  try {
    const backupManager = backupManagers.get(req.params.sessionId);
    if (backupManager) {
      await backupManager.stopBackup();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Backup not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/backups/:sessionId', requireAuthMiddleware, async (req, res) => {
  try {
    const sshManager = sshManagers.get(req.params.sessionId);
    if (!sshManager) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const backups = await sshManager.listBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/restore/start', requireAuthMiddleware, async (req, res) => {
  try {
    const { sessionId, backupId } = req.body;
    const sshManager = sshManagers.get(sessionId);
    
    if (!sshManager) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const backupManager = backupManagers.get(sessionId) || 
      new BackupManager(sshManager, {});
    
    backupManager.on('restore-progress', (data) => {
      broadcast({ type: 'restore-progress', sessionId, data });
    });
    
    backupManager.on('restore-complete', (data) => {
      broadcast({ type: 'restore-complete', sessionId, data });
    });
    
    await backupManager.startRestore(backupId);
    
    res.json({ success: true, message: 'Restore started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/disconnect/:sessionId', requireAuthMiddleware, async (req, res) => {
  try {
    const sshManager = sshManagers.get(req.params.sessionId);
    if (sshManager) {
      await sshManager.disconnect();
      sshManagers.delete(req.params.sessionId);
      backupManagers.delete(req.params.sessionId);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully');
  server.close(() => process.exit(0));
});

export default app;
