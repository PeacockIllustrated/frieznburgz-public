// --- main.js ---
// This is the main orchestrator for the Friez n Burgz Admin Dashboard.
// It imports other modules and manages the overall application flow.

// Import Firebase authentication instance
import { auth } from './firebase.js';

// Import configuration values and location management functions
import { getSelectedLocation, clearSelectedLocation, getLocationDisplayName } from './config.js';

// Import authentication UI and logic functions
import { initAuth, showAuth, hideAuth } from './auth.js';

// Import location selection UI and logic functions
import { initLocationSelection, showLocationSelection, hideLocationSelection, updateLocationDisplay } from './location.js';

// Import general UI utility functions
import { showPage, hideAllPages, initSidebarNav, showDashboardContainer, hideDashboardContainer } from './ui.js';


// --- DOM Elements (centralized for main.js's direct use) ---
const logoutBtn = document.getElementById('logoutBtn');
const changeLocationBtn = document.getElementById('changeLocationBtn');


// --- Application Flow Management ---

/**
 * Initializes the main application logic.
 */
function initializeApp() {
    // Initialize authentication handlers from auth.js
    initAuth();

    // Initialize location selection handlers from location.js
    initLocationSelection();

    // Initialize sidebar navigation from ui.js
    initSidebarNav();

    // Set up general event listeners for main dashboard controls
    logoutBtn.addEventListener('click', handleLogout);
    changeLocationBtn.addEventListener('click', handleChangeLocation);

    // Observe Firebase authentication state changes
    auth.onAuthStateChanged(handleAuthStateChange);

    console.log('Application initialized.');
}

/**
 * Handles changes in the user's authentication state.
 * This is the primary router for showing/hiding main app sections.
 * @param {firebase.User} user - The authenticated user object, or null if signed out.
 */
async function handleAuthStateChange(user) {
    if (user) {
        // User is signed in
        hideAuth(); // Hide the login screen

        let selectedLocation = getSelectedLocation();

        if (selectedLocation) {
            // If a location is already selected, proceed directly to dashboard
            showDashboard(selectedLocation);
        } else {
            // If no location is selected, prompt the user to choose one
            hideDashboardContainer(); // Ensure dashboard is hidden
            showLocationSelection(); // Show location selection screen
        }
    } else {
        // User is signed out
        hideLocationSelection();   // Hide location selection if it was visible
        hideDashboardContainer();  // Hide the main dashboard
        showAuth();                // Show the login screen
        updateLocationDisplay('Not Selected'); // Reset location display in header
        clearSelectedLocation();   // Clear any saved location from local storage
    }
}

/**
 * Shows the main dashboard and updates the current location display in the header.
 * This function is called by handleAuthStateChange (after login) and location.js (after selection).
 * @param {string} locationId - The ID of the selected location.
 */
function showDashboard(locationId) {
    hideLocationSelection();     // Hide location selection screen
    showDashboardContainer();    // Show the main dashboard container (from ui.js)
    updateLocationDisplay(locationId); // Update header display (from location.js)

    // Set the initial active page (e.g., Dashboard overview)
    showPage('dashboard'); // From ui.js
    // TODO: In later chunks, load initial dashboard data for this specific location
    console.log(`Dashboard shown for location: ${getLocationDisplayName(locationId)}`);
}

/**
 * Handles the logout action.
 */
async function handleLogout() {
    try {
        await auth.signOut();
        console.log('User logged out successfully.');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to log out. Please try again.');
    }
}

/**
 * Handles the "Change Location" button click from the dashboard header.
 */
function handleChangeLocation() {
    clearSelectedLocation(); // Clear the currently selected location from local storage
    hideDashboardContainer(); // Hide the dashboard
    showLocationSelection(); // Show the location selection screen again
    console.log('User requested to change location.');
}

// Expose showDashboard to the window object so location.js can call it
// This creates a circular dependency in terms of direct imports,
// but for an MVP, exposing the orchestrator function is practical.
// In a larger system, you might use a shared event bus pattern.
window.mainApp = {
    showDashboard: showDashboard
};


// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
