// --- user.js ---
// This module will hold the state of the currently logged-in user.

let currentUser = null;

/**
 * Sets the current user's data.
 * @param {object} userData - The user data, including auth info and firestore profile.
 */
export function setCurrentUser(userData) {
    currentUser = userData;
}

/**
 * Gets the current user's data.
 * @returns {object|null} The current user's data, or null if not set.
 */
export function getCurrentUser() {
    return currentUser;
}

/**
 * Clears the current user's data on logout.
 */
export function clearCurrentUser() {
    currentUser = null;
}
