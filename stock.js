// --- stock.js ---
// Manages stock item fetching, display, and updates for the selected location.

import { db } from './firebase.js';
import { auth } from './firebase.js'; // Needed for getting current user email for waste logging
import { getSelectedLocation, locations } from './config.js'; // Import locations for global item fetching
import { createStockItemHtml } from './templates/stock-template.js'; // Template for individual stock items

// --- DOM Elements ---
const stockManagementContent = document.getElementById('stockManagementContent'); // Main content area for stock page

let currentItemsData = []; // Store current loaded items for the selected location
let pendingStockChanges = {}; // { categoryId: { itemId: { newStock: value, oldStock: value }, ... }, ... }

// NEW: Global variable to store the last transaction group ID and its timestamp for the current user
// This helps in grouping consecutive changes by the same user.
let lastTransactionGroup = {
    id: null,
    timestamp: null,
    userId: null // To ensure grouping is per user
};
const TRANSACTION_GROUP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Generates a new transaction group ID or reuses a recent one.
 * @returns {string} The transaction group ID.
 */
function getOrCreateTransactionGroupId() {
    const currentUserEmail = auth.currentUser ? auth.currentUser.email : 'anonymous';
    const now = new Date();

    // Check if the last transaction was by the same user and within the time window
    if (lastTransactionGroup.id &&
        lastTransactionGroup.userId === currentUserEmail &&
        (now.getTime() - lastTransactionGroup.timestamp.getTime()) < TRANSACTION_GROUP_WINDOW_MS) {
        lastTransactionGroup.timestamp = now; // Update timestamp to extend the window
        return lastTransactionGroup.id;
    } else {
        // Create a new transaction group ID
        const newId = `txn_${currentUserEmail.split('@')[0]}_${now.getTime()}`;
        lastTransactionGroup = {
            id: newId,
            timestamp: now,
            userId: currentUserEmail
        };
        return newId;
    }
}


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

    const hasUnconfirmedChanges = Object.keys(pendingStockChanges).some(catId => Object.keys(pendingStockChanges[catId]).length > 0);
    if (hasUnconfirmedChanges) {
        console.warn('Re-rendering Stock Management page with unconfirmed changes. Changes will be lost if not committed.');
        // Clear pending changes as they will be re-fetched/overwritten from Firestore anyway
        pendingStockChanges = {};
    }

    stockManagementContent.innerHTML = `
        <h3 class="subsection-title">Inventory for ${locationDisplayName}</h3>
        <div id="stockItemsGrid" class="stock-items-grid">
            <!-- Dynamic category cards will be inserted here -->
        </div>
        <div class="stock-log-section">
            <h3 class="subsection-title">Recent Stock Activity</h3>
            <div id="stockActivityLog" class="stock-activity-log">
                <p>Loading recent activity...</p>
            </div>
        </div>
    `;

    const stockItemsGrid = document.getElementById('stockItemsGrid');
    const stockActivityLog = document.getElementById('stockActivityLog'); // NEW: Stock Activity Log container

    try {
        const itemsRef = db.collection('locations').doc(selectedLocationId).collection('items');
        const querySnapshot = await itemsRef.orderBy('category').orderBy('name').get();
        currentItemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (currentItemsData.length === 0) {
            stockItemsGrid.innerHTML = '<p>No stock items found for this location. Please add items via settings or import script.</p>';
        } else {
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
                    <div class="category-header" data-item-count="${categoryItems.length}">
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
                    itemDiv.dataset.categoryId = categoryId;
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

                const confirmBtn = document.getElementById(`confirm-${categoryId}`);
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', () => handleConfirmCategoryChanges(categoryId, confirmBtn));
                }
            }
        }

        initializeStockAccordion();

        // NEW: Load and display stock activity log
        await loadStockActivityLog(stockActivityLog);

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
}


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
    const currentItem = currentItemsData.find(item => item.id === itemId);
    const oldStockValue = currentItem ? currentItem.currentStock : 0; // Get the original stock value

    if (change === 0) { // Manual input change (user typed a value)
        newStockValue = parseInt(inputElement.value, 10);
        if (isNaN(newStockValue) || newStockValue < 0) {
            alert('Please enter a valid stock quantity (non-negative number).');
            // Revert input to last known valid state (from currentItemsData or pending changes)
            inputElement.value = pendingStockChanges[categoryId]?.[itemId]?.newStock || oldStockValue;
            return;
        }
    } else { // Increment/Decrement button click
        let currentLocalStock = parseInt(inputElement.value, 10);
        if (isNaN(currentLocalStock)) { // If input is empty, start from the current Firestore value
            currentLocalStock = oldStockValue; // Fallback to original if input is empty
        }
        newStockValue = currentLocalStock + change;
        if (newStockValue < 0) newStockValue = 0;
    }

    inputElement.value = newStockValue; // Update UI immediately

    // Initialize category entry if it doesn't exist
    if (!pendingStockChanges[categoryId]) {
        pendingStockChanges[categoryId] = {};
    }

    // Store old and new stock for logging later
    if (!pendingStockChanges[categoryId][itemId]) {
        // If this is the first change for this item in this batch, record its original stock
        pendingStockChanges[categoryId][itemId] = {
            newStock: newStockValue,
            oldStock: oldStockValue // Store the original stock only once per batch of changes
        };
    } else {
        // If it's a subsequent change for the same item in the same batch, just update newStock
        pendingStockChanges[categoryId][itemId].newStock = newStockValue;
    }


    // Add visual feedback to the item
    itemDiv.classList.add('has-pending-changes');

    // Enable the corresponding Confirm Changes button
    const confirmBtn = document.getElementById(`confirm-${categoryId}`);
    if (confirmBtn) {
        confirmBtn.disabled = false;
    }
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
        confirmBtn.disabled = true;
        return;
    }

    confirmBtn.textContent = 'Saving...';
    confirmBtn.disabled = true;
    confirmBtn.classList.add('saving');

    const stockUpdateBatch = db.batch(); // Batch for stock updates
    const transactionGroupId = getOrCreateTransactionGroupId(); // Get or create transaction group ID
    const logEntries = [];
    const changedItemIds = []; // To track items for which stock was updated

    for (const itemId in categoryChanges) {
        if (Object.prototype.hasOwnProperty.call(categoryChanges, itemId)) {
            const { newStock, oldStock } = categoryChanges[itemId];
            const itemDocRef = db.collection('locations').doc(selectedLocationId).collection('items').doc(itemId);
            
            // Only update if stock actually changed
            if (newStock !== oldStock) {
                stockUpdateBatch.update(itemDocRef, { currentStock: newStock });
                changedItemIds.push(itemId);

                // Prepare log entry for stock_log collection
                const itemDetails = currentItemsData.find(item => item.id === itemId);
                logEntries.push({
                    itemId: itemId,
                    itemName: itemDetails ? itemDetails.name : 'Unknown Item',
                    unit: itemDetails ? itemDetails.unit : 'units',
                    changeAmount: newStock - oldStock, // Positive for add, negative for remove
                    oldStock: oldStock,
                    newStock: newStock,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: auth.currentUser ? auth.currentUser.email : 'Unknown User',
                    locationId: selectedLocationId,
                    transactionGroupId: transactionGroupId // Group changes
                });
            }
        }
    }

    if (changedItemIds.length === 0) {
        delete pendingStockChanges[categoryId]; // Clear even if no net change
        await renderStockManagementPage(); // Re-render to clear highlights
        return;
    }

    try {
        await stockUpdateBatch.commit(); // Commit stock updates first

        // Now add log entries using a separate batch for the stock_log collection
        const logBatch = db.batch(); // CORRECTED: New batch for log entries
        logEntries.forEach(logEntry => {
            const newLogDocRef = db.collection('locations').doc(selectedLocationId).collection('stock_log').doc(); // Create a new doc reference
            logBatch.set(newLogDocRef, logEntry); // Use set with the new doc reference
        });
        await logBatch.commit(); // Commit log entries

        delete pendingStockChanges[categoryId]; // Clear confirmed changes

        // Remove visual feedback from affected items by re-rendering the whole page
        // This ensures currentItemsData is perfectly in sync with Firestore
        await renderStockManagementPage();

    } catch (error) {
        console.error(`Error committing changes for category ${categoryId}:`, error);
        alert(`Failed to save changes for ${categoryId}. Please try again: ${error.message}`);

        confirmBtn.textContent = 'Confirm Changes';
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('saving');

        // On error, re-render to revert to the correct state from Firestore and re-enable input
        await renderStockManagementPage();
    }
}

