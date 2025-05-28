// --- import-data.js ---
// This script is specifically for a one-time import of initial data
// into your Firestore database for multiple locations.
// It should ONLY be loaded and executed when you need to populate data.
// After successful execution, it is HIGHLY RECOMMENDED to remove
// the script tag from index.html that links to this file,
// and/or delete this file itself to prevent accidental re-imports.

// IMPORTANT: Ensure Firebase is initialized and 'auth' and 'db' are available.
// This script assumes `firebase.app()`, `firebase.auth()`, and `firebase.firestore()` are
// accessible globally, which they are if you include the Firebase SDKs in index.html.
// We'll also rely on `window.mainApp.getSelectedLocation()` for the current location.


// --- Raw Ingredient Data for Multi-Location Import ---
// This array holds the default items that will be copied to each location's subcollection.
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

/**
 * Imports all ingredient data from the `allIngredientsDataMultiLocation` array
 * into Firestore for all defined locations.
 * This function should be run ONCE manually from the browser's developer console
 * after a successful login to populate the database.
 *
 * IMPORTANT: After successful import, it is HIGHLY RECOMMENDED to:
 * 1. Remove the `<script src="import-data.js"></script>` tag from `index.html`.
 * 2. Delete the `import-data.js` file itself.
 * This prevents accidental re-imports and keeps your production bundle clean.
 */
window.importAllIngredientsForLocations = async function() {
    // Check if Firebase is initialized and user is authenticated
    if (!firebase.apps.length || !firebase.auth().currentUser) {
        console.error("Import Error: Firebase not initialized or user not logged in. Please log in first.");
        alert("Please log in to the Friez n Burgz Admin Dashboard before attempting to import ingredients.");
        return;
    }

    const db = firebase.firestore(); // Get Firestore instance

    const confirmImport = confirm(
        "Are you sure you want to import ALL ingredients for ALL locations?\n\n" +
        "This will create new data or OVERWRITE existing data in: locations/{locationId}/items\n" +
        "ONLY RUN THIS ONCE FOR INITIAL SETUP AND TEST WITH CAUTION."
    );
    if (!confirmImport) {
        console.log("Multi-location import cancelled by user.");
        return;
    }

    let totalImportedCount = 0;
    // Get location IDs from your config.js (assuming main.js exposes this)
    // Fallback if main.js isn't fully loaded or locations aren't accessible
    const allLocations = window.mainApp && window.mainApp.getLocations
        ? window.mainApp.getLocations().map(loc => loc.id)
        : ["south_shields", "forrest_hall", "byker", "whitley_bay", "newcastle_city_center"];

    if (allLocations.length === 0) {
        console.error("Import Error: No locations defined in config.js or accessible. Cannot import data.");
        alert("No locations found to import data for. Please ensure locations are defined in config.js.");
        return;
    }


    for (const locationId of allLocations) {
        const batch = db.batch();
        let locationImportCount = 0;
        console.log(`Starting import for location: ${locationId}`);

        for (const item of allIngredientsDataMultiLocation) {
            // Reference to the item document WITHIN the specific location's subcollection
            const itemDocRef = db.collection('locations').doc(locationId).collection('items').doc(item.id);

            // Create a copy of the item data to potentially randomize stock slightly per location
            // This adds some variety to stock levels for demonstration purposes.
            const itemDataCopy = { ...item };
            itemDataCopy.currentStock = Math.max(0, item.currentStock + Math.floor(Math.random() * 20) - 10); // +/- 10 units
            // Ensure stock isn't too high if reorder point is low, and make some critical
            if (itemDataCopy.currentStock > itemDataCopy.reorderPoint * 2) {
                itemDataCopy.currentStock = Math.floor(itemDataCopy.reorderPoint * 1.5);
            }
            if (Math.random() < 0.2) { // 20% chance of being critical
                itemDataCopy.currentStock = Math.max(0, Math.floor(itemDataCopy.reorderPoint / 2) - Math.floor(Math.random() * 5));
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
            alert(`Failed to import items for ${locationId}: ${error.message}. Check console for details.`);
            return; // Stop if one location fails
        }
    }

    console.log(`Total successfully imported ${totalImportedCount} ingredients across all locations.`);
    alert(`All ingredients (${totalImportedCount} total) successfully imported across all locations!`);

    // After import, if a location is already chosen in the app, force a dashboard refresh
    // so the newly imported data is displayed.
    if (window.mainApp && typeof window.mainApp.getSelectedLocation === 'function') {
        const currentSelectedLocation = window.mainApp.getSelectedLocation();
        if (currentSelectedLocation) {
            console.log("Refreshing dashboard with newly imported data.");
            window.mainApp.showDashboard(currentSelectedLocation);
        }
    }
};
