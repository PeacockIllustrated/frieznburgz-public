// --- wastage.js ---
// Manages wastage logging and display for the selected location.

import { db } from './firebase.js';
import { auth } from './firebase.js'; // Needed for auth.currentUser.email for logging who made the entry
import { getSelectedLocation } from './config.js';
import { getCurrentStockItems, renderStockManagementPage } from './stock.js'; // To get item list for dropdown and trigger stock re-render
import { createWasteLogItemHtml } from './wastage-template.js'; // Template for individual waste log items

// --- DOM Elements ---
const wastageLogContent = document.getElementById('wastageLogContent'); // Where dynamic content goes


/**
 * Renders the Wastage Log page content.
 * Populates dropdowns and loads recent waste entries for the selected location.
 */
export async function renderWastageLogPage() {
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        wastageLogContent.innerHTML = '<p>Please select a location first to log waste.</p>';
        return;
    }

    const locationDisplayName = selectedLocationId.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // Set up the basic HTML structure for the wastage page
    // Important: We rebuild the wastage-card HTML structure each time to ensure fresh event listeners.
    wastageLogContent.innerHTML = `
        <h3 class="subsection-title">Wastage Log for ${locationDisplayName}</h3>
        <div class="wastage-card">
            <div class="wastage-input-group">
                <div class="select-wrapper">
                    <select id="wasteItemSelect" class="waste-select"></select>
                    <i class="fas fa-chevron-down select-arrow"></i>
                </div>
                <div class="select-wrapper">
                    <select id="wasteQtySelect" class="waste-select"></select>
                    <i class="fas fa-chevron-down select-arrow"></i>
                </div>
                <button id="logWasteBtn" class="log-waste-button" title="Log Waste">
                    <i class="fas fa-trash-alt trash-icon"></i>
                </button>
            </div>
            <h4 class="wastage-log-heading">Waste Log (Prev. 7 Days)</h4>
            <ul class="waste-log-list" id="wasteLogList">
                <!-- Waste log entries will be dynamically loaded here -->
            </ul>
        </div>
    `;

    // Get references to the newly created DOM elements within this page
    const currentWasteItemSelect = document.getElementById('wasteItemSelect');
    const currentWasteQtySelect = document.getElementById('wasteQtySelect');
    const currentLogWasteBtn = document.getElementById('logWasteBtn');
    const currentWasteLogList = document.getElementById('wasteLogList');


    populateWasteDropdowns(currentWasteItemSelect, currentWasteQtySelect);
    currentLogWasteBtn.addEventListener('click', () => handleLogWaste(currentWasteItemSelect, currentWasteQtySelect, currentWasteLogList));
    await loadWasteLog(currentWasteLogList); // Load initial log entries

    console.log(`Wastage log page rendered for ${selectedLocationId}.`);
}

/**
 * Populates the item and quantity dropdowns for waste logging.
 * @param {HTMLSelectElement} itemSelect - The item select element.
 * @param {HTMLSelectElement} qtySelect - The quantity select element.
 */
function populateWasteDropdowns(itemSelect, qtySelect) {
    const items = getCurrentStockItems(); // Get current items from stock.js

    itemSelect.innerHTML = '<option value="" disabled selected>Select Item</option>';
    // Sort items alphabetically for easier selection
    const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
    sortedItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        itemSelect.appendChild(option);
    });

    qtySelect.innerHTML = '<option value="" disabled selected>Select Qty</option>';
    for (let i = 1; i <= 50; i++) { // Max 50 units for waste, adjust as needed
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        qtySelect.appendChild(option);
    }
}

/**
 * Handles the logging of wasted items.
 * @param {HTMLSelectElement} itemSelect - The item select element.
 * @param {HTMLSelectElement} qtySelect - The quantity select element.
 * @param {HTMLUListElement} logList - The waste log list element.
 */
async function handleLogWaste(itemSelect, qtySelect, logList) {
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        alert('No location selected. Cannot log waste.');
        return;
    }

    const selectedItemId = itemSelect.value;
    const wastedQty = parseInt(qtySelect.value, 10);

    if (!selectedItemId || isNaN(wastedQty) || wastedQty <= 0) {
        alert('Please select an item and a valid quantity for waste.');
        return;
    }

    const items = getCurrentStockItems();
    const item = items.find(i => i.id === selectedItemId);
    if (!item) {
        alert('Selected item not found in inventory.');
        return;
    }

    const reason = prompt(`Reason for wasting ${wastedQty} ${item.unit || 'units'} of ${item.name}?`);
    if (reason === null || reason.trim() === '') {
        alert('Waste not logged. A reason for wastage is required.');
        return;
    }

    try {
        // Add waste log entry to the specific location's subcollection
        await db.collection('locations').doc(selectedLocationId).collection('wastage_log').add({
            item: item.name,
            itemId: item.id,
            quantity: wastedQty,
            unit: item.unit || 'units',
            reason: reason,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Use server timestamp for accuracy
            updatedBy: auth.currentUser ? auth.currentUser.email : 'Unknown User' // Log who made the entry
        });

        // Deduct from item's current stock in the specific location's subcollection
        const itemDocRef = db.collection('locations').doc(selectedLocationId).collection('items').doc(item.id);
        await itemDocRef.update({
            currentStock: firebase.firestore.FieldValue.increment(-wastedQty)
        });

        alert(`Logged ${wastedQty} of ${item.name} as wasted for ${selectedLocationId.replace(/_/g, ' ')}.`);
        itemSelect.value = ''; // Reset dropdowns
        qtySelect.value = '';
        await renderStockManagementPage(); // Trigger stock page re-render to update stock levels
        await loadWasteLog(logList);   // Reload waste log to show new entry
    } catch (error) {
        console.error('Error logging waste:', error);
        alert('Failed to log waste. Please try again. Check Firebase permissions.');
    }
}

/**
 * Loads and displays recent waste log entries for the selected location.
 * @param {HTMLUListElement} logList - The waste log list element to populate.
 */
async function loadWasteLog(logList) {
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        logList.innerHTML = '<li>No location selected.</li>';
        return;
    }

    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoTimestamp = firebase.firestore.Timestamp.fromDate(sevenDaysAgo);

        const querySnapshot = await db.collection('locations').doc(selectedLocationId).collection('wastage_log')
            .where('timestamp', '>=', sevenDaysAgoTimestamp)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        logList.innerHTML = ''; // Clear previous log entries
        if (querySnapshot.empty) {
            const li = document.createElement('li');
            li.textContent = 'No waste logged in the last 7 days for this location.';
            logList.appendChild(li);
        } else {
            querySnapshot.forEach(doc => {
                const logEntry = doc.data();
                const itemHtml = createWasteLogItemHtml(logEntry);
                logList.insertAdjacentHTML('beforeend', itemHtml);
            });
        }
    } catch (error) {
        console.error('Error loading waste log:', error);
        logList.innerHTML = `<li style="color:red;">Error loading waste log: ${error.message}</li>`;
    }
}
