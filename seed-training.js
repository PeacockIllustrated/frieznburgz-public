import { db } from './firebase.js'; // Assuming you have a firebase config file

export async function seedTrainingData() {
    console.log("Starting to seed training data...");

    // 1. Training Modules
    const trainingModules = {
        allergens_procedure: {
            title: "6-Step Allergen Procedure",
            type: "markdown",
            content: `# 6-Step Allergen Procedure

## Step 1: Ask & Listen
*   Always ask customers if they have any allergies or dietary restrictions.
*   Listen carefully to their needs. Repeat the information back to them to ensure it's correct.

## Step 2: Check the Allergen Matrix
*   Consult the up-to-date allergen matrix for the requested menu item.
*   Never guess. If you are unsure, ask a manager.

## Step 3: Inform the Customer
*   Clearly communicate the allergen information to the customer.
*   Inform them about potential cross-contamination risks if applicable.

## Step 4: Order with Clear Instructions
*   Use the "Allergy Alert" function on the till.
*   Add clear, specific notes to the order for the kitchen staff (e.g., "NO BUN - Celiac Allergy").

## Step 5: Clean Down & Change Gloves
*   Before preparing an allergy-safe meal, wash hands thoroughly.
*   Clean all surfaces and utensils that will be used.
*   Change into a fresh pair of gloves.

## Step 6: Deliver the Meal Separately
*   The allergy-safe meal should be delivered to the table separately from other meals to avoid cross-contamination.
*   The person who took the order or a manager should deliver the meal and confirm with the customer that it is the allergy-safe dish.`
        },
        allergens_customer_script: {
            title: "Customer Interaction Script",
            type: "script",
            content: `**Customer:** "Hi, I have a gluten allergy. What can I eat?"

**Staff (You):** "Thank you for letting me know. I'm happy to help with that. Let me just double-check our allergen matrix for you to be absolutely sure. One moment."

*(Check the matrix)*

**Staff (You):** "Okay, so for our burgers, the patties themselves are gluten-free. We can serve the burger without a bun, or we offer a gluten-free bun. The fries are cooked in a separate fryer, so they are also safe for you. Would you like to try the burger with a gluten-free bun?"

**Customer:** "That sounds great. Thank you."

**Staff (You):** "Perfect. I'll put this through with an allergy alert to make sure the kitchen team takes extra care. Your meal will be brought out separately to avoid any mix-ups."`
        },
        allergens_clean_down: {
            title: "Clean Down Checklist",
            type: "checklist",
            content: `**Allergy-Safe Clean Down Checklist**

*   [ ] **Wash Hands:** Wash hands thoroughly with soap and water for at least 20 seconds.
*   [ ] **Change Gloves:** Put on a new, clean pair of disposable gloves.
*   [ ] **Sanitize Surfaces:** Use a designated allergen-safe sanitizer to wipe down the food preparation area, including countertops and cutting boards.
*   [ ] **Separate Utensils:** Use clean, sanitized utensils (tongs, knives, etc.) that have been stored separately.
*   [ ] **Use Designated Equipment:** If available, use the purple-handled 'allergy-safe' equipment.
*   [ ] **Avoid Cross-Contamination:**
    *   Do not use the same toaster for regular and gluten-free buns.
    *   Do not use the same fryer for different food items unless it is designated for a specific purpose (e.g., gluten-free).
    *   Keep ingredients for allergy-safe meals separate from other ingredients.
*   [ ] **Final Check:** Before plating, give the area a final check to ensure no cross-contamination has occurred.`
        }
    };

    const modulesCollection = db.collection('trainingModules');
    for (const [id, data] of Object.entries(trainingModules)) {
        try {
            await modulesCollection.doc(id).set(data);
            console.log(`Successfully seeded module: ${id}`);
        } catch (error) {
            console.error(`Error seeding module ${id}:`, error);
        }
    }

    // 2. Quiz Questions
    const quizQuestions = {
        allergens_quiz: {
            title: "Allergen Safety Quiz",
            questions: [
                {
                    question: "What is the very first step when a customer informs you of an allergy?",
                    options: [
                        "Tell them what they can't eat.",
                        "Listen carefully and repeat their needs back to them.",
                        "Get a manager immediately.",
                        "Start preparing their food with extra care."
                    ],
                    answer: "Listen carefully and repeat their needs back to them."
                },
                {
                    question: "Where must you check for allergen information?",
                    options: [
                        "Ask a colleague what they think.",
                        "The main menu.",
                        "The up-to-date allergen matrix.",
                        "The specials board."
                    ],
                    answer: "The up-to-date allergen matrix."
                },
                {
                    question: "What is a critical step before preparing an allergy-safe meal?",
                    options: [
                        "Wipe the surface with a dry cloth.",
                        "Wash hands, clean surfaces, and change gloves.",
                        "Use the same utensils as other orders.",
                        "Ask the customer to watch you."
                    ],
                    answer: "Wash hands, clean surfaces, and change gloves."
                },
                {
                    question: "How should an allergy-safe meal be delivered to the customer?",
                    options: [
                        "On the same tray as all other meals.",
                        "By any available staff member.",
                        "Separately from other meals, with confirmation.",
                        "As quickly as possible, without any special announcement."
                    ],
                    answer: "Separately from other meals, with confirmation."
                },
                {
                    question: "When using the till, what function must be used for an allergy order?",
                    options: [
                        "Add a note saying 'extra care'.",
                        "The 'Allergy Alert' function.",
                        "The 'Special Request' button.",
                        "Just tell the kitchen staff verbally."
                    ],
                    answer: "The 'Allergy Alert' function."
                }
            ]
        }
    };

    const questionsCollection = db.collection('trainingQuizzes');
    for (const [id, data] of Object.entries(quizQuestions)) {
        try {
            await questionsCollection.doc(id).set(data);
            console.log(`Successfully seeded quiz: ${id}`);
        } catch (error) {
            console.error(`Error seeding quiz ${id}:`, error);
        }
    }

    console.log("Training data seeding complete.");
}

// To run this, you would typically call this function from an appropriate place in your application setup,
// or even run it as a standalone script with Node.js if you configure Firebase Admin SDK.
// For example:
// seedTrainingData().then(() => console.log('All done!'));
// For the purpose of this project, we can call it from `main.js` or a similar entry point,
// perhaps guarded by a flag in localStorage or a one-time execution check.
