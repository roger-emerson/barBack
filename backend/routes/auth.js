import express from 'express';
import passport, { googleAuthEnabled } from '../auth/passport.js';
import userStore from '../auth/userStore.js';
import { requireAuth } from '../auth/middleware.js';

const router = express.Router();

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }

    if (!user) {
      return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login error' });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    });
  })(req, res, next);
});

router.get('/google', (req, res, next) => {
  if (!googleAuthEnabled) {
    return res.status(400).json({ error: 'Google authentication is not configured' });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!googleAuthEnabled) {
    return res.redirect('/?error=google-not-configured');
  }
  passport.authenticate('google', { failureRedirect: '/?error=google' })(req, res, next);
}, (req, res) => {
  res.redirect('/?login=success');
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout error' });
    }
    res.json({ success: true });
  });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      displayName: req.user.displayName
    }
  });
});

router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

router.get('/config', (req, res) => {
  res.json({
    googleAuthEnabled
  });
});

export default router;
