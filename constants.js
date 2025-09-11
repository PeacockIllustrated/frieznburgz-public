// --- constants.js ---
// Shared constants for the Friez n Burgz staff web app.

/**
 * Type-safe constant for allergen status in menu items.
 * @type {Readonly<string[]>}
 */
export const ALLERGEN_STATUS = Object.freeze([
    "contains",
    "may_contain",
    "free",
    "unknown"
]);

/**
 * The 14 major allergens as specified by the Food Standards Agency (FSA).
 * - id: A unique key for use in database records (e.g., Firestore maps).
 * - name: The human-readable name of the allergen.
 * - iconKey: A key for a corresponding icon (e.g., a Font Awesome class name).
 * @type {Readonly<Array<{id: string, name: string, iconKey: string}>>}
 */
export const FSA_ALLERGENS = Object.freeze([
    { id: "gluten", name: "Cereals containing gluten", iconKey: "fa-wheat-awn" },
    { id: "crustaceans", name: "Crustaceans", iconKey: "fa-shrimp" },
    { id: "eggs", name: "Eggs", iconKey: "fa-egg" },
    { id: "fish", name: "Fish", iconKey: "fa-fish" },
    { id: "peanuts", name: "Peanuts", iconKey: "fa-peanut" }, // Assuming a custom or placeholder icon
    { id: "soybeans", name: "Soybeans", iconKey: "fa-leaf" }, // Placeholder icon
    { id: "milk", name: "Milk", iconKey: "fa-cow" },
    { id: "nuts", name: "Nuts", iconKey: "fa-nuts" }, // Assuming a custom or placeholder icon
    { id: "celery", name: "Celery", iconKey: "fa-seedling" },
    { id: "mustard", name: "Mustard", iconKey: "fa-pepper-hot" }, // Placeholder icon
    { id: "sesame", name: "Sesame", iconKey: "fa-dot-circle" }, // Placeholder icon
    { id: "sulphites", name: "Sulphur dioxide and sulphites", iconKey: "fa-flask-chemist" }, // Placeholder icon
    { id: "lupin", name: "Lupin", iconKey: "fa-fan" }, // Placeholder icon
    { id: "molluscs", name: "Molluscs", iconKey: "fa-oyster" } // Assuming a custom or placeholder icon
]);
