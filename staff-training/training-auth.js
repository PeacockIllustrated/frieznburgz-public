// --- staff-training/training-auth.js (Final Update) ---
// Handles user authentication for the training portal and controls content visibility.

import { auth } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginPrompt = document.getElementById('login-prompt');
    const mainContent = document.getElementById('main-content-wrapper');
    const loadingSpinner = document.getElementById('loading-spinner');

    auth.onAuthStateChanged(user => {
        // Hide the loading spinner once auth state is determined
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }

        if (user) {
            // User is signed in.
            console.log('User authenticated:', user.uid);
            
            // Make the main content visible and hide the login prompt.
            if (mainContent) mainContent.style.display = 'block';
            if (loginPrompt) loginPrompt.style.display = 'none';
            
            // Dispatch a custom event to notify other scripts that the user is ready.
            document.dispatchEvent(new CustomEvent('userAuthenticated', {
                detail: { user }
            }));

        } else {
            // User is signed out.
            console.log('No user authenticated. Redirecting to training login page.');
            
            // *** THE ONLY CHANGE IS HERE ***
            // Redirect the user to the new dedicated training login page.
            window.location.href = 'login.html'; 
        }
    });
});
