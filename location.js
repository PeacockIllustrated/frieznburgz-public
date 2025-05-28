// --- location.js ---
// Handles location selection UI and logic.

import { locations, saveSelectedLocation, getSelectedLocation, getLocationDisplayName } from './config.js';
import { showPage } from './ui.js'; // Will be used to show the dashboard page after location selection

// --- DOM Elements ---
const locationSelectionContainer = document.getElementById('locationSelectionContainer');
const locationSelect = document.getElementById('locationSelect');
const confirmLocationBtn = document.getElementById('confirmLocationBtn');
const locationMessage = document.getElementById('locationMessage');
const currentLocationDisplay = document.getElementById('currentLocationDisplay'); // From dashboard header


/**
 * Initializes location selection by populating the dropdown and setting up event listeners.
 */
export function initLocationSelection() {
    populateLocationDropdown();
    confirmLocationBtn.addEventListener('click', handleLocationConfirmation);
    console.log('Location selection event listeners initialized.');
}

/**
 * Populates the location dropdown with options from config.js.
 */
function populateLocationDropdown() {
    locationSelect.innerHTML = '<option value="" disabled selected>-- Select a Location --</option>';
    locations.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc.id;
        option.textContent = loc.name;
        locationSelect.appendChild(option);
    });
    console.log('Location dropdown populated.');
}

/**
 * Handles the confirmation of the selected location.
 */
function handleLocationConfirmation() {
    const selectedLocationId = locationSelect.value;

    if (!selectedLocationId) {
        locationMessage.textContent = 'Please select a location to proceed.';
        return;
    }

    saveSelectedLocation(selectedLocationId); // Save to local storage
    locationMessage.textContent = ''; // Clear message
    console.log(`Location confirmed: ${selectedLocationId}`);

    // Call a function from main.js or an orchestrator to proceed to dashboard
    // This is a direct call for simplicity, but in a larger app might be an event.
    window.mainApp.showDashboard(selectedLocationId); // Assuming mainApp is exposed globally by main.js
}

/**
 * Displays the location selection container.
 */
export function showLocationSelection() {
    locationSelectionContainer.style.display = 'flex'; // Use flex for centering
    locationMessage.textContent = ''; // Clear message
    // Reset dropdown to default if no valid selection is stored
    const storedLocation = getSelectedLocation();
    if (storedLocation && locations.some(loc => loc.id === storedLocation)) {
        locationSelect.value = storedLocation;
    } else {
        locationSelect.value = ''; // Reset to placeholder
    }
    console.log('Location selection screen shown.');
}

/**
 * Hides the location selection container.
 */
export function hideLocationSelection() {
    locationSelectionContainer.style.display = 'none';
    console.log('Location selection screen hidden.');
}

/**
 * Updates the location display text in the dashboard header.
 * @param {string} locationId - The ID of the currently selected location.
 */
export function updateLocationDisplay(locationId) {
    currentLocationDisplay.textContent = `Location: ${getLocationDisplayName(locationId)}`;
    console.log(`Current location display updated to: ${getLocationDisplayName(locationId)}`);
}
