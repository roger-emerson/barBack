import { EventEmitter } from 'events';
import logger from './utils/logger.js';

export default class BackupManager extends EventEmitter {
  constructor(sshManager, config) {
    super();
    this.sshManager = sshManager;
    this.config = config;
    this.isRunning = false;
    this.currentProcess = null;
  }

  async startBackup() {
    if (this.isRunning) {
      throw new Error('Backup already in progress');
    }

    this.isRunning = true;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = this.config.backupPath || '/';
    const excludePaths = this.config.excludePaths || [];
    const backupName = `backup-${timestamp}.tar.gz`;
    const backupDest = `/tmp/${backupName}`;

    try {
      logger.info(`Starting backup of ${backupPath}`);
      this.emit('progress', { status: 'starting', path: backupPath });

      // Build tar command with exclusions
      const excludeArgs = excludePaths
        .map(path => `--exclude='${path}'`)
        .join(' ');

      const tarCommand = `tar -czf ${backupDest} ${excludeArgs} -C / ${backupPath.replace(/^\//, '')} 2>&1`;

      // Execute backup
      this.emit('progress', { status: 'running', message: 'Creating backup archive...' });
      await this.sshManager.execCommand(tarCommand);

      // Get file size
      const sizeOutput = await this.sshManager.execCommand(`du -h ${backupDest} | cut -f1`);
      const size = sizeOutput.trim();

      this.emit('complete', {
        backupName,
        path: backupDest,
        size,
        timestamp: new Date().toISOString()
      });

      logger.info(`Backup completed: ${backupName}`);
    } catch (error) {
      logger.error('Backup failed:', error.message);
      this.emit('error', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async stopBackup() {
    if (!this.isRunning) {
      return;
    }

    logger.info('Stopping backup...');

    try {
      // Kill any running tar processes
      await this.sshManager.execCommand('pkill -f "tar -czf"').catch(() => {
        // Ignore errors if no process found
      });

      this.isRunning = false;
      this.emit('progress', { status: 'stopped' });
    } catch (error) {
      logger.error('Error stopping backup:', error.message);
      throw error;
    }
  }

  async startRestore(backupId) {
    try {
      logger.info(`Starting restore from backup: ${backupId}`);
      this.emit('restore-progress', { status: 'starting', backupId });

      // Extract backup
      const extractCommand = `tar -xzf /tmp/${backupId} -C /`;

      this.emit('restore-progress', { status: 'extracting', message: 'Extracting backup...' });
      await this.sshManager.execCommand(extractCommand);

      this.emit('restore-complete', {
        backupId,
        timestamp: new Date().toISOString()
      });

      logger.info('Restore completed');
    } catch (error) {
      logger.error('Restore failed:', error.message);
      this.emit('error', error);
      throw error;
    }
  }
}
