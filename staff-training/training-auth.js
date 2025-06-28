// --- staff-training/training-auth.js (Final Simplified Version) ---

import { auth } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // This script should NOT run on login or registration pages.
    if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register-profile.html')) {
        return;
    }
    
    const mainContent = document.getElementById('main-content-wrapper');
    const loadingSpinner = document.getElementById('loading-spinner');

    if(loadingSpinner) loadingSpinner.style.display = 'flex';

    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is logged in, show the content.
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
            document.dispatchEvent(new CustomEvent('userAuthenticated', { detail: { user } }));
        } else {
            // No user is logged in, redirect to the login page.
            console.log('No user session found. Redirecting to login page.');
            window.location.href = 'login.html';
        }
    });
});
