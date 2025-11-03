// --- utils/logger.js ---
// Centralized logging utility to replace console.log statements

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

let currentLogLevel = LOG_LEVELS.INFO;

/**
 * Sets the current log level
 * @param {string} level - 'debug', 'info', 'warn', 'error', or 'none'
 */
export function setLogLevel(level) {
    const levelUpper = level.toUpperCase();
    currentLogLevel = LOG_LEVELS[levelUpper] ?? LOG_LEVELS.INFO;
}

/**
 * Gets the current log level
 * @returns {number} Current log level
 */
export function getLogLevel() {
    return currentLogLevel;
}

/**
 * Logs a debug message
 * @param {string} message - Message to log
 * @param {...any} args - Additional arguments
 */
export function debug(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
        console.debug(`[DEBUG] ${message}`, ...args);
    }
}

/**
 * Logs an info message
 * @param {string} message - Message to log
 * @param {...any} args - Additional arguments
 */
export function info(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
        console.info(`[INFO] ${message}`, ...args);
    }
}

/**
 * Logs a warning message
 * @param {string} message - Message to log
 * @param {...any} args - Additional arguments
 */
export function warn(message, ...args) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
        console.warn(`[WARN] ${message}`, ...args);
    }
}

/**
 * Logs an error message
 * @param {string} message - Message to log
 * @param {Error} error - Error object (optional)
 * @param {...any} args - Additional arguments
 */
export function error(message, error = null, ...args) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
        console.error(`[ERROR] ${message}`, error, ...args);
    }
    
    // In production, you might want to send errors to an error tracking service
    if (import.meta.env?.MODE === 'production' && error) {
        // TODO: Integrate with error tracking service (e.g., Sentry)
        // sendErrorToService(error, { message, ...args });
    }
}

/**
 * Logs a message only in development mode
 * @param {string} message - Message to log
 * @param {...any} args - Additional arguments
 */
export function devLog(message, ...args) {
    if (import.meta.env?.MODE === 'development') {
        console.log(`[DEV] ${message}`, ...args);
    }
}

// Set log level based on environment
if (import.meta.env?.MODE === 'production') {
    setLogLevel('warn');
} else {
    setLogLevel('debug');
}

