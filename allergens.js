// --- allergens.js ---
// Manages the rendering and logic for all allergen-related pages.
import { db, firebase } from './firebase.js';
import { getCurrentUser } from './user.js';
import { showToast } from './ui.js';
import { createPageHtml } from './allergens-template.js';
import { createAllergenEditorLayout, createAllergenGrid, createNotesSection } from './allergens-editor-template.js';
import { FSA_ALLERGENS, ALLERGEN_STATUS } from './constants.js';


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

// A cache for menu items to avoid re-fetching from Firestore unnecessarily
let menuItemsCache = [];
let selectedItemId = null;

export async function renderAllergenEditorPage() {
    // Set the main layout
    document.getElementById('allergenEditorPage').innerHTML = createPageHtml('Allergen Matrix Editor', createAllergenEditorLayout());

    // Fetch menu items and populate the list
    await fetchAndRenderMenuItems();

    // Add event listeners for search and filters
    const searchInput = document.getElementById('menuItemSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const activeFilter = document.getElementById('activeFilter');

    searchInput.addEventListener('input', () => renderMenuItemsList());
    categoryFilter.addEventListener('change', () => renderMenuItemsList());
    activeFilter.addEventListener('change', () => renderMenuItemsList());

    // Add event listener for the "New Menu Item" button
    document.getElementById('newMenuItemBtn').addEventListener('click', handleNewMenuItem);
}

async function fetchAndRenderMenuItems() {
    try {
        const snapshot = await db.collection('menuItems').orderBy('name').get();
        menuItemsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        populateCategoryFilter();
        renderMenuItemsList();
    } catch (error) {
        console.error("Error fetching menu items:", error);
        document.getElementById('menuItemsList').innerHTML = '<p class="error-message">Could not load menu items.</p>';
    }
}

function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(menuItemsCache.map(item => item.category))];

    // Clear existing options except the first one
    categoryFilter.innerHTML = '<option value="">All Categories</option>';

    categories.forEach(category => {
        if (category) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });
}

function renderMenuItemsList() {
    const listElement = document.getElementById('menuItemsList');
    const searchInput = document.getElementById('menuItemSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const activeFilter = document.getElementById('activeFilter').value;

    const filteredItems = menuItemsCache.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchInput);
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        const matchesActive = activeFilter === '' || String(item.active) === activeFilter;
        return matchesSearch && matchesCategory && matchesActive;
    });

    if (filteredItems.length === 0) {
        listElement.innerHTML = '<p class="no-results-message">No items match the criteria.</p>';
        return;
    }

    listElement.innerHTML = filteredItems.map(item => `
        <div class="list-item" data-id="${item.id}">
            <span>${item.name}</span>
            <span class="item-category">${item.category}</span>
        </div>
    `).join('');

    // Add click event listeners to each item
    listElement.querySelectorAll('.list-item').forEach(itemElement => {
        itemElement.addEventListener('click', () => {
            selectedItemId = itemElement.dataset.id;
            renderEditorPane(selectedItemId);

            // Highlight the selected item
            listElement.querySelectorAll('.list-item').forEach(el => el.classList.remove('active'));
            itemElement.classList.add('active');
        });
    });
}

function renderEditorPane(itemId) {
    const item = menuItemsCache.find(i => i.id === itemId);
    if (!item) {
        console.error(`Item with ID ${itemId} not found in cache.`);
        return;
    }

    // Show editor, hide welcome message
    document.getElementById('editorWelcome').style.display = 'none';
    document.getElementById('itemEditor').style.display = 'flex';

    // Populate editor fields
    document.getElementById('editorItemName').textContent = item.name;

    const editorForm = document.getElementById('editorForm');
    const allergenGridHtml = createAllergenGrid(FSA_ALLERGENS, item.allergens);
    const notesHtml = createNotesSection(item.notes);
    editorForm.innerHTML = allergenGridHtml + notesHtml;

    const lastEditedBy = item.lastEditedBy ? `by ${item.lastEditedBy}` : '';
    const lastEditedAt = item.lastEditedAt ? new Date(item.lastEditedAt.seconds * 1000).toLocaleString() : 'Never';
    document.getElementById('lastEdited').textContent = `Last Edited: ${lastEditedAt} ${lastEditedBy}`;

    // Add event listener to the save button, ensuring it's only added once
    const saveBtn = document.getElementById('saveChangesBtn');
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    newSaveBtn.addEventListener('click', handleSaveChanges);

    // Toolbar buttons
    const duplicateBtn = document.getElementById('duplicateMenuItemBtn');
    const newDuplicateBtn = duplicateBtn.cloneNode(true);
    duplicateBtn.parentNode.replaceChild(newDuplicateBtn, duplicateBtn);
    newDuplicateBtn.addEventListener('click', () => handleDuplicateMenuItem(itemId));

    const deactivateBtn = document.getElementById('deactivateMenuItemBtn');
    const newDeactivateBtn = deactivateBtn.cloneNode(true);
    deactivateBtn.parentNode.replaceChild(newDeactivateBtn, deactivateBtn);
    newDeactivateBtn.addEventListener('click', () => handleDeactivateMenuItem(itemId));
}

