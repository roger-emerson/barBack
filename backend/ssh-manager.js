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
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
}
