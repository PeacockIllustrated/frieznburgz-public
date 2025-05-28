// --- stock.js ---
// Manages stock item fetching, display, and updates for the selected location.

import { db } from './firebase.js';
import { getSelectedLocation } from './config.js';
import { createStockItemHtml } from './stock-template.js';

// --- DOM Elements ---
// References to the item lists within the main dashboard content
const stockManagementPage = document.getElementById('stockManagementPage'); // The section wrapper
const stockCategoryContainers = {
    'Meat': document.getElementById('meatItemList'),
    'Cheeses': document.getElementById('cheesesItemList'),
    'Specialz Ingredients': document.getElementById('specialsItemList'),
    'Filletz Ingredients': document.getElementById('filletzItemList'),
    'Milkshakes of the Week': document.getElementById('milkshakesItemList'),
    'Produce & Vegetables': document.getElementById('produceItemList'),
    'Sauces & Condiments': document.getElementById('saucesItemList'),
    'Breads & Baked Goods': document.getElementById('breadsItemList'),
    'Other Essentials': document.getElementById('otherItemList')
};

let currentItemsData = []; // Store current loaded items for the selected location

/**
 * Renders the Stock Management page content.
 * Fetches and displays stock items for the currently selected location.
 */
export async function renderStockManagementPage() {
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        stockManagementPage.innerHTML = '<h2 class="page-title">Stock Management</h2><p>Please select a location first to view stock.</p>';
        return;
    }

    stockManagementPage.innerHTML = `
        <h2 class="page-title">Stock Management</h2>
        <p>Current inventory for ${selectedLocationId.replace(/_/g, ' ')}.</p>
        <div id="stockItemsContainer" class="stock-items-grid">
            <!-- Category cards will be cloned/dynamically added here -->
        </div>
    `;

    const stockItemsContainer = document.getElementById('stockItemsContainer');

    // Clear previous contents of dynamic item lists
    Object.values(stockCategoryContainers).forEach(container => {
        if (container) container.innerHTML = '';
    });

    try {
        // Fetch items from the specific location's subcollection
        const itemsRef = db.collection('locations').doc(selectedLocationId).collection('items');
        const querySnapshot = await itemsRef.orderBy('name').get();
        currentItemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (currentItemsData.length === 0) {
            stockItemsContainer.innerHTML = '<p>No stock items found for this location. Please add items via settings or import script.</p>';
            return;
        }

        // Dynamically add category cards if they are not already in HTML or re-populate them
        // For simplicity, we'll assume the category card HTML structure is already in index.html
        // and we just populate the item lists within them.
        // If categories are truly dynamic, you'd generate the .category-card divs here too.

        // Clear all item lists before populating
        Object.values(stockCategoryContainers).forEach(list => {
            if (list) list.innerHTML = '';
        });

        currentItemsData.forEach(item => {
            const categoryListContainer = stockCategoryContainers[item.category];
            if (categoryListContainer) {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('stock-item'); // Add class for styling and event delegation
                itemDiv.dataset.itemId = item.id; // Store ID
                itemDiv.innerHTML = createStockItemHtml(item); // Populate with HTML from template

                categoryListContainer.appendChild(itemDiv);

                // Attach event listeners after element is in DOM
                const decrementBtn = itemDiv.querySelector('.decrement-btn');
                const incrementBtn = itemDiv.querySelector('.increment-btn');
                const stockInput = itemDiv.querySelector('.stock-input');
                const reorderBtn = itemDiv.querySelector('.reorder-btn');

                if (decrementBtn) decrementBtn.addEventListener('click', () => updateStock(item.id, -1, stockInput));
                if (incrementBtn) incrementBtn.addEventListener('click', () => updateStock(item.id, 1, stockInput));
                if (stockInput) stockInput.addEventListener('change', () => updateStock(item.id, 0, stockInput));
                if (reorderBtn) reorderBtn.addEventListener('click', () => messageSupplier(item));

            } else {
                console.warn(`Category container not found for: ${item.category}. Item: ${item.name}`);
            }
        });

        console.log(`Stock items loaded for ${selectedLocationId}.`);

    } catch (error) {
        console.error('Error rendering stock management page or loading items:', error);
        stockManagementPage.innerHTML = `<h2 class="page-title">Stock Management</h2><p style="color:red;">Error loading stock items: ${error.message}. Please check console.</p>`;
    }
}

/**
 * Updates the stock level for a specific item in Firestore.
 * This function is now multi-location aware.
 * @param {string} itemId - The ID of the item document.
 * @param {number} change - The amount to change stock by (+1, -1) or 0 for manual input.
 * @param {HTMLInputElement} inputElement - The input field element.
 */
async function updateStock(itemId, change, inputElement) {
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        alert('No location selected. Cannot update stock.');
        return;
    }

    const itemDocRef = db.collection('locations').doc(selectedLocationId).collection('items').doc(itemId);
    let newStockValue;

    if (change === 0) { // Manual input change
        newStockValue = parseInt(inputElement.value, 10);
        if (isNaN(newStockValue) || newStockValue < 0) {
            alert('Please enter a valid stock quantity (non-negative number).');
            renderStockManagementPage(); // Re-render to revert invalid input
            return;
        }
    } else { // Increment/Decrement button click
        const currentDisplayedStock = parseInt(inputElement.value, 10);
        newStockValue = currentDisplayedStock + change;
        if (newStockValue < 0) newStockValue = 0; // Prevent negative stock
    }

    try {
        await itemDocRef.update({ currentStock: newStockValue });
        // Re-render the entire stock page to reflect the update and correct stock indicators
        renderStockManagementPage();
        console.log(`Stock for ${itemId} at ${selectedLocationId} updated to ${newStockValue}`);
    } catch (error) {
        console.error('Error updating stock:', error);
        alert('Failed to update stock. Please check Firebase permissions or network.');
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
 * Exposes the currentItemsData array to other modules if needed (e.g., for waste dropdown).
 * @returns {Array} An array of current stock items for the selected location.
 */
export function getCurrentStockItems() {
    return currentItemsData;
}
