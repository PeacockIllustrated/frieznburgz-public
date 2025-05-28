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

// Import specific page rendering functions
import { renderStockManagementPage } from './stock.js'; // New import
import { renderWastageLogPage } from './wastage.js';   // New import


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
    initSidebarNav(handleNavigationClick); // Pass a callback for page content rendering

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
    // Automatically load dashboard content if available
    renderPageContent('dashboard'); // Render content for the default dashboard page

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
function handleNavigationClick(pageId) {
    // This function will be called by ui.js when a nav item is clicked.
    // It's responsible for calling the correct rendering function for that page.
    renderPageContent(pageId);
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
            // Dashboard overview content will go here in a later chunk
            console.log('Rendering Dashboard Overview...');
            // Example: dashboardPage.innerHTML = '... dynamic content ...';
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
            // Render orders page (future functionality)
            console.log('Rendering Orders page...');
            break;
        case 'suppliers':
            // Render suppliers page (future functionality)
            console.log('Rendering Suppliers page...');
            break;
        case 'settings':
            // Render settings page (future functionality)
            console.log('Rendering Settings page...');
            break;
        default:
            console.warn(`No rendering function defined for page: ${pageId}`);
            break;
    }
}


// Expose showDashboard to the window object so location.js can call it
window.mainApp = {
    showDashboard: showDashboard
};

// --- One-Time Multi-Location Data Import Function ---
// This function is for initial setup. RUN IT ONCE FROM BROWSER CONSOLE AFTER LOGGING IN.
// Then you can delete or comment out this entire section from your script.js file.

const allIngredientsDataMultiLocation = [
    // Standard Meat Items
    { id: 'beef_patties', name: 'Beef Patties', category: 'Meat', unit: 'lbs', currentStock: 50, reorderPoint: 20, reorderQuantity: 100 },
    { id: 'chicken_filletz_plain', name: 'Plain Chicken Filletz', category: 'Meat', unit: 'pcs', currentStock: 75, reorderPoint: 30, reorderQuantity: 150 },
    { id: 'chicken_breast', name: 'Chicken Breast', category: 'Meat', unit: 'lbs', currentStock: 40, reorderPoint: 15, reorderQuantity: 80 },
    { id: 'bacon_strips', name: 'Bacon Strips', category: 'Meat', unit: 'packs', currentStock: 60, reorderPoint: 25, reorderQuantity: 120 },
    { id: 'pastrami_slices', name: 'Pastrami Slices', category: 'Meat', unit: 'lbs', currentStock: 30, reorderPoint: 10, reorderQuantity: 50 },
    { id: 'pulled_turkey', name: 'Pulled Turkey', category: 'Meat', unit: 'lbs', currentStock: 25, reorderPoint: 10, reorderQuantity: 40 },

    // Standard Cheese Items
    { id: 'american_cheese_slices', name: 'American Cheese', category: 'Cheeses', unit: 'slices', currentStock: 120, reorderPoint: 50, reorderQuantity: 200 },
    { id: 'halloumi_cheese', name: 'Halloumi Cheese', category: 'Cheeses', unit: 'blocks', currentStock: 30, reorderPoint: 10, reorderQuantity: 50 },
    { id: 'mozzarella_patties', name: 'Mozzarella Patties', category: 'Cheeses', unit: 'pcs', currentStock: 45, reorderPoint: 15, reorderQuantity: 75 },

    // Example Specialz/Filletz/Milkshake Ingredients (these would be location-specific typically)
    { id: 'special_sauce_base', name: 'Special Sauce Base', category: 'Specialz Ingredients', unit: 'liters', currentStock: 10, reorderPoint: 3, reorderQuantity: 10 },
    { id: 'crispy_onions', name: 'Crispy Onions', category: 'Specialz Ingredients', unit: 'kg', currentStock: 8, reorderPoint: 2, reorderQuantity: 15 },
    { id: 'honey_chilli_glaze', name: 'Honey Chilli Glaze', category: 'Filletz Ingredients', unit: 'liters', currentStock: 5, reorderPoint: 1, reorderQuantity: 5 },
    { id: 'mango_puree', name: 'Mango Puree', category: 'Milkshakes of the Week', unit: 'liters', currentStock: 8, reorderPoint: 2, reorderQuantity: 5 },

    // General Produce & Vegetables
    { id: 'lettuce_shredded', name: 'Shredded Lettuce', category: 'Produce & Vegetables', unit: 'bags', currentStock: 25, reorderPoint: 10, reorderQuantity: 40 },
    { id: 'onions_diced', name: 'Diced Onions', category: 'Produce & Vegetables', unit: 'kg', currentStock: 15, reorderPoint: 5, reorderQuantity: 25 },
    { id: 'potatoes_fries', name: 'Fries Potatoes', category: 'Produce & Vegetables', unit: 'kg', currentStock: 80, reorderPoint: 25, reorderQuantity: 100 },

    // General Sauces & Condiments
    { id: 'classic_sauce', name: 'Classic Sauce', category: 'Sauces & Condiments', unit: 'gallons', currentStock: 15, reorderPoint: 5, reorderQuantity: 20 },
    { id: 'ketchup_heinz', name: 'Heinz Ketchup', category: 'Sauces & Condiments', unit: 'gallons', currentStock: 20, reorderPoint: 8, reorderQuantity: 30 },

    // General Breads & Baked Goods
    { id: 'burger_buns', name: 'Burger Buns', category: 'Breads & Baked Goods', unit: 'packs', currentStock: 40, reorderPoint: 15, reorderQuantity: 50 },

    // General Other Essentials
    { id: 'frying_oil', name: 'Frying Oil', category: 'Other Essentials', unit: 'gallons', currentStock: 5, reorderPoint: 2, reorderQuantity: 10 },
    { id: 'disposable_gloves', name: 'Disposable Gloves', category: 'Other Essentials', unit: 'boxes', currentStock: 18, reorderPoint: 5, reorderQuantity: 25 },
];


