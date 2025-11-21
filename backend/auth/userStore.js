import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../data/users.json');

class UserStore {
  constructor() {
    this.users = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });

      try {
        const data = await fs.readFile(USERS_FILE, 'utf-8');
        const users = JSON.parse(data);
        users.forEach(user => {
          this.users.set(user.username, user);
        });
      } catch (error) {
        await this.createDefaultAdmin();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing user store:', error);
      throw error;
    }
  }

  async createDefaultAdmin() {
    const hashedPassword = await bcrypt.hash('password', 10);
    const adminUser = {
      id: '1',
      username: 'admin',
      password: hashedPassword,
      email: '',
      createdAt: new Date().toISOString()
    };

    this.users.set('admin', adminUser);
    await this.save();
  }

  async save() {
    try {
      const usersArray = Array.from(this.users.values());
      await fs.writeFile(USERS_FILE, JSON.stringify(usersArray, null, 2));
    } catch (error) {
      console.error('Error saving users:', error);
      throw error;
    }
  }

  async findByUsername(username) {
    if (!this.initialized) await this.initialize();
    return this.users.get(username);
  }

  async findById(id) {
    if (!this.initialized) await this.initialize();
    return Array.from(this.users.values()).find(user => user.id === id);
  }

  async validatePassword(username, password) {
    const user = await this.findByUsername(username);
    if (!user) return false;
    return await bcrypt.compare(password, user.password);
  }

  async createUser(username, password, email = '') {
    if (!this.initialized) await this.initialize();

    if (this.users.has(username)) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      email,
      createdAt: new Date().toISOString()
    };

    this.users.set(username, newUser);
    await this.save();

    return { id: newUser.id, username: newUser.username, email: newUser.email };
  }

  async updateUser(username, updates) {
    if (!this.initialized) await this.initialize();

    const user = this.users.get(username);
    if (!user) {
      throw new Error('User not found');
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = { ...user, ...updates };
    this.users.set(username, updatedUser);
    await this.save();

    return { id: updatedUser.id, username: updatedUser.username, email: updatedUser.email };
  }

  async deleteUser(username) {
    if (!this.initialized) await this.initialize();

    if (username === 'admin') {
      throw new Error('Cannot delete admin user');
    }

    const deleted = this.users.delete(username);
    if (deleted) {
      await this.save();
    }
    return deleted;
  }

  async listUsers() {
    if (!this.initialized) await this.initialize();

    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }));
  }

  async findOrCreateGoogleUser(profile) {
    if (!this.initialized) await this.initialize();

    const googleId = `google_${profile.id}`;
    let user = this.users.get(googleId);

    if (!user) {
      user = {
        id: Date.now().toString(),
        username: googleId,
        email: profile.emails?.[0]?.value || '',
        displayName: profile.displayName,
        provider: 'google',
        googleId: profile.id,
        createdAt: new Date().toISOString()
      };

      this.users.set(googleId, user);
      await this.save();
    }

    return user;
  }
}

export default new UserStore();
