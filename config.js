// --- config.js ---
// Centralizes Firebase configuration and application-wide constants.

// Your Firebase configuration (copy-pasted from your console)
export const firebaseConfig = {
    apiKey: "AIzaSyA4hS3texgNpdQbjj8QIECY4n0Nl3SWwTo",
    authDomain: "friez-burgz.firebaseapp.com",
    projectId: "friez-burgz",
    storageBucket: "friez-burgz.firebasestorage.app",
    messagingSenderId: "369360939966",
    appId: "1:369360939966:web:760d870c8c0f2a8f6667ef",
    measurementId: "G-67WXCWCC2X"
};

// List of available locations for the app
// The 'id' will be used as the Firestore document ID for the location.
export const locations = [
    { id: 'south_shields', name: 'South Shields' },
    { id: 'forrest_hall', name: 'Forrest Hall' },
    { id: 'byker', name: 'Byker' },
    { id: 'whitley_bay', name: 'Whitley Bay' },
    { id: 'newcastle_city_center', name: 'Newcastle City Center' } // Future location example
];

// NEW: Mappings for item categories to Font Awesome icons and specific colors
export const itemCategoryIcons = {
    'Meat': { icon: 'fas fa-drumstick-bite', colorClass: 'icon-meat' },
    'Cheeses': { icon: 'fas fa-cheese', colorClass: 'icon-cheese' },
    'Produce & Vegetables': { icon: 'fas fa-carrot', colorClass: 'icon-veggies' },
    'Breads & Baked Goods': { icon: 'fas fa-bread-slice', colorClass: 'icon-bread' },
    'Sauces & Condiments': { icon: 'fas fa-bottle-droplet', colorClass: 'icon-sauces' },
    'Specialz Ingredients': { icon: 'fas fa-star', colorClass: 'icon-specialz' },
    'Filletz Ingredients': { icon: 'fas fa-hotdog', colorClass: 'icon-filletz' }, // Example for specific
    'Milkshakes of the Week': { icon: 'fas fa-mug-hot', colorClass: 'icon-milkshake' },
    'Other Essentials': { icon: 'fas fa-box-open', colorClass: 'icon-essentials' },
    'Fruits': { icon: 'fas fa-apple-alt', colorClass: 'icon-fruit' }, // Example for Fruits
    'Desserts': { icon: 'fas fa-ice-cream', colorClass: 'icon-desserts' }, // Example for Desserts
    'Uncategorized': { icon: 'fas fa-box', colorClass: 'icon-uncategorized' }
};

// Key for storing the selected location in localStorage
const LOCATION_STORAGE_KEY = 'fnb_selected_location_id';

/**
 * Saves the selected location ID to localStorage.
 * @param {string} locationId - The ID of the selected location.
 */
export function saveSelectedLocation(locationId) {
    localStorage.setItem(LOCATION_STORAGE_KEY, locationId);
    console.log(`Location saved: ${locationId}`);
}

/**
 * Retrieves the selected location ID from localStorage.
 * @returns {string | null} The stored location ID, or null if not found.
 */
export function getSelectedLocation() {
    const locationId = localStorage.getItem(LOCATION_STORAGE_KEY);
    // Optional: Validate if the stored ID is one of the known locations
    const isValid = locations.some(loc => loc.id === locationId);
    return isValid ? locationId : null;
}

/**
 * Clears the selected location from localStorage.
 */
export function clearSelectedLocation() {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    console.log('Location cleared from storage.');
}

/**
 * Gets the display name of a location from its ID.
 * @param {string} locationId - The ID of the location.
 * @returns {string} The display name, or the ID if not found.
 */
export function getLocationDisplayName(locationId) {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : locationId;
}
