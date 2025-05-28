// --- auth.js ---
// Handles user authentication UI and logic.

import { auth } from './firebase.js'; // Import Firebase Auth instance
import { showPage, hideAllPages } from './ui.js'; // Placeholder for ui.js functions (will be created next)

// --- DOM Elements ---
const authContainer = document.getElementById('authContainer');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const authMessage = document.getElementById('authMessage');

/**
 * Initializes authentication-related event listeners.
 */
export function initAuth() {
    loginBtn.addEventListener('click', handleEmailLogin);
    googleLoginBtn.addEventListener('click', handleGoogleLogin);
    console.log('Auth event listeners initialized.');
}

/**
 * Handles email/password login.
 */
async function handleEmailLogin() {
    const email = loginEmail.value;
    const password = loginPassword.value;

    if (!email || !password) {
        authMessage.textContent = 'Please enter both email and password.';
        return;
    }

    try {
        await auth.signInWithEmailAndPassword(email, password);
        authMessage.textContent = ''; // Clear message on success
        console.log('Email/Password login successful.');
    } catch (error) {
        authMessage.textContent = `Login failed: ${error.message}`;
        console.error('Email/Password Login error:', error);
    }
}

/**
 * Handles Google Sign-In.
 */
async function handleGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
        authMessage.textContent = ''; // Clear message on success
        console.log('Google Sign-in successful.');
    } catch (error) {
        authMessage.textContent = `Google Sign-in failed: ${error.message}`;
        console.error('Google Sign-in error:', error);
    }
}

/**
 * Displays the authentication container.
 */
export function showAuth() {
    hideAllPages(); // Ensure other main sections are hidden
    authContainer.style.display = 'flex'; // Use flex for centering
    // Clear inputs and messages when showing auth screen
    loginEmail.value = '';
    loginPassword.value = '';
    authMessage.textContent = '';
    console.log('Authentication screen shown.');
}

/**
 * Hides the authentication container.
 */
export function hideAuth() {
    authContainer.style.display = 'none';
    console.log('Authentication screen hidden.');
}
