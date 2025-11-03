// --- utils/env-loader.js ---
// Loads environment variables into window.env for use in vanilla JavaScript
// This script should be included in HTML files that need environment variables

(function() {
    'use strict';
    
    // Create window.env if it doesn't exist
    if (!window.env) {
        window.env = {};
    }
    
    // Function to parse .env file content (for development)
    function parseEnvFile(content) {
        const env = {};
        const lines = content.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            // Skip empty lines and comments
            if (!line || line.startsWith('#')) {
                return;
            }
            
            // Parse KEY=VALUE format
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                
                // Remove quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                
                env[key] = value;
            }
        });
        
        return env;
    }
    
    // Try to load from a script tag with data-env attribute
    // This allows injecting env vars at build/deploy time
    const envScript = document.querySelector('script[data-env]');
    if (envScript) {
        try {
            const envData = JSON.parse(envScript.textContent || '{}');
            Object.assign(window.env, envData);
        } catch (e) {
            console.warn('Failed to parse environment data from script tag:', e);
        }
    }
    
    // For production, environment variables should be injected via a script tag:
    // <script type="application/json" data-env>{"VITE_FIREBASE_API_KEY":"..."}</script>
    
    // Export for module usage
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.env;
    }
})();