async function handleSaveChanges() {
    if (!selectedItemId) {
        showToast("No item selected.", "error");
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast("You must be logged in to save changes.", "error");
        return;
    }

    // --- 1. Gather Data ---
    const form = document.getElementById('editorForm');
    const allergens = {};
    let isValid = true;
    FSA_ALLERGENS.forEach(allergen => {
        const selectedOption = form.querySelector(`input[name="${allergen.id}"]:checked`);
        if (selectedOption && ALLERGEN_STATUS.includes(selectedOption.value)) {
            allergens[allergen.id] = selectedOption.value;
        } else {
            showToast(`Invalid status for ${allergen.name}.`, 'error');
            isValid = false;
        }
    });

    if (!isValid) return;

    const notes = document.getElementById('allergenNotes').value;

    const updateData = {
        allergens,
        notes,
        lastEditedAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastEditedBy: currentUser.displayName || currentUser.email,
    };

    // --- 2. Optimistic UI Update ---
    const originalItemIndex = menuItemsCache.findIndex(item => item.id === selectedItemId);
    const originalItem = { ...menuItemsCache[originalItemIndex] };

    // Create a temporary updated item for the UI
    const tempUpdatedItem = {
        ...originalItem,
        ...updateData,
        // Mock the timestamp for immediate UI feedback
        lastEditedAt: { seconds: Math.floor(Date.now() / 1000) }
    };
    menuItemsCache[originalItemIndex] = tempUpdatedItem;

    // Re-render the editor pane with the new data
    renderEditorPane(selectedItemId);
    showToast("Saving...", "info");


    // --- 3. Firestore Update ---
    try {
        await db.collection('menuItems').doc(selectedItemId).update(updateData);
        showToast("Changes saved successfully!", "success");
    } catch (error) {
        console.error("Error saving changes:", error);
        showToast("Failed to save changes. Reverting.", "error");

        // Revert optimistic update on failure
        menuItemsCache[originalItemIndex] = originalItem;
        renderEditorPane(selectedItemId);
    }
}

// --- Toolbar Button Handlers ---

function handleNewMenuItem() {
    const modalTitle = 'Create New Menu Item';
    const modalBody = `
        <div class="modal-input-group">
            <label for="newItemName">Item Name</label>
            <input type="text" id="newItemName" class="modal-input" placeholder="e.g., Classic Burger">
        </div>
        <div class="modal-input-group">
            <label for="newItemCategory">Category</label>
            <input type="text" id="newItemCategory" class="modal-input" placeholder="e.g., Burgers">
        </div>
    `;
    const modalFooter = '<button id="confirmNewItemBtn" class="auth-button">Create Item</button>';

    window.mainApp.openModal(modalTitle, modalBody, modalFooter);

    document.getElementById('confirmNewItemBtn').addEventListener('click', async () => {
        const name = document.getElementById('newItemName').value.trim();
        const category = document.getElementById('newItemCategory').value.trim();

        if (!name || !category) {
            showToast("Name and category are required.", "error");
            return;
        }

        const currentUser = getCurrentUser();
        const newItem = {
            name,
            category,
            active: true,
            allergens: FSA_ALLERGENS.reduce((acc, allergen) => {
                acc[allergen.id] = 'unknown';
                return acc;
            }, {}),
            notes: '',
            lastEditedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastEditedBy: currentUser.displayName || currentUser.email,
        };

        try {
            await db.collection('menuItems').add(newItem);
            showToast("New item created successfully!", "success");
            window.mainApp.closeModal();
            await fetchAndRenderMenuItems();
        } catch (error) {
            console.error("Error creating new item:", error);
            showToast("Failed to create new item.", "error");
        }
    });
}

async function handleDuplicateMenuItem(itemId) {
    const itemToDuplicate = menuItemsCache.find(item => item.id === itemId);
    if (!itemToDuplicate) {
        showToast("Cannot find item to duplicate.", "error");
        return;
    }

    if (!confirm(`Are you sure you want to duplicate "${itemToDuplicate.name}"?`)) {
        return;
    }

    const currentUser = getCurrentUser();
    const duplicatedItem = {
        ...itemToDuplicate,
        name: `${itemToDuplicate.name} (Copy)`,
        lastEditedAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastEditedBy: currentUser.displayName || currentUser.email,
    };
    delete duplicatedItem.id; // Remove the original ID

    try {
        const docRef = await db.collection('menuItems').add(duplicatedItem);
        showToast("Item duplicated successfully!", "success");
        await fetchAndRenderMenuItems();
        // Optionally, select the new item
        selectedItemId = docRef.id;
        renderMenuItemsList(); // To highlight the new item
        renderEditorPane(docRef.id);
    } catch (error) {
        console.error("Error duplicating item:", error);
        showToast("Failed to duplicate item.", "error");
    }
}

async function handleDeactivateMenuItem(itemId) {
    const itemToDeactivate = menuItemsCache.find(item => item.id === itemId);
    if (!itemToDeactivate) {
        showToast("Cannot find item to deactivate.", "error");
        return;
    }

    if (!confirm(`Are you sure you want to deactivate "${itemToDeactivate.name}"? This will hide it from the active list.`)) {
        return;
    }

    try {
        await db.collection('menuItems').doc(itemId).update({ active: false });
        showToast("Item deactivated.", "info");

        // Optimistically update cache
        const itemIndex = menuItemsCache.findIndex(item => item.id === itemId);
        menuItemsCache[itemIndex].active = false;

        // Clear the editor pane
        document.getElementById('itemEditor').style.display = 'none';
        document.getElementById('editorWelcome').style.display = 'block';
        selectedItemId = null;

        renderMenuItemsList();

    } catch (error) {
        console.error("Error deactivating item:", error);
        showToast("Failed to deactivate item.", "error");
    }
}

export async function renderAllergenVersionsPage() {
    const content = '<h2>Allergen Versions</h2><p>Admin-only: View and manage published versions of the allergen matrix.</p>';
    document.getElementById('allergenVersionsPage').innerHTML = createPageHtml('Allergen Versions', content);
}

export async function renderAllergenImportPage() {
    const content = '<h2>Import Allergens</h2><p>Admin-only: Bulk import or update allergen data.</p>';
    document.getElementById('allergenImportPage').innerHTML = createPageHtml('Import Allergens', content);
}
