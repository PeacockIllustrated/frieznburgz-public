// --- stock.js ---
// Manages stock item fetching, display, and updates for the selected location.

import { db } from './firebase.js';
import { auth } from './firebase.js'; // Needed for getting current user email for waste logging
import { getSelectedLocation, locations } from './config.js'; // Import locations for global item fetching
import { createStockItemHtml } from './stock-template.js'; // Template for individual stock items

// --- DOM Elements ---
const stockManagementContent = document.getElementById('stockManagementContent'); // Main content area for stock page

let currentItemsData = []; // Store current loaded items for the selected location
// NEW: Object to track pending changes for items, structured by categoryId
// { categoryId: { itemId: newStockValue, ... }, ... }
let pendingStockChanges = {};

/**
 * Renders the Stock Management page content.
 * Fetches and displays stock items for the currently selected location.
 */
export async function renderStockManagementPage() {
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        stockManagementContent.innerHTML = '<p>Please select a location first to view stock.</p>';
        return;
    }

    const locationDisplayName = selectedLocationId.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // Check for unconfirmed changes before re-rendering the whole page
    const hasUnconfirmedChanges = Object.keys(pendingStockChanges).some(catId => Object.keys(pendingStockChanges[catId]).length > 0);
    if (hasUnconfirmedChanges) {
        // Option: Warn user or try to restore changes.
        // For simplicity, for now, we'll just log and proceed.
        // A more robust solution might use a confirmation dialog here.
        console.warn('Re-rendering Stock Management page with unconfirmed changes. Changes will be lost if not committed.');
        // Clear pending changes as they will be re-fetched/overwritten from Firestore anyway
        pendingStockChanges = {};
    }

    stockManagementContent.innerHTML = `
        <h3 class="subsection-title">Inventory for ${locationDisplayName}</h3>
        <div id="stockItemsGrid" class="stock-items-grid">
            <!-- Dynamic category cards will be inserted here -->
        </div>
    `;

    const stockItemsGrid = document.getElementById('stockItemsGrid');

    try {
        const itemsRef = db.collection('locations').doc(selectedLocationId).collection('items');
        const querySnapshot = await itemsRef.orderBy('category').orderBy('name').get();
        currentItemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (currentItemsData.length === 0) {
            stockItemsGrid.innerHTML = '<p>No stock items found for this location. Please add items via settings or import script.</p>';
            return;
        }

        // Group items by category
        const categorizedItems = currentItemsData.reduce((acc, item) => {
            const categoryKey = item.category || 'Uncategorized';
            if (!acc[categoryKey]) {
                acc[categoryKey] = [];
            }
            acc[categoryKey].push(item);
            return acc;
        }, {});

        for (const categoryName of Object.keys(categorizedItems).sort()) {
            const categoryItems = categorizedItems[categoryName];
            const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '_'); // Simple ID for category

            const categoryCardDiv = document.createElement('div');
            categoryCardDiv.classList.add('category-card');
            categoryCardDiv.dataset.categoryId = categoryId; // Store category ID

            categoryCardDiv.innerHTML = `
                <div class="category-header">
                    <h3 class="category-title">${categoryName}</h3>
                    <i class="fas fa-edit edit-icon" title="Edit category items (future)"></i>
                    <i class="fas fa-chevron-down accordion-icon"></i>
                </div>
                <div class="item-list" id="itemList-${categoryId}">
                    <!-- Items will be appended here -->
                </div>
                <div class="category-footer">
                    <button class="auth-button confirm-changes-btn" id="confirm-${categoryId}" disabled>Confirm Changes</button>
                </div>
            `;
            stockItemsGrid.appendChild(categoryCardDiv);

            const itemListContainer = categoryCardDiv.querySelector('.item-list');

            categoryItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('stock-item');
                itemDiv.dataset.itemId = item.id;
                itemDiv.dataset.categoryId = categoryId; // Store category ID on item for easier lookup
                // Pass current stock from `currentItemsData` to template directly
                itemDiv.innerHTML = createStockItemHtml(item);
                itemListContainer.appendChild(itemDiv);

                const decrementBtn = itemDiv.querySelector('.decrement-btn');
                const incrementBtn = itemDiv.querySelector('.increment-btn');
                const stockInput = itemDiv.querySelector('.stock-input');
                const reorderBtn = itemDiv.querySelector('.reorder-btn');

                if (decrementBtn) decrementBtn.addEventListener('click', () => updateLocalStock(item.id, categoryId, -1, stockInput, itemDiv));
                if (incrementBtn) incrementBtn.addEventListener('click', () => updateLocalStock(item.id, categoryId, 1, stockInput, itemDiv));
                if (stockInput) stockInput.addEventListener('change', () => updateLocalStock(item.id, categoryId, 0, stockInput, itemDiv));
                if (reorderBtn) reorderBtn.addEventListener('click', () => messageSupplier(item));
            });

            // Attach listener for the new Confirm Changes button
            const confirmBtn = document.getElementById(`confirm-${categoryId}`);
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => handleConfirmCategoryChanges(categoryId, confirmBtn));
            }
        }

        initializeStockAccordion();
        console.log(`Stock items loaded and rendered for ${selectedLocationId}.`);

    } catch (error) {
        console.error('Error rendering stock management page or loading items:', error);
        stockManagementContent.innerHTML = `<h3 class="subsection-title">Inventory for ${locationDisplayName}</h3><p style="color:red;">Error loading stock items: ${error.message}. Please check console and Firebase permissions.</p>`;
    }
}

