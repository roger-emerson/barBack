# Google SSO Setup Guide

## Overview

Google SSO (Single Sign-On) is **optional** and disabled by default. The "Sign in with Google" button will only appear on the login page when properly configured.

## Why You Saw the Error

The error **"Error 401: invalid_client"** occurs when:

1. Google OAuth credentials are not configured (default state)
2. Invalid or placeholder credentials are being used
3. The redirect URI doesn't match what's configured in Google Cloud Console

## How the Fix Works

The system now:
- ✅ Only registers Google OAuth when valid credentials are detected
- ✅ Hides the Google Sign-In button when not configured
- ✅ Returns a helpful error if someone tries to use the unconfigured endpoint
- ✅ Works perfectly without Google SSO (username/password only)

## Current Behavior

**Without Configuration (Default):**
- Login page shows only username/password form
- No Google button visible
- No errors occur

**With Configuration:**
- Login page shows both username/password AND Google button
- Google SSO works normally

## How to Enable Google SSO

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or People API)
4. Navigate to **APIs & Services → Credentials**
5. Click **Create Credentials → OAuth 2.0 Client ID**
6. Choose **Web application**
7. Add these **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/google/callback` (for local testing)
   - `https://yourdomain.com/api/auth/google/callback` (for production)

8. Copy your **Client ID** and **Client Secret**

### Step 2: Configure Your Application

Edit the `.env` file in your project root:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id-from-google
GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-google
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

**Important:** Don't use the placeholder values like `your-google-client-id-here`!

### Step 3: Rebuild and Restart

```bash
make build
make run
```

### Step 4: Test

1. Open http://localhost:3000
2. You should now see the "Sign in with Google" button
3. Click it to test Google authentication

## Verification Checklist

To verify Google SSO is properly configured:

- [ ] `.env` file has real Google credentials (not placeholders)
- [ ] Redirect URI in Google Cloud matches `GOOGLE_CALLBACK_URL`
- [ ] Application has been rebuilt with `make build`
- [ ] "Sign in with Google" button appears on login page
- [ ] Clicking the button redirects to Google's consent screen

## Troubleshooting

### Google button doesn't appear

**Cause:** Google credentials not configured or invalid

**Solution:**
1. Check `.env` file has actual credentials
2. Ensure credentials don't contain placeholder text
3. Rebuild: `make build && make run`

### Still getting "Error 401: invalid_client"

**Cause:** Credentials don't match Google Cloud Console

**Solution:**
1. Verify Client ID and Secret are correct (copy/paste carefully)
2. Check for extra spaces or newlines in `.env` values
3. Ensure the project in Google Cloud Console has OAuth configured

### "Redirect URI mismatch" error

**Cause:** Callback URL doesn't match Google Cloud Console configuration

**Solution:**
1. In Google Cloud Console, add: `http://localhost:3000/api/auth/google/callback`
2. Make sure `GOOGLE_CALLBACK_URL` in `.env` matches exactly
3. For production, use your actual domain with HTTPS

### Google authentication works but creates duplicate users

**Expected behavior:** Each Google account creates a separate user in the system with username format `google_<google-id>`

## Production Deployment

For production with HTTPS:

```bash
# .env for production
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
HTTPS=true
```

Remember to:
1. Use HTTPS (not HTTP) for the callback URL
2. Add the HTTPS callback URL to Google Cloud Console
3. Set `HTTPS=true` environment variable
4. Use a strong `SESSION_SECRET`

## Security Notes

1. **Never commit credentials** - The `.env` file should be in `.gitignore`
2. **Use environment variables** - In production, use your platform's secret management
3. **Restrict OAuth scopes** - Only request `profile` and `email` (already configured)
4. **Keep secrets secure** - Treat Client Secret like a password

## Disabling Google SSO

To disable Google SSO:

1. Comment out or remove Google credentials from `.env`:
   ```bash
   # GOOGLE_CLIENT_ID=...
   # GOOGLE_CLIENT_SECRET=...
   ```

2. Rebuild:
   ```bash
   make build
   make run
   ```

The Google button will disappear and username/password auth continues working normally.

## API Endpoint

You can check if Google auth is enabled programmatically:

```bash
curl http://localhost:3000/api/auth/config
```

Response:
```json
{
  "googleAuthEnabled": false
}
```

This endpoint is used by the frontend to show/hide the Google button.
