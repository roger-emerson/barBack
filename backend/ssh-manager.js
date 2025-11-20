import { Client } from 'ssh2';
import { EventEmitter } from 'events';
import logger from './utils/logger.js';

export default class SSHManager extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.client = new Client();
    this.connected = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 30000);

      this.client
        .on('ready', () => {
          clearTimeout(timeout);
          this.connected = true;
          logger.info(`SSH connected to ${this.config.host}`);
          resolve();
        })
        .on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        })
        .connect(this.config);
    });
  }

  async execCommand(command) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        return reject(new Error('Not connected'));
      }

      this.client.exec(command, (err, stream) => {
        if (err) return reject(err);

        let stdout = '';
        let stderr = '';

        stream
          .on('close', (code) => {
            if (code !== 0) {
              reject(new Error(stderr || `Command failed with code ${code}`));
            } else {
              resolve(stdout);
            }
          })
          .on('data', (data) => {
            stdout += data.toString();
          })
          .stderr.on('data', (data) => {
            stderr += data.toString();
          });
      });
    });
  }

  async getSystemInfo() {
    try {
      const [hostname, osRelease, uptime, memInfo, diskUsage] = await Promise.all([
        this.execCommand('hostname').catch(() => 'Unknown'),
        this.execCommand('cat /etc/redhat-release').catch(() => 'Unknown'),
        this.execCommand('uptime -p').catch(() => 'Unknown'),
        this.execCommand('free -h | grep Mem').catch(() => 'Unknown'),
        this.execCommand('df -h /').catch(() => 'Unknown')
      ]);

      return {
        hostname: hostname.trim(),
        os: osRelease.trim(),
        uptime: uptime.trim(),
        memory: memInfo.trim(),
        disk: diskUsage.trim()
      };
    } catch (error) {
      logger.error('Failed to get system info:', error.message);
      throw error;
    }
  }

  async listBackups() {
    try {
      const output = await this.execCommand('ls -lh /tmp/backup-*.tar.gz 2>/dev/null || echo ""');

      if (!output.trim()) {
        return [];
      }

      const backups = output.trim().split('\n').map(line => {
        const parts = line.split(/\s+/);
        const filename = parts[parts.length - 1];
        const size = parts[4];
        const date = `${parts[5]} ${parts[6]} ${parts[7]}`;

        return {
          id: filename.split('/').pop(),
          name: filename.split('/').pop(),
          size,
          date,
          path: filename
        };
      });

      return backups;
    } catch (error) {
      logger.error('Failed to list backups:', error.message);
      return [];
    }
  }

  async disconnect() {
    try {
      if (this.connected) {
        this.client.end();
        this.connected = false;
        logger.info('SSH connection closed');
      }
    } catch (error) {
      logger.error('Error disconnecting:', error.message);
      throw error;
    }
  }
}
