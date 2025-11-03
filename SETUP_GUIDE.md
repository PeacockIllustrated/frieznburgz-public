# Setup Guide - Environment Variables

## Creating .env file

Since `.env` files are git-ignored for security, you need to create your own `.env` file from the template.

### Step 1: Copy the example file

Create a new file named `.env` in the root directory. You can use this template:

```bash
# Firebase Configuration
# Get these values from Firebase Console > Project Settings > General > Your apps
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Application Secrets
# Staff Training Gatekeeper Password (for registration protection)
VITE_GATEKEEPER_PASSWORD=your_gatekeeper_password_here

# Admin User Defaults (used by import-admin.js)
# These can be overridden when running the import function
VITE_DEFAULT_ADMIN_NAME=Admin User
VITE_DEFAULT_ADMIN_EMAIL=admin@example.com
VITE_DEFAULT_ADMIN_PHONE=00000000000

# Development/Production Mode
NODE_ENV=development
```

### Step 2: Fill in your values

Replace all placeholder values with your actual configuration:

1. **Firebase Configuration**: Get from Firebase Console > Project Settings
2. **Gatekeeper Password**: Set a secure password for staff registration
3. **Admin Defaults**: Update with your admin user information

### Step 3: Load environment variables

For vanilla JavaScript projects, environment variables need to be injected at runtime. Options:

#### Option A: Using a build tool (Recommended)
If using Vite or similar build tool, environment variables are automatically available via `import.meta.env.VITE_*`.

#### Option B: Manual injection
For vanilla JS without a build tool, inject environment variables via a script tag in your HTML:

```html
<script type="application/json" data-env>
{
  "VITE_FIREBASE_API_KEY": "your_key",
  "VITE_FIREBASE_AUTH_DOMAIN": "your_domain",
  ...
}
</script>
<script src="utils/env-loader.js"></script>
```

The `env-loader.js` utility will parse this and make it available as `window.env`.

#### Option C: Firebase Remote Config (Production)
For production, consider using Firebase Remote Config to store non-sensitive configuration.

## Important Notes

- **Never commit `.env` file** - It's already in `.gitignore`
- **Use different values** for development and production
- **Rotate secrets regularly** for security
- **Gatekeeper password** should be strong and changed periodically

## Verification

After setting up, verify environment variables are loaded:

```javascript
// In browser console
console.log(window.env?.VITE_FIREBASE_API_KEY); // Should show your API key (not undefined)
```