/**
 * Initializes accordion behavior for stock categories on mobile.
 */
function initializeStockAccordion() {
    const categoryHeaders = document.querySelectorAll('.category-header');
    categoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const categoryCard = header.closest('.category-card');
            if (categoryCard) {
                categoryCard.classList.toggle('active');
            }
        });
    });
    console.log('Stock accordion initialized for category headers.');
}

/**
 * Updates the stock level for a specific item in Firestore.
 * This function is now multi-location aware.
 * @param {string} itemId - The ID of the item document.
 * @param {number} change - The amount to change stock by (+1, -1) or 0 for manual input.
 * @param {HTMLInputElement} inputElement - The input field element.
 * @deprecated - Replaced by updateLocalStock for local changes before batch commit.
 */
// async function updateStock(itemId, change, inputElement) { /* ... old function ... */ }


/**
 * Updates the stock level for a specific item locally and tracks it for batch commit.
 * @param {string} itemId - The ID of the item document.
 * @param {string} categoryId - The ID of the category this item belongs to.
 * @param {number} change - The amount to change stock by (+1, -1) or 0 for manual input.
 * @param {HTMLInputElement} inputElement - The input field element.
 * @param {HTMLElement} itemDiv - The parent div for the item, to apply visual feedback.
 */
async function updateLocalStock(itemId, categoryId, change, inputElement, itemDiv) {
    let newStockValue;

    if (change === 0) { // Manual input change (user typed a value)
        newStockValue = parseInt(inputElement.value, 10);
        if (isNaN(newStockValue) || newStockValue < 0) {
            alert('Please enter a valid stock quantity (non-negative number).');
            // Revert input to last known valid state (from currentItemsData or pending changes)
            const currentItem = currentItemsData.find(item => item.id === itemId);
            inputElement.value = pendingStockChanges[categoryId]?.[itemId] || currentItem?.currentStock || 0;
            return;
        }
    } else { // Increment/Decrement button click
        let currentLocalStock = parseInt(inputElement.value, 10);
        if (isNaN(currentLocalStock)) { // If input is empty, start from the current Firestore value
            const currentItem = currentItemsData.find(item => item.id === itemId);
            currentLocalStock = currentItem ? currentItem.currentStock : 0;
        }
        newStockValue = currentLocalStock + change;
        if (newStockValue < 0) newStockValue = 0; // Prevent negative stock
    }

    inputElement.value = newStockValue; // Update UI immediately

    // Initialize category entry if it doesn't exist
    if (!pendingStockChanges[categoryId]) {
        pendingStockChanges[categoryId] = {};
    }
    pendingStockChanges[categoryId][itemId] = newStockValue;

    // Add visual feedback to the item
    itemDiv.classList.add('has-pending-changes');

    // Enable the corresponding Confirm Changes button
    const confirmBtn = document.getElementById(`confirm-${categoryId}`);
    if (confirmBtn) {
        confirmBtn.disabled = false;
    }
    console.log(`Local update: Item ${itemId} in category ${categoryId} set to ${newStockValue}. Pending changes:`, pendingStockChanges);
}

/**
 * Handles confirming changes for a specific category by batch updating Firestore.
 * @param {string} categoryId - The ID of the category whose changes are to be confirmed.
 * @param {HTMLButtonElement} confirmBtn - The confirm button element.
 */
