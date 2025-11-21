# Authentication System

## Overview

The barBack system now includes a complete authentication system with:
- Username/password login
- Google SSO (OAuth 2.0)
- User management
- Session-based authentication
- Default admin account

## Default Credentials

**Username:** `admin`
**Password:** `password`

**Important:** You should change the admin password after first login through the user management interface.

## Features

### 1. Login Page
- Clean, modern login interface
- Username/password authentication
- Google Sign-In button
- Error handling and feedback

### 2. User Management
- Add new users with username, password, and optional email
- Edit existing users (password and email)
- Delete users (except admin)
- View all users with creation dates

### 3. Session Management
- Secure session-based authentication
- 24-hour session expiration
- Logout functionality on all pages

### 4. Protected Routes
All API endpoints are now protected and require authentication:
- `/api/connect` - SSH connection management
- `/api/backup/*` - Backup operations
- `/api/restore/*` - Restore operations
- `/api/users` - User management (requires admin login)

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory (copy from `.env.example`):

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Session Secret (CHANGE THIS IN PRODUCTION!)
SESSION_SECRET=your-secure-random-secret-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### Setting Up Google SSO (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 credentials
5. Set the application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

## Usage

### Starting the System

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

### First-Time Setup

1. Log in with the default credentials (`admin` / `password`)
2. Navigate to the Configuration screen
3. Scroll down to "User Management"
4. (Optional) Change the admin password:
   - Click the edit icon next to the admin user
   - Enter a new password
   - Click "Update"
5. Add additional users as needed

### Adding New Users

1. Log in as admin
2. Go to Configuration → User Management
3. Click "Add User"
4. Enter username, password, and optional email
5. Click "Add User"

### Managing Users

- **Edit:** Click the edit icon to change password or email
- **Delete:** Click the delete icon to remove a user (cannot delete admin)

### Logging Out

Click the "Logout" button in the top right corner of any page.

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - Login with username/password
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/check` - Check authentication status
- `GET /api/auth/me` - Get current user info (requires auth)

### User Management Endpoints

- `GET /api/users` - List all users (requires auth)
- `POST /api/users` - Create new user (requires auth)
- `PUT /api/users/:username` - Update user (requires auth)
- `DELETE /api/users/:username` - Delete user (requires auth)

## Data Storage

User data is stored in `backend/data/users.json`. This file is created automatically on first run with the default admin user.

**Backup this file regularly to prevent user data loss.**

## Security Notes

1. **Change the SESSION_SECRET** in production to a strong random string
2. **Change the default admin password** immediately after first login
3. **Use HTTPS** in production environments
4. **Regularly backup** the `users.json` file
5. **Keep dependencies updated** to patch security vulnerabilities

## Troubleshooting

### Cannot log in
- Verify the backend server is running on port 3001
- Check that `users.json` exists in `backend/data/`
- Try the default credentials: `admin` / `password`

### Google SSO not working
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
- Check that the redirect URI is configured in Google Cloud Console
- Ensure the Google+ API is enabled for your project

### Session expires immediately
- Check that `SESSION_SECRET` is set in `.env`
- Verify CORS is configured correctly with `FRONTEND_URL`
- Check browser cookie settings

### "Authentication required" error
- Log in again (session may have expired)
- Clear browser cookies and try again
- Check that credentials are included in API requests

## Development

The authentication system uses:
- **Passport.js** for authentication strategies
- **express-session** for session management
- **bcryptjs** for password hashing
- **React** for the frontend UI

File structure:
```
backend/
  ├── auth/
  │   ├── passport.js      # Passport configuration
  │   ├── userStore.js     # User data management
  │   └── middleware.js    # Auth middleware
  ├── routes/
  │   ├── auth.js          # Auth routes
  │   └── users.js         # User management routes
  └── data/
      └── users.json       # User data storage

frontend/
  └── src/
      ├── components/
      │   ├── LoginPage.jsx       # Login page
      │   └── UserManagement.jsx  # User management UI
      └── App.jsx          # Main app with auth integration
```
