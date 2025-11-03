// --- utils/env.js ---
// Environment variable management utility

/**
 * Gets an environment variable value
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} Environment variable value
 */
export function getEnv(key, defaultValue = '') {
    // Check import.meta.env first (for Vite/build tools)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key];
    }
    
    // Fallback to window.env (for runtime injection)
    if (typeof window !== 'undefined' && window.env && window.env[key]) {
        return window.env[key];
    }
    
    // Fallback to process.env (for Node.js environments)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    
    return defaultValue;
}

/**
 * Gets Firebase configuration from environment variables
 * @returns {object} Firebase configuration object
 */
export function getFirebaseConfig() {
    return {
        apiKey: getEnv('VITE_FIREBASE_API_KEY', ''),
        authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', ''),
        projectId: getEnv('VITE_FIREBASE_PROJECT_ID', ''),
        storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', ''),
        messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', ''),
        appId: getEnv('VITE_FIREBASE_APP_ID', ''),
        measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', '')
    };
}

/**
 * Gets the gatekeeper password from environment variables
 * @returns {string} Gatekeeper password
 */
export function getGatekeeperPassword() {
    return getEnv('VITE_GATEKEEPER_PASSWORD', '');
}

/**
 * Gets default admin user configuration
 * @returns {object} Admin user defaults
 */
export function getDefaultAdminConfig() {
    return {
        name: getEnv('VITE_DEFAULT_ADMIN_NAME', 'Admin User'),
        email: getEnv('VITE_DEFAULT_ADMIN_EMAIL', 'admin@example.com'),
        phone: getEnv('VITE_DEFAULT_ADMIN_PHONE', '00000000000')
    };
}

/**
 * Checks if running in development mode
 * @returns {boolean} True if in development mode
 */
export function isDevelopment() {
    return getEnv('NODE_ENV', 'development') === 'development' || 
           getEnv('VITE_NODE_ENV', 'development') === 'development';
}

/**
 * Checks if running in production mode
 * @returns {boolean} True if in production mode
 */
export function isProduction() {
    return getEnv('NODE_ENV', 'development') === 'production' || 
           getEnv('VITE_NODE_ENV', 'development') === 'production';
}

