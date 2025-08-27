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
// Data parsed from provided screenshots.
const allIngredientsDataMultiLocation = [
    // --- Meat ---
    { id: 'beef_patties', name: 'Beef Patties', category: 'Meat', unit: 'lbs', initialAmount: 50 }, // Existing, keep for consistency
    { id: 'chicken_filletz_plain', name: 'Plain Chicken Filletz', category: 'Meat', unit: 'pcs', initialAmount: 75 }, // Existing, keep for consistency
    { id: 'chicken_breast', name: 'Chicken Breast', category: 'Meat', unit: 'lbs', initialAmount: 40 }, // Existing, keep for consistency
    { id: 'bacon_strips', name: 'Bacon Strips', category: 'Meat', unit: 'grams', initialAmount: 1500 }, // Converted to grams from existing unit to match spreadsheet
    { id: 'pastrami_slices', name: 'Pastrami Slices', category: 'Meat', unit: 'grams', initialAmount: 500 }, // Converted to grams from existing unit to match spreadsheet
    { id: 'pulled_turkey', name: 'Pulled Turkey', category: 'Meat', unit: 'lbs', initialAmount: 25 }, // Existing, keep for consistency
    { id: 'meat_general', name: 'Meat (General)', category: 'Meat', unit: 'grams', initialAmount: 1000 },
    { id: 'chicken_fillet_bulk', name: 'Chicken Fillet (Bulk)', category: 'Meat', unit: 'grams', initialAmount: 3000 },
    { id: 'chorizzo', name: 'Chorizzo', category: 'Meat', unit: 'grams', initialAmount: 500 },
    { id: 'pork_mince', name: 'Pork Mince', category: 'Meat', unit: 'grams', initialAmount: 499 },
    { id: 'pork_patties', name: 'Pork Patties', category: 'Meat', unit: 'grams', initialAmount: 3200 },

    // --- Cheeses ---
    { id: 'american_cheese_slices', name: 'American Cheese Slices', category: 'Cheeses', unit: 'slices', initialAmount: 120 }, // Existing, keep for consistency
    { id: 'halloumi_cheese', name: 'Halloumi Cheese', category: 'Cheeses', unit: 'grams', initialAmount: 2900 }, // Converted to grams from existing unit to match spreadsheet
    { id: 'mozzarella_patties', name: 'Mozzarella Patties', category: 'Cheeses', unit: 'pcs', initialAmount: 45 }, // Existing, keep for consistency
    { id: 'cheese_general', name: 'Cheese (General)', category: 'Cheeses', unit: 'grams', initialAmount: 3000 },
    { id: 'parmigiano_cheese', name: 'Parmigiano Cheese', category: 'Cheeses', unit: 'grams', initialAmount: 2000 },
    { id: 'grated_cheddar', name: 'Grated Cheddar', category: 'Cheeses', unit: 'grams', initialAmount: 2000 },
    { id: 'parmigiano_regrated', name: 'Parmigiano (Regrated)', category: 'Cheeses', unit: 'grams', initialAmount: 1000 },
    { id: 'grated_mozzarella', name: 'Grated Mozzarella', category: 'Cheeses', unit: 'grams', initialAmount: 1000 },
    { id: 'cheese_larder_block', name: 'Cheese (Larder Block)', category: 'Cheeses', unit: 'units', initialAmount: 40 },
    { id: 'fetta_cheese', name: 'Fetta Cheese', category: 'Cheeses', unit: 'grams', initialAmount: 3200 },

    // --- Produce & Vegetables ---
    { id: 'lettuce_shredded', name: 'Shredded Lettuce', category: 'Produce & Vegetables', unit: 'bags', initialAmount: 25 }, // Existing, keep for consistency
    { id: 'onions_diced', name: 'Diced Onions', category: 'Produce & Vegetables', unit: 'kg', initialAmount: 15 }, // Existing, keep for consistency
    { id: 'potatoes_fries', name: 'Fries Potatoes', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 20000 }, // Converted to grams from existing unit to match spreadsheet
    { id: 'lettuce_bulk_grams', name: 'Lettuce (Bulk)', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 7000 },
    { id: 'pickled_onions', name: 'Pickled Onions', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 1000 },
    { id: 'red_onion', name: 'Red Onion', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 9000 },
    { id: 'white_onion', name: 'White Onion', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 3000 },
    { id: 'chillies', name: 'Chillies', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 10000 },
    { id: 'pickled_gherkins', name: 'Pickled Gherkins', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 1500 },
    { id: 'dried_peppers', name: 'Dried Peppers', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 16000 },
    { id: 'lemon_fresh', name: 'Lemon (Fresh)', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 1350 },
    { id: 'dried_tomatoes', name: 'Dried Tomatoes', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 1000 },
    { id: 'cabbage_red', name: 'Red Cabbage', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 10000 },
    { id: 'white_onions', name: 'White Onions', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 20000 },
    { id: 'cabbage_white', name: 'White Cabbage', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 10000 },
    { id: 'garlic_peeled', name: 'Peeled Garlic', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 1000 },
    { id: 'cucumber_single', name: 'Cucumber (Single)', category: 'Produce & Vegetables', unit: 'units', initialAmount: 1 },
    { id: 'rocket_salad', name: 'Rocket Salad', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 60 },
    { id: 'cos_lettuce', name: 'Cos Lettuce', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 1000 },
    { id: 'strawberry_fresh', name: 'Strawberry (Fresh)', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 1000 },
    { id: 'banana_fresh', name: 'Banana (Fresh)', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 1000 },
    { id: 'spinach_fresh', name: 'Spinach (Fresh)', category: 'Produce & Vegetables', unit: 'grams', initialAmount: 500 },

    // --- Sauces & Condiments ---
    { id: 'classic_sauce', name: 'Classic Sauce', category: 'Sauces & Condiments', unit: 'gallons', initialAmount: 15 }, // Existing, keep for consistency
    { id: 'ketchup_heinz', name: 'Heinz Ketchup', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 4000 }, // Converted to grams from existing unit to match spreadsheet
    { id: 'special_sauce_base', name: 'Special Sauce Base', category: 'Specialz Ingredients', unit: 'liters', initialAmount: 10 }, // Existing, keep for consistency
    { id: 'honey_chilli_glaze', name: 'Honey Chilli Glaze', category: 'Filletz Ingredients', unit: 'liters', initialAmount: 5 }, // Existing, keep for consistency
    { id: 'mango_puree', name: 'Mango Puree', category: 'Milkshakes of the Week', unit: 'liters', initialAmount: 8 }, // Existing, keep for consistency
    { id: 'sauce_general', name: 'Sauce (General)', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 9600 },
    { id: 'cheese_sauce', name: 'Cheese Sauce', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 1000 },
    { id: 'mustard_dijon', name: 'Dijon Mustard', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 2270 },
    { id: 'mustard_english', name: 'English Mustard', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 2250 },
    { id: 'nacho_cheese_sauce', name: 'Nacho Cheese Sauce', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 1000 },
    { id: 'bbq_sauce', name: 'BBQ Sauce', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 3870 },
    { id: 'mayonnaise_heinz', name: 'Heinz Mayonnaise', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 10000 },
    { id: 'pesto_sauce', name: 'Pesto Sauce', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 950 },
    { id: 'piri_piri_sauce', name: 'Piri Piri Sauce', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 1000 },
    { id: 'maple_syrup', name: 'Maple Syrup', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 435 },
    { id: 'worcester_sauce', name: 'Worcester Sauce', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 568 },
    { id: 'mustard_wholegrain', name: 'Wholegrain Mustard', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 2250 },
    { id: 'pickled_juice', name: 'Pickled Juice', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 1000 },
    { id: 'garlic_parmesan_sauce', name: 'Garlic Parmesan Sauce', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 10000 },
    { id: 'sweet_smoked_sauce', name: 'Sweet Smoked Sauce', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 10000 },
    { id: 'chipotle_sauce', name: 'Chipotle Sauce', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 10000 },
    { id: 'cranberry_sauce', name: 'Cranberry Sauce', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 2720 },
    { id: 'our_cheese_sauce', name: 'Our Cheese Sauce', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 13200 },
    { id: 'garlic_honey', name: 'Garlic Honey', category: 'Sauces & Condiments', unit: 'grams', initialAmount: 5500 },

    // --- Breads & Baked Goods ---
    { id: 'burger_buns', name: 'Burger Buns', category: 'Breads & Baked Goods', unit: 'units', initialAmount: 20 }, // Converted to units from existing unit to match spreadsheet
    { id: 'burger_buns_packs', name: 'Burger Buns (Packs)', category: 'Breads & Baked Goods', unit: 'packs', initialAmount: 40 }, // Existing for consistency, rename if needed
    { id: 'burger_buns_single', name: 'Burger Buns (Single)', category: 'Breads & Baked Goods', unit: 'units', initialAmount: 1 }, // New single unit for import
    { id: 'toast_bread', name: 'Bread (Toast)', category: 'Breads & Baked Goods', unit: 'grams', initialAmount: 6500 },

    // --- Other Essentials ---
    { id: 'frying_oil', name: 'Frying Oil', category: 'Other Essentials', unit: 'gallons', initialAmount: 5 }, // Existing, keep for consistency
    { id: 'disposable_gloves', name: 'Disposable Gloves', category: 'Other Essentials', unit: 'boxes', initialAmount: 18 }, // Existing, keep for consistency
    { id: 'grease_proof_paper', name: 'Grease Proof Paper', category: 'Other Essentials', unit: 'units', initialAmount: 100 },
    { id: 'bag_general', name: 'Bag (General)', category: 'Other Essentials', unit: 'units', initialAmount: 100 },
    { id: 'vitamin_a_supplement', name: 'Vitamin A Supplement', category: 'Other Essentials', unit: 'grams', initialAmount: 10000 },
    { id: 'vitamin_d_supplement', name: 'Vitamin D Supplement', category: 'Other Essentials', unit: 'grams', initialAmount: 10000 },
    { id: 'finzbourg_item', name: 'Finzbourg (Misc. Item)', category: 'Other Essentials', unit: 'grams', initialAmount: 10000 }, // Assuming Finzbourg is a misc item

    // --- Dairy & Beverages ---
    { id: 'milk_general', name: 'Milk (General)', category: 'Dairy & Beverages', unit: 'grams', initialAmount: 2000 },
    { id: 'egg_white', name: 'Egg White', category: 'Dairy & Beverages', unit: 'grams', initialAmount: 1000 },
    { id: 'egg_yolk', name: 'Egg Yolk', category: 'Dairy & Beverages', unit: 'grams', initialAmount: 1000 },
    { id: 'butter', name: 'Butter', category: 'Dairy & Beverages', unit: 'grams', initialAmount: 2000 },
    { id: 'yogurt', name: 'Yogurt', category: 'Dairy & Beverages', unit: 'grams', initialAmount: 1000 },
    { id: 'milk_shake_mix', name: 'Milk Shake Mix', category: 'Dairy & Beverages', unit: 'grams', initialAmount: 10000 },
    { id: 'fresh_milk_milkshakes', name: 'Fresh Milk (Milkshakes)', category: 'Dairy & Beverages', unit: 'grams', initialAmount: 10000 },
    { id: 'double_cream', name: 'Double Cream', category: 'Dairy & Beverages', unit: 'grams', initialAmount: 2000 },

    // --- Spices & Seasonings ---
    { id: 'black_pepper', name: 'Black Pepper', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 500 },
    { id: 'white_pepper', name: 'White Pepper', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 500 },
    { id: 'salt', name: 'Salt', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 6000 },
    { id: 'paprika_powder', name: 'Paprika Powder', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 430 },
    { id: 'larder_basil', name: 'Larder Basil', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 160 },
    { id: 'chili_powder', name: 'Chili Powder', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 590 },
    { id: 'larder_chives', name: 'Larder Chives', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 410 },
    { id: 'ground_ginger', name: 'Ground Ginger', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 2000 },
    { id: 'thyme_herb', name: 'Thyme (Herb)', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 960 },
    { id: 'ground_nutmeg', name: 'Ground Nutmeg', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 500 },
    { id: 'dried_parsley', name: 'Dried Parsley', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 2000 },
    { id: 'chilli_flakes', name: 'Chilli Flakes', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 2000 },
    { id: 'onion_powder', name: 'Onion Powder', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 500 },
    { id: 'garlic_flakes', name: 'Garlic Flakes', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 1000 },
    { id: 'garlic_powder', name: 'Garlic Powder', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 10000 },
    { id: 'monosodium_glutamate', name: 'Monosodium Glutamate', category: 'Spices & Seasonings', unit: 'grams', initialAmount: 22680 },

    // --- Baking & Dry Goods ---
    { id: 'breading', name: 'Breading', category: 'Baking & Dry Goods', unit: 'grams', initialAmount: 27800 },
    { id: 'corn_flakes', name: 'Corn Flakes', category: 'Baking & Dry Goods', unit: 'grams', initialAmount: 500 },
    { id: 'cornflour', name: 'Cornflour', category: 'Baking & Dry Goods', unit: 'grams', initialAmount: 3500 },
    { id: 'flour_general', name: 'Flour (General)', category: 'Baking & Dry Goods', unit: 'grams', initialAmount: 16000 },
    { id: 'strong_flour', name: 'Strong Flour', category: 'Baking & Dry Goods', unit: 'grams', initialAmount: 16000 },
    { id: 'baking_powder', name: 'Baking Powder', category: 'Baking & Dry Goods', unit: 'grams', initialAmount: 800 },
    { id: 'bechamel_mix', name: 'Bechamel Mix', category: 'Baking & Dry Goods', unit: 'grams', initialAmount: 1000 },
    { id: 'chocolate_bits', name: 'Chocolate Bits', category: 'Dessert Ingredients', unit: 'grams', initialAmount: 1000 }, // Moved to Dessert Ingredients

    // --- Frozen Goods ---
    { id: 'hash_browns', name: 'Hash Browns', category: 'Frozen Goods', unit: 'grams', initialAmount: 420 },

    // --- Spreads & Conserves ---
    { id: 'peanut_butter', name: 'Peanut Butter', category: 'Spreads & Conserves', unit: 'grams', initialAmount: 1000 },
    { id: 'strawberry_jam', name: 'Strawberry Jam', category: 'Spreads & Conserves', unit: 'grams', initialAmount: 2720 },
    { id: 'bacon_jam', name: 'Bacon Jam', category: 'Spreads & Conserves', unit: 'grams', initialAmount: 6000 },

    // --- Oils & Vinegars ---
    { id: 'cider_vinegar', name: 'Cider Vinegar', category: 'Oils & Vinegars', unit: 'grams', initialAmount: 50 },
    { id: 'dill_oil', name: 'Dill Oil', category: 'Oils & Vinegars', unit: 'grams', initialAmount: 150 },
    { id: 'olive_oil', name: 'Olive Oil', category: 'Oils & Vinegars', unit: 'grams', initialAmount: 1000 },

    // --- Pasta & Grains ---
    { id: 'chipotle_pasta', name: 'Chipotle Pasta', category: 'Pasta & Grains', unit: 'grams', initialAmount: 1000 },
    { id: 'macaroni', name: 'Macaroni', category: 'Pasta & Grains', unit: 'grams', initialAmount: 4000 },

    // --- Dessert Ingredients ---
    { id: 'strawberry_topping', name: 'Strawberry Topping', category: 'Dessert Ingredients', unit: 'grams', initialAmount: 5000 },
    { id: 'chocolate_topping', name: 'Chocolate Topping', category: 'Dessert Ingredients', unit: 'grams', initialAmount: 5000 },
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
        return;
    }

    let totalImportedCount = 0;
    // Get location IDs from your config.js (assuming main.js exposes this)
    const allLocations = window.mainApp && window.mainApp.getLocations
        ? window.mainApp.getLocations().map(loc => loc.id)
        : ["south_shields", "forrest_hall", "byker", "whitley_bay", "newcastle_city_center"]; // Fallback if mainApp isn't ready

    if (allLocations.length === 0) {
        console.error("Import Error: No locations defined in config.js or accessible. Cannot import data.");
        alert("No locations found to import data for. Please ensure locations are defined in config.js.");
        return;
    }


    for (const locationId of allLocations) {
        const batch = db.batch();
        let locationImportCount = 0;

        for (const item of allIngredientsDataMultiLocation) {
            // Reference to the item document WITHIN the specific location's subcollection
            const itemDocRef = db.collection('locations').doc(locationId).collection('items').doc(item.id);

            // Create a copy of the item data
            const itemDataCopy = { ...item };

            // Set dynamic reorder points and quantities
            // Default reorderPoint to 25% of initialAmount, min 1
            itemDataCopy.reorderPoint = Math.max(1, Math.floor(item.initialAmount * 0.25));
            // Default reorderQuantity to 50% to 100% of initialAmount, min 10
            itemDataCopy.reorderQuantity = Math.max(10, Math.floor(item.initialAmount * (0.5 + Math.random() * 0.5)));

            // Randomize currentStock and potentially make some critical
            itemDataCopy.currentStock = Math.max(0, item.initialAmount + Math.floor(Math.random() * (item.initialAmount * 0.1)) - Math.floor(item.initialAmount * 0.05)); // +/- 5% of initial

            // Ensure stock isn't too high compared to reorder point
            if (itemDataCopy.currentStock > itemDataCopy.reorderPoint * 3) { // Cap max stock at 3x reorder point
                itemDataCopy.currentStock = Math.floor(itemDataCopy.reorderPoint * 2 + Math.random() * itemDataCopy.reorderPoint);
            }
            if (Math.random() < 0.2) { // 20% chance of being critical
                itemDataCopy.currentStock = Math.max(0, Math.floor(itemDataCopy.reorderPoint / 2) - Math.floor(Math.random() * (itemDataCopy.reorderPoint * 0.1)));
            }

            // Clean up the temporary initialAmount field before saving
            delete itemDataCopy.initialAmount;

            batch.set(itemDocRef, itemDataCopy); // Use .set() to create or overwrite
            locationImportCount++;
        }

        try {
            await batch.commit();
            totalImportedCount += locationImportCount;
        } catch (error) {
            console.error(`Error importing for ${locationId}:`, error);
            alert(`Failed to import items for ${locationId}: ${error.message}. Check console for details.`);
            return; // Stop if one location fails
        }
    }

    alert(`All ingredients (${totalImportedCount} total) successfully imported across all locations!`);

    // After import, if a location is already chosen in the app, force a dashboard refresh
    // so the newly imported data is displayed.
    if (window.mainApp && typeof window.mainApp.getSelectedLocation === 'function') {
        const currentSelectedLocation = window.mainApp.getSelectedLocation();
        if (currentSelectedLocation) {
            // Assuming mainApp.showDashboard re-renders the current page (dashboard)
            window.mainApp.showDashboard(currentSelectedLocation);
        }
    }
};