async function handleConfirmCategoryChanges(categoryId, confirmBtn) {
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        alert('No location selected. Cannot save stock changes.');
        return;
    }

    const categoryChanges = pendingStockChanges[categoryId];
    if (!categoryChanges || Object.keys(categoryChanges).length === 0) {
        console.log('No pending changes for this category.');
        confirmBtn.disabled = true; // Ensure disabled if no changes
        return;
    }

    confirmBtn.textContent = 'Saving...';
    confirmBtn.disabled = true; // Disable during saving
    confirmBtn.classList.add('saving'); // Add saving visual feedback

    const batch = db.batch();
    let numChanges = 0;

    for (const itemId in categoryChanges) {
        if (Object.prototype.hasOwnProperty.call(categoryChanges, itemId)) {
            const newStockValue = categoryChanges[itemId];
            const itemDocRef = db.collection('locations').doc(selectedLocationId).collection('items').doc(itemId);
            batch.update(itemDocRef, { currentStock: newStockValue });
            numChanges++;
        }
    }

    try {
        await batch.commit();
        console.log(`Successfully committed ${numChanges} changes for category ${categoryId}.`);

        // Clear confirmed changes
        delete pendingStockChanges[categoryId];

        // Remove visual feedback from affected items by re-rendering the whole page
        // This ensures currentItemsData is perfectly in sync with Firestore
        await renderStockManagementPage();
        console.log('Stock management page re-rendered after category commit.');

        // The re-render will reset button states, so no need to explicitly reset text/class here

    } catch (error) {
        console.error(`Error committing changes for category ${categoryId}:`, error);
        alert(`Failed to save changes for ${categoryId}. Please try again: ${error.message}`);

        confirmBtn.textContent = 'Confirm Changes';
        confirmBtn.disabled = false; // Re-enable on error
        confirmBtn.classList.remove('saving'); // Remove saving visual feedback

        // Restore visual feedback for items that failed
        // For simplicity, we'll just re-render on error, which will show the old state if the save failed
        await renderStockManagementPage();
    }
}


/**
 * Generates an email to the supplier for reordering a specific item.
 * @param {Object} item - The item object to reorder.
 */
function messageSupplier(item) {
    const selectedLocationId = getSelectedLocation();
    const locationName = selectedLocationId.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const recipient = 'supplier@example.com'; // Placeholder: Replace with actual supplier email or dynamic lookup
    const subject = `Order Request: ${item.name} for ${locationName} (Friez n Burgz)`;
    const body = `Dear Supplier,\n\nWe would like to order ${item.reorderQuantity || '[QTY]'} ${item.unit || 'units'} of ${item.name}.\n\nThis order is for our ${locationName} location.\nOur current stock is ${item.currentStock} ${item.unit || 'units'}.\n\nPlease let us know the availability and estimated delivery time.\n\nThank you,\nFriez n Burgz Management (${locationName})`;

    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    alert(`Drafting email to supplier for ${item.name} (Location: ${locationName}). Please check your email client. Remember, a human must approve this order.`);
}

/**
 * Exposes the currentItemsData array to other modules (like wastage.js) if needed.
 * @returns {Array} An array of current stock items for the selected location.
 */
export function getCurrentStockItems() {
    return currentItemsData;
}

/**
 * Fetches all unique stock items from all locations.
 * This is useful for global lists, e.g., for suppliers.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of unique item objects.
 */
export async function getAllUniqueStockItems() {
    console.log('stock.js: Fetching all unique items from all locations...');
    const uniqueItemsMap = new Map(); // Use a Map to store unique items by their ID
    const allLocations = locations; // Get locations from config.js

    try {
        for (const location of allLocations) {
            const itemsRef = db.collection('locations').doc(location.id).collection('items');
            const querySnapshot = await itemsRef.get();
            querySnapshot.forEach(doc => {
                const item = { id: doc.id, ...doc.data() };
                // Only add if not already present, or if new data is more complete
                if (!uniqueItemsMap.has(item.id)) {
                    uniqueItemsMap.set(item.id, item);
                }
            });
        }
        const uniqueItemsArray = Array.from(uniqueItemsMap.values());
        console.log(`stock.js: Fetched ${uniqueItemsArray.length} unique items across all locations. Sample:`, uniqueItemsArray.slice(0, 5)); // Log a sample
        // Optionally sort them for consistent display
        return uniqueItemsArray.sort((a, b) => a.name.localeCompare(b.name));

    } catch (error) {
        console.error('stock.js: Error fetching all unique stock items:', error);
        return []; // Return empty array on error
    }
}
