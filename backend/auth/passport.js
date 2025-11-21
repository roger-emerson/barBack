import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userStore from './userStore.js';

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await userStore.findByUsername(username);

      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      const isValid = await userStore.validatePassword(username, password);

      if (!isValid) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      return done(null, {
        id: user.id,
        username: user.username,
        email: user.email
      });
    } catch (error) {
      return done(error);
    }
  }
));

// Only register Google OAuth strategy if credentials are configured
const isGoogleConfigured = process.env.GOOGLE_CLIENT_ID &&
                           process.env.GOOGLE_CLIENT_SECRET &&
                           process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here' &&
                           process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret-here';

if (isGoogleConfigured) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await userStore.findOrCreateGoogleUser(profile);
        return done(null, {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName
        });
      } catch (error) {
        return done(error);
      }
    }
  ));
}

export const googleAuthEnabled = isGoogleConfigured;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userStore.findById(id);
    if (!user) {
      return done(null, false);
    }
    done(null, {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName
    });
  } catch (error) {
    done(error);
  }
});

export default passport;
