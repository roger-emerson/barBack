import express from 'express';
import userStore from '../auth/userStore.js';
import { requireAuth } from '../auth/middleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const users = await userStore.listUsers();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await userStore.createUser(username, password, email);
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { password, email } = req.body;

    const updates = {};
    if (password) updates.password = password;
    if (email !== undefined) updates.email = email;

    const user = await userStore.updateUser(username, updates);
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const deleted = await userStore.deleteUser(username);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
