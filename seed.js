// --- seed.js ---
// Contains functions to seed initial data into Firestore.

import { db } from './firebase.js';
import { FSA_ALLERGENS } from './constants.js';

/**
 * Seeds the 14 FSA allergens into the '/allergens' collection.
 * This function will add each allergen with a specific document ID (the allergen's id).
 * It will overwrite any existing allergen with the same ID.
 */
export async function seedAllergens() {
    const confirmSeed = confirm(
        "Are you sure you want to seed the 14 FSA allergens into the '/allergens' collection?\n\n" +
        "This will overwrite any existing data in that collection."
    );

    if (!confirmSeed) {
        return;
    }

    console.log("Starting allergen seed process...");
    const batch = db.batch();

    FSA_ALLERGENS.forEach((allergen, index) => {
        const docRef = db.collection('allergens').doc(allergen.id);
        const data = {
            id: allergen.id,
            name: allergen.name,
            iconKey: allergen.iconKey,
            order: index + 1 // Add an 'order' field based on array index
        };
        batch.set(docRef, data);
    });

    try {
        await batch.commit();
        alert("Successfully seeded the 14 FSA allergens to the '/allergens' collection.");
        console.log("Allergen seed process completed successfully.");
    } catch (error) {
        alert("An error occurred during the allergen seed process. Check the console for details.");
        console.error("Error seeding allergens:", error);
    }
}
