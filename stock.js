// --- stock.js ---
// Manages stock item fetching, display, and updates for the selected location.

import { db } from './firebase.js';
import { auth } from './firebase.js'; // Needed for getting current user email for waste logging
import { getSelectedLocation, locations } from './config.js'; // Import locations for global item fetching
import { createStockItemHtml } from './stock-template.js'; // Template for individual stock items

// --- DOM Elements ---
const stockManagementContent = document.getElementById('stockManagementContent'); // Main content area for stock page

let currentItemsData = []; // Store current loaded items for the selected location

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

    // Clear previous content and set up base HTML structure for this page
    stockManagementContent.innerHTML = `
        <h3 class="subsection-title">Inventory for ${locationDisplayName}</h3>
        <div id="stockItemsGrid" class="stock-items-grid">
            <!-- Dynamic category cards will be inserted here -->
        </div>
    `;

    // IMPORTANT: Get the grid container *after* it's been injected into the DOM
    const stockItemsGrid = document.getElementById('stockItemsGrid');

    try {
        // Fetch items from the specific location's subcollection
        const itemsRef = db.collection('locations').doc(selectedLocationId).collection('items');
        const querySnapshot = await itemsRef.orderBy('category').orderBy('name').get(); // Order by category then name
        currentItemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (currentItemsData.length === 0) {
            stockItemsGrid.innerHTML = '<p>No stock items found for this location. Please add items via settings or import script.</p>';
            return;
        }

        // Group items by category
        const categorizedItems = currentItemsData.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});

        // Render each category card and its items
        for (const categoryName of Object.keys(categorizedItems).sort()) { // Sort categories alphabetically
            const categoryItems = categorizedItems[categoryName];

            // Create the category card HTML structure
            const categoryCardDiv = document.createElement('div');
            categoryCardDiv.classList.add('category-card');
            // Using template literals to inject the HTML directly
            categoryCardDiv.innerHTML = `
                <div class="category-header">
                    <h3 class="category-title">${categoryName}</h3>
                    <i class="fas fa-edit edit-icon" title="Edit category items (future)"></i>
                    <i class="fas fa-chevron-down accordion-icon"></i> <!-- New accordion icon -->
                </div>
                <div class="item-list">
                    <!-- Items will be appended here -->
                </div>
            `;
            stockItemsGrid.appendChild(categoryCardDiv); // Append card to the grid

            // IMPORTANT: Get reference to the item list container *inside* the newly created categoryCardDiv
            const itemListContainer = categoryCardDiv.querySelector('.item-list');

            categoryItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('stock-item');
                itemDiv.dataset.itemId = item.id; // Store ID for updates
                itemDiv.innerHTML = createStockItemHtml(item); // Populate with HTML from template

                itemListContainer.appendChild(itemDiv);

                // Attach event listeners to the newly created elements
                const decrementBtn = itemDiv.querySelector('.decrement-btn');
                const incrementBtn = itemDiv.querySelector('.increment-btn');
                const stockInput = itemDiv.querySelector('.stock-input');
                const reorderBtn = itemDiv.querySelector('.reorder-btn');

                // Ensure elements exist before adding listeners (defensive coding)
                if (decrementBtn) decrementBtn.addEventListener('click', () => updateStock(item.id, -1, stockInput));
                if (incrementBtn) incrementBtn.addEventListener('click', () => updateStock(item.id, 1, stockInput));
                if (stockInput) stockInput.addEventListener('change', () => updateStock(item.id, 0, stockInput));
                if (reorderBtn) reorderBtn.addEventListener('click', () => messageSupplier(item));
            });

            // Initialize the accordion state (all closed by default on mobile)
            // categoryCardDiv.classList.add('collapsed'); // All start collapsed on mobile
            // No, the initial state should be that the first one is open, the others closed
            // Or all start closed? Let's make them all start collapsed for cleanliness.
            // But we'll manage this in CSS for conditional display.
        }

        // Initialize accordion behavior after all category cards are rendered
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
                // Toggle 'active' class on the card
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
 */
async function updateStock(itemId, change, inputElement) {
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        alert('No location selected. Cannot update stock.');
        return;
    }

    const itemDocRef = db.collection('locations').doc(selectedLocationId).collection('items').doc(itemId);
    let newStockValue;

    if (change === 0) { // Manual input change (user typed a value)
        newStockValue = parseInt(inputElement.value, 10);
        if (isNaN(newStockValue) || newStockValue < 0) {
            alert('Please enter a valid stock quantity (non-negative number).');
            // Re-render to revert invalid input to last known good state from Firestore
            await renderStockManagementPage();
            return;
        }
    } else { // Increment/Decrement button click
        // Fetch the current stock from Firestore to ensure the calculation is based on the latest data
        const doc = await itemDocRef.get();
        if (!doc.exists) {
            console.error("Item document not found for stock update:", itemId);
            alert("Could not find item to update. Please refresh the page.");
            return;
        }
        let currentFirestoreStock = doc.data().currentStock;

        // Ensure currentFirestoreStock is a number, default to 0 if not
        if (typeof currentFirestoreStock !== 'number') {
            console.warn(`Firestore stock for ${itemId} is not a number: ${currentFirestoreStock}. Defaulting to 0 for calculation.`);
            currentFirestoreStock = 0;
        }

        newStockValue = currentFirestoreStock + change;
        if (newStockValue < 0) newStockValue = 0; // Prevent negative stock
    }

    try {
        await itemDocRef.update({ currentStock: newStockValue });
        console.log(`Firestore updated: Stock for ${itemId} at ${selectedLocationId} set to ${newStockValue}`);

        // Immediately update the specific input field to reflect the change visually
        inputElement.value = newStockValue;

        // Re-render the entire stock management page to update status indicators and ensure consistency
        await renderStockManagementPage();
        console.log(`Stock for ${itemId} at ${selectedLocationId} updated and page re-rendered.`);
    } catch (error) {
        console.error('Error updating stock:', error);
        alert('Failed to update stock. Please check Firebase permissions or network.');
        // On error, re-render to revert to the correct state from Firestore
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
