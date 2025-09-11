// --- allergens.js ---
// Manages the rendering and logic for all allergen-related pages.

import { createPageHtml } from './allergens-template.js';

// --- Page Rendering Functions ---

export async function renderAllergenMatrixPage() {
    const content = '<h2>Allergen Matrix</h2><p>Detailed grid of menu items and their allergens.</p>';
    document.getElementById('allergenMatrixPage').innerHTML = createPageHtml('Allergen Matrix', content);
}

export async function renderAllergenProceduresPage() {
    const content = '<h2>Allergen Procedures</h2><p>Standard operating procedures for handling allergens.</p>';
    document.getElementById('allergenProceduresPage').innerHTML = createPageHtml('Allergen Procedures', content);
}

export async function renderAllergenTrainingPage() {
    const content = '<h2>Allergen Training</h2><p>Training materials and resources.</p>';
    document.getElementById('allergenTrainingPage').innerHTML = createPageHtml('Allergen Training', content);
}

export async function renderAllergenPrintPage() {
    const content = '<h2>Print Allergens</h2><p>Printable versions of the allergen matrix.</p>';
    document.getElementById('allergenPrintPage').innerHTML = createPageHtml('Print Allergens', content);
}

// --- Admin-Only Page Rendering Functions ---

export async function renderAllergenEditorPage() {
    const content = '<h2>Allergen Editor</h2><p>Admin-only: Edit menu items and their allergen information.</p>';
    document.getElementById('allergenEditorPage').innerHTML = createPageHtml('Allergen Editor', content);
}

export async function renderAllergenVersionsPage() {
    const content = '<h2>Allergen Versions</h2><p>Admin-only: View and manage published versions of the allergen matrix.</p>';
    document.getElementById('allergenVersionsPage').innerHTML = createPageHtml('Allergen Versions', content);
}

export async function renderAllergenImportPage() {
    const content = '<h2>Import Allergens</h2><p>Admin-only: Bulk import or update allergen data.</p>';
    document.getElementById('allergenImportPage').innerHTML = createPageHtml('Import Allergens', content);
}