async function importAllIngredientsForLocations() {
    if (!auth.currentUser) {
        console.error("Authentication Error: You must be logged in to import data.");
        alert("Please log in before attempting to import ingredients.");
        return;
    }

    const confirmImport = confirm(
        "Are you sure you want to import ALL ingredients for ALL locations?\n\n" +
        "This will create/overwrite data in: locations/{locationId}/items\n" +
        "ONLY RUN THIS ONCE FOR INITIAL SETUP."
    );
    if (!confirmImport) {
        console.log("Multi-location import cancelled by user.");
        return;
    }

    let totalImportedCount = 0;
    const allLocations = ["south_shields", "forrest_hall", "byker", "whitley_bay", "newcastle_city_center"]; // Ensure these match IDs in config.js

    for (const locationId of allLocations) {
        const batch = db.batch();
        let locationImportCount = 0;
        console.log(`Starting import for location: ${locationId}`);

        for (const item of allIngredientsDataMultiLocation) {
            // Reference to the item document WITHIN the specific location's subcollection
            const itemDocRef = db.collection('locations').doc(locationId).collection('items').doc(item.id);

            // Create a copy of the item data to potentially randomize stock slightly per location
            const itemDataCopy = { ...item };

            // Optional: Randomize stock slightly for each location for variety (remove for exact copies)
            itemDataCopy.currentStock = Math.max(0, item.currentStock + Math.floor(Math.random() * 20) - 10); // +/- 10 units
            if (itemDataCopy.currentStock < itemDataCopy.reorderPoint / 2) { // Ensure some critical stock
                itemDataCopy.currentStock = Math.max(0, itemDataCopy.reorderPoint / 2 + Math.floor(Math.random() * 5));
            }


            batch.set(itemDocRef, itemDataCopy); // Use .set() to create or overwrite
            locationImportCount++;
        }

        try {
            await batch.commit();
            totalImportedCount += locationImportCount;
            console.log(`Successfully imported ${locationImportCount} items for ${locationId}.`);
        } catch (error) {
            console.error(`Error importing for ${locationId}:`, error);
            alert(`Failed to import items for ${locationId}: ${error.message}. Check console.`);
            return; // Stop if one location fails
        }
    }

    console.log(`Total successfully imported ${totalImportedCount} ingredients across all locations.`);
    alert(`All ingredients (${totalImportedCount} total) successfully imported across all locations!`);

    // After import, it's a good idea to reload stock for the currently selected location
    // if a location is already chosen. This will happen on next login if not.
    const currentSelectedLocation = getSelectedLocation();
    if (currentSelectedLocation) {
        window.mainApp.showDashboard(currentSelectedLocation); // Force dashboard refresh
    }
}

// To run this function:
// 1. Deploy your code.
// 2. Go to your live app URL.
// 3. Log in.
// 4. Open your browser's Developer Console (F12 or right-click -> Inspect, then 'Console' tab).
// 5. Type `importAllIngredientsForLocations();` and press Enter.
// 6. Confirm the action in the pop-up.
// 7. AFTER SUCCESSFUL IMPORT, REMOVE THIS SCRIPT FROM YOUR PROJECT.
// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
