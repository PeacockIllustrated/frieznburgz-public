// --- main.js ---
// This is the main orchestrator for the Friez n Burgz Admin Dashboard.
// It imports other modules and manages the overall application flow.

// Import Firebase initialization and instances (will be in firebase.js in next chunk)
// For now, these are direct imports, but will be refactored.
import { auth } from './firebase.js'; // Will be created in next chunk
import { locations, saveSelectedLocation, getSelectedLocation, clearSelectedLocation } from './config.js'; // Will be created in next chunk
import { initAuth, showAuth, hideAuth } from './auth.js'; // Will be created in next chunk
import { initLocationSelection, showLocationSelection, hideLocationSelection, updateLocationDisplay } from './location.js'; // Will be created in next chunk
import { showPage, hideAllPages, initSidebarNav } from './ui.js'; // Will be created in next chunk

// --- DOM Elements ---
const authContainer = document.getElementById('authContainer');
const locationSelectionContainer = document.getElementById('locationSelectionContainer');
const mainDashboardContainer = document.getElementById('mainDashboardContainer');
const logoutBtn = document.getElementById('logoutBtn');
const changeLocationBtn = document.getElementById('changeLocationBtn');


// --- Application Flow Management ---

/**
 * Initializes the main application logic.
 */
function initializeApp() {
    // Initialize authentication handlers
    initAuth();

    // Initialize location selection handlers
    initLocationSelection();

    // Initialize sidebar navigation
    initSidebarNav();

    // Set up general event listeners
    logoutBtn.addEventListener('click', handleLogout);
    changeLocationBtn.addEventListener('click', handleChangeLocation);

    // Observe Firebase authentication state changes
    auth.onAuthStateChanged(handleAuthStateChange);
}

/**
 * Handles changes in the user's authentication state.
 * @param {firebase.User} user - The authenticated user object, or null if signed out.
 */
async function handleAuthStateChange(user) {
    if (user) {
        // User is signed in
        hideAuth(); // Hide the login screen

        let selectedLocation = getSelectedLocation();

        if (selectedLocation) {
            // If a location is already selected, proceed to dashboard
            showDashboard(selectedLocation);
        } else {
            // If no location is selected, prompt the user to choose one
            hideDashboard();
            showLocationSelection();
        }
    } else {
        // User is signed out
        hideLocationSelection(); // Hide location selection if it was visible
        hideDashboard();        // Hide the main dashboard
        showAuth();             // Show the login screen
        updateLocationDisplay('Not Selected'); // Reset location display
        clearSelectedLocation(); // Clear any saved location on logout
    }
}

/**
 * Shows the main dashboard and updates the current location display.
 * @param {string} locationId - The ID of the selected location.
 */
function showDashboard(locationId) {
    locationSelectionContainer.style.display = 'none';
    mainDashboardContainer.style.display = 'grid'; // Use grid for dashboard layout
    updateLocationDisplay(locationId);

    // Set the initial active page (e.g., Dashboard overview)
    showPage('dashboard');
    // TODO: In later chunks, load initial dashboard data for this location
}

/**
 * Hides the main dashboard.
 */
function hideDashboard() {
    mainDashboardContainer.style.display = 'none';
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
 * Handles the "Change Location" button click.
 */
function handleChangeLocation() {
    clearSelectedLocation(); // Clear the currently selected location
    hideDashboard();         // Hide the dashboard
    showLocationSelection(); // Show the location selection screen again
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// --- Expose for Console Testing (Optional) ---
// This allows you to call these functions from your browser's developer console
// for testing purposes, e.g., `window.initializeApp();`
window.initializeApp = initializeApp;
window.showDashboard = showDashboard;
