// --- staff-training/training-auth.js (Definitive Final Version) ---

import { auth, db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    // This script should NOT run on the login page itself to avoid loops.
    if (window.location.pathname.endsWith('login.html')) {
        return;
    }
    
    const mainContent = document.getElementById('main-content-wrapper');
    const loginPrompt = document.getElementById('login-prompt');
    const loadingSpinner = document.getElementById('loading-spinner');

    if(loadingSpinner) loadingSpinner.style.display = 'flex';

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // A user is logged in. Now, we MUST check if they have a staff profile.
            try {
                const staffDocRef = db.collection('staff').doc(user.uid);
                const docSnap = await staffDocRef.get();

                // *** THE FIX IS HERE ***
                // The 'compat' library returns a snapshot object that has the .exists property as a boolean, not a function.
                if (docSnap && docSnap.exists) {
                    // --- Case 1: Existing Employee ---
                    // Their profile exists, so show them the content.
                    if (loadingSpinner) loadingSpinner.style.display = 'none';
                    if (mainContent) mainContent.style.display = 'block';
                    if (loginPrompt) loginPrompt.style.display = 'none';
                    
                    // Notify other scripts that the authenticated user is ready to go.
                    document.dispatchEvent(new CustomEvent('userAuthenticated', { detail: { user } }));
                } else {
                    // --- Case 2: New Employee (Logged in, but no profile) ---
                    // They need to create their profile. Redirect them to the registration page.
                    // We check to make sure they aren't already on it to prevent a redirect loop.
                    if (!window.location.pathname.endsWith('register-profile.html')) {
                        console.log("No staff profile found for authenticated user. Redirecting to registration.");
                        window.location.href = 'register-profile.html';
                    } else {
                         // They are already on the correct registration page, so just show it.
                        if (loadingSpinner) loadingSpinner.style.display = 'none';
                        const formWrapper = document.querySelector('.auth-card');
                        if (formWrapper) formWrapper.style.display = 'block';
                    }
                }
            } catch (error) {
                console.error("Error checking for staff profile:", error);
                alert("There was an error verifying your account. Please try again later.");
                if (loadingSpinner) loadingSpinner.style.display = 'none';
            }
        } else {
            // --- Case 3: No User Logged In ---
            // Redirect to the login page.
            console.log('No user session found. Redirecting to login page.');
            window.location.href = 'login.html';
        }
    });
});
