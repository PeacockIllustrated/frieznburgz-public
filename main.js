// --- main.js ---
// This is the main orchestrator for the Friez n Burgz Admin Dashboard.
// It imports other modules and manages the overall application flow.

// Import Firebase authentication instance
import { auth } from './firebase.js';

// Import configuration values and location management functions
import { getSelectedLocation, clearSelectedLocation, getLocationDisplayName, locations } from './config.js'; // Added 'locations' import

// Import authentication UI and logic functions
import { initAuth, showAuth, hideAuth } from './auth.js';

// Import location selection UI and logic functions
import { initLocationSelection, showLocationSelection, hideLocationSelection, updateLocationDisplay } from './location.js';

// Import general UI utility functions
import { showPage, hideAllPages, initSidebarNav, showDashboardContainer, hideDashboardContainer } from './ui.js';

// Import specific page rendering functions
import { renderStockManagementPage, getAllUniqueStockItems } from './stock.js';
import { renderWastageLogPage } from './wastage.js';
import { renderDashboardOverviewPage, showQuickAdjustmentModal, openModal, closeModal } from './dashboard.js';
import { renderSuppliersPage } from './suppliers.js';
import { renderOrdersPage } from './orders.js'; // NEW IMPORT


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

    // Initialize sidebar navigation from ui.js, passing the content rendering callback
    initSidebarNav(handleNavigationClick); // Ensure ui.js is correctly setup to receive and use this callback

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
    // Automatically render content for the default dashboard page
    renderPageContent('dashboard');

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

/**
 * Callback function passed to ui.js for sidebar navigation.
 * Renders the content for the selected page.
 * @param {string} pageId - The ID of the page to render (e.g., 'stock-management').
 */
async function handleNavigationClick(pageId) {
    // This function will be called by ui.js when a nav item is clicked.
    // It's responsible for calling the correct rendering function for that page.
    await renderPageContent(pageId);
}

/**
 * Renders the content for a specific dashboard page based on its ID.
 * @param {string} pageId - The ID of the page to render.
 */
async function renderPageContent(pageId) {
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        // If no location is selected, redirect to location selection
        console.warn(`Attempted to render page "${pageId}" without a selected location. Redirecting.`);
        hideDashboardContainer();
        showLocationSelection();
        return;
    }

    // Use a switch statement to call the appropriate rendering function
    switch (pageId) {
        case 'dashboard':
            await renderDashboardOverviewPage(); // CALL NEW FUNCTION HERE
            console.log('Rendering Dashboard Overview...');
            break;
        case 'stock-management':
            await renderStockManagementPage(); // Call function from stock.js
            console.log('Rendering Stock Management page...');
            break;
        case 'wastage-log':
            await renderWastageLogPage(); // Call function from wastage.js
            console.log('Rendering Wastage Log page...');
            break;
        case 'orders':
            await renderOrdersPage(); // CALL NEW FUNCTION HERE for orders
            console.log('Rendering Orders page...');
            break;
        case 'suppliers':
            await renderSuppliersPage(); // CALL NEW FUNCTION HERE for suppliers
            console.log('Rendering Suppliers page...');
            break;
        case 'settings':
            document.getElementById('settingsPage').innerHTML = `<h2 class="page-title">Settings</h2><p>App settings and user management (coming soon).</p>`;
            console.log('Rendering Settings page...');
            break;
        default:
            console.warn(`No rendering function defined for page: ${pageId}`);
            break;
    }
}


// Expose showDashboard to the window object so location.js can call it
// Also expose handleNavigationClick for the quick action buttons on the dashboard
window.mainApp = {
    showDashboard: showDashboard,
    handleNavigationClick: handleNavigationClick, // EXPOSE FOR QUICK ACTIONS
    showQuickAdjustmentModal: showQuickAdjustmentModal, // EXPOSE FOR WASTAGE PAGE
    openModal: openModal, // EXPOSE openModal from dashboard.js
    closeModal: closeModal, // EXPOSE closeModal from dashboard.js
    getAllUniqueStockItems: getAllUniqueStockItems, // EXPOSE for Suppliers page to get all items
    getLocations: () => locations // Expose the full locations array
};


// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
