// --- staff-training/training-auth.js (Final Router Version) ---

import { auth, db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const loadingSpinner = document.getElementById('loading-spinner');
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in. Now check if they have a staff profile.
            try {
                const staffDocRef = db.collection('staff').doc(user.uid);
                const docSnap = await staffDocRef.get();

                if (docSnap.exists()) {
                    // Profile exists, they can proceed.
                    // If they are on the login or register page, redirect to handbook.
                    if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register-profile.html')) {
                        window.location.href = 'index.html';
                    } else {
                        // Otherwise, they are on a content page, so just show the content.
                        const mainContent = document.getElementById('main-content-wrapper');
                        const loginPrompt = document.getElementById('login-prompt');
                        if (loadingSpinner) loadingSpinner.style.display = 'none';
                        if (mainContent) mainContent.style.display = 'block';
                        if (loginPrompt) loginPrompt.style.display = 'none';
                        document.dispatchEvent(new CustomEvent('userAuthenticated', { detail: { user } }));
                    }
                } else {
                    // Profile does NOT exist. Redirect to the registration page.
                    console.log("No staff profile found. Redirecting to registration.");
                    window.location.href = 'register-profile.html';
                }
            } catch (error) {
                console.error("Error checking for staff profile:", error);
                // Fallback: if there's an error, just show the login prompt on content pages.
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                const loginPrompt = document.getElementById('login-prompt');
                if(loginPrompt) loginPrompt.style.display = 'flex';
            }

        } else {
            // User is signed out.
            // If they are not on the login page, redirect them there.
            if (!window.location.pathname.endsWith('login.html')) {
                 console.log('No user authenticated. Redirecting to training login page.');
                 window.location.href = 'login.html';
            } else {
                // If they are already on the login page, just hide the spinner.
                if (loadingSpinner) loadingSpinner.style.display = 'none';
            }
        }
    });
});