/**
 * Loads and displays recent stock activity log entries.
 * @param {HTMLElement} container - The DOM element to append log entries to.
 */
async function loadStockActivityLog(container) {
    container.innerHTML = '<p>Loading recent activity...</p>';
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        container.innerHTML = '<p>No location selected to load activity log.</p>';
        return;
    }

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoTimestamp = firebase.firestore.Timestamp.fromDate(thirtyDaysAgo);

        const logRef = db.collection('locations').doc(selectedLocationId).collection('stock_log');
        const querySnapshot = await logRef
            .where('timestamp', '>=', thirtyDaysAgoTimestamp)
            .orderBy('timestamp', 'desc')
            .limit(20) // Display up to 20 recent activity entries
            .get();

        container.innerHTML = ''; // Clear loading message

        if (querySnapshot.empty) {
            container.innerHTML = '<p>No recent stock activity logged for this location.</p>';
            return;
        }

        // Group log entries by transactionGroupId and then by timestamp
        const groupedLog = {};
        querySnapshot.forEach(doc => {
            const entry = doc.data();
            const groupKey = entry.transactionGroupId || 'no_group'; // Fallback for old/ungrouped entries
            if (!groupedLog[groupKey]) {
                groupedLog[groupKey] = [];
            }
            groupedLog[groupKey].push(entry);
        });

        // Sort groups by the timestamp of their first entry (most recent first)
        const sortedGroupKeys = Object.keys(groupedLog).sort((a, b) => {
            // Ensure timestamp is a valid object before calling toMillis()
            const timeA = groupedLog[a][0].timestamp && typeof groupedLog[a][0].timestamp.toMillis === 'function' ? groupedLog[a][0].timestamp.toMillis() : 0;
            const timeB = groupedLog[b][0].timestamp && typeof groupedLog[b][0].timestamp.toMillis === 'function' ? groupedLog[b][0].timestamp.toMillis() : 0;
            return timeB - timeA;
        });

        sortedGroupKeys.forEach(groupKey => {
            const group = groupedLog[groupKey].sort((a, b) => { // Sort entries within group by timestamp
                const timeA = a.timestamp && typeof a.timestamp.toMillis === 'function' ? a.timestamp.toMillis() : 0;
                const timeB = b.timestamp && typeof b.timestamp.toMillis === 'function' ? b.timestamp.toMillis() : 0;
                return timeB - timeA;
            });
            const firstEntry = group[0];
            const timestamp = firstEntry.timestamp ? firstEntry.timestamp.toDate().toLocaleString() : 'N/A';
            const updatedBy = firstEntry.updatedBy ? firstEntry.updatedBy.split('@')[0] : 'Unknown User'; // Safely get user name

            let groupHeader = '';
            if (groupKey === 'no_group') {
                groupHeader = `<span>${timestamp} - Individual Change by ${updatedBy}</span>`;
            } else {
                groupHeader = `<span>${timestamp} - Batch Update by ${updatedBy}</span>`;
            }

            const groupDiv = document.createElement('div');
            groupDiv.classList.add('stock-log-group');
            groupDiv.innerHTML = `<h4 class="log-group-header">${groupHeader}</h4><ul></ul>`;
            const ul = groupDiv.querySelector('ul');

            group.forEach(entry => {
                const changeSign = entry.changeAmount > 0 ? '+' : '';
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="log-item-name">${entry.itemName} (${entry.unit})</span>
                    <span class="log-stock-change ${entry.changeAmount > 0 ? 'increase' : 'decrease'}">${changeSign}${entry.changeAmount}</span>
                    <span class="log-stock-value">(${entry.oldStock} → ${entry.newStock})</span>
                `;
                ul.appendChild(li);
            });
            container.appendChild(groupDiv);
        });

    } catch (error) {
        console.error('Error loading stock activity log:', error);
        container.innerHTML = `<p style="color:red;">Error loading activity log: ${error.message}</p>`;
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
        // Optionally sort them for consistent display
        return uniqueItemsArray.sort((a, b) => a.name.localeCompare(b.name));

    } catch (error) {
        console.error('stock.js: Error fetching all unique stock items:', error);
        return []; // Return empty array on error
    }
}
