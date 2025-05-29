// --- dashboard.js ---
// Manages the rendering and logic for the Dashboard Overview page.

import { db } from './firebase.js';
import { auth } from './firebase.js'; // For logging user email for waste
import { getSelectedLocation, getLocationDisplayName } from './config.js';
import { createDashboardCardHtml, createCriticalItemHtml, createRecentWasteItemHtml } from './dashboard-template.js';
import { getCurrentStockItems } from './stock.js'; // To get the list of items for the modal dropdown
import { renderStockManagementPage } from './stock.js'; // To re-render stock page after adjustment

// --- DOM Elements ---
const dashboardPage = document.getElementById('dashboardPage');

// Modal Elements (NEW)
const universalModal = document.getElementById('universalModal');
const closeModalButton = universalModal.querySelector('.close-button');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalMessage = document.getElementById('modalMessage');
const modalFooter = document.getElementById('modalFooter');

// Event Listeners for Modal (NEW)
closeModalButton.addEventListener('click', closeModal);
universalModal.addEventListener('click', (event) => {
    if (event.target === universalModal) { // Close when clicking outside modal content
        closeModal();
    }
});

// Helper to open modal (NEW)
function openModal(title, bodyHtml, footerHtml = '', message = '') {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modalFooter.innerHTML = footerHtml;
    modalMessage.textContent = message;
    universalModal.style.display = 'flex'; // Show modal
    modalMessage.style.display = 'none'; // Hide message initially
}

// Helper to close modal (NEW)
function closeModal() {
    universalModal.style.display = 'none';
    modalTitle.textContent = '';
    modalBody.innerHTML = '';
    modalFooter.innerHTML = '';
    modalMessage.textContent = '';
}

/**
 * Renders the Dashboard Overview page.
 * Fetches relevant data and displays a summary of critical stock levels.
 */
export async function renderDashboardOverviewPage() {
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        dashboardPage.innerHTML = `
            <h2 class="page-title">Dashboard Overview</h2>
            <p>Welcome to your Friez n Burgz Admin Dashboard! Please select a location to view your dashboard insights.</p>
        `;
        return;
    }

    const locationName = getLocationDisplayName(selectedLocationId);

    // Initial structure with placeholders for dynamic content
    dashboardPage.innerHTML = `
        <h2 class="page-title">Dashboard Overview</h2>
        <p>Welcome to your Friez n Burgz Admin Dashboard for ${locationName}!</p>
        <div class="dashboard-summary-grid">
            <!-- Stock Overview Card -->
            <div class="dashboard-card stock-overview-card">
                <h3 class="card-title">Stock Overview</h3>
                <div id="stockSummary" class="stock-summary-visuals">
                    <p>Loading summary...</p>
                </div>
            </div>

            <!-- Critical Stock Alerts Card -->
            <div class="dashboard-card critical-stock-card">
                <h3 class="card-title">Critical Stock Alerts</h3>
                <div id="criticalStockList" class="item-list">
                    <p>Loading critical items...</p>
                </div>
            </div>

            <!-- Recent Wastage Log Card -->
            <div class="dashboard-card recent-wastage-card">
                <h3 class="card-title">Recent Wastage Log</h3>
                <ul id="recentWastageList" class="waste-log-list">
                    <p>Loading recent waste entries...</p>
                </ul>
            </div>

            <!-- Quick Actions Card (Buttons trigger modal) -->
            <div class="dashboard-card quick-actions-card">
                <h3 class="card-title">Quick Actions</h3>
                <div class="quick-actions-content">
                    <button class="auth-button quick-action-btn" id="quickAddStockBtn">Quick Add Stock</button>
                    <button class="auth-button quick-action-btn" id="quickLogWasteBtn">Quick Log Waste</button>
                    <button class="auth-button quick-action-btn disabled" disabled>Create Order (Coming Soon)</button>
                </div>
            </div>
        </div>
    `;

    const stockSummary = document.getElementById('stockSummary');
    const criticalStockList = document.getElementById('criticalStockList');
    const recentWastageList = document.getElementById('recentWastageList');
    const quickAddStockBtn = document.getElementById('quickAddStockBtn'); // NEW
    const quickLogWasteBtn = document.getElementById('quickLogWasteBtn'); // NEW

    // Attach event listeners for Quick Actions (NEW)
    quickAddStockBtn.addEventListener('click', () => showQuickAdjustmentModal('add'));
    quickLogWasteBtn.addEventListener('click', () => showQuickAdjustmentModal('waste'));

    // --- Fetch and Render Stock Data ---
    try {
        const itemsRef = db.collection('locations').doc(selectedLocationId).collection('items');
        const querySnapshot = await itemsRef.orderBy('category').orderBy('name').get();
        const allItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let criticalCount = 0;
        let lowCount = 0;
        let goodCount = 0;

        criticalStockList.innerHTML = ''; // Clear loading message

        if (allItems.length === 0) {
            criticalStockList.innerHTML = '<p>No stock items found for this location.</p>';
        } else {
            const criticalItems = allItems.filter(item => item.currentStock <= item.reorderPoint / 2);
            const lowItems = allItems.filter(item => item.currentStock > item.reorderPoint / 2 && item.currentStock <= item.reorderPoint);
            const goodItems = allItems.filter(item => item.currentStock > item.reorderPoint);

            criticalCount = criticalItems.length;
            lowCount = lowItems.length;
            goodCount = goodItems.length;

            if (criticalItems.length > 0) {
                criticalItems.forEach(item => {
                    criticalStockList.insertAdjacentHTML('beforeend', createCriticalItemHtml(item));
                });
            } else {
                criticalStockList.innerHTML = '<p>No critical stock alerts at the moment. Good job!</p>';
            }
        }

        // Render stock summary visuals using the counts
        stockSummary.innerHTML = `
            <div class="summary-top-row">
                ${createDashboardCardHtml('good', goodCount, 'Good Stock')}
                ${createDashboardCardHtml('low', lowCount, 'Low Stock')}
            </div>
            <div class="summary-bottom-row">
                ${createDashboardCardHtml('critical', criticalCount, 'Critical Stock')}
            </div>
        `;
        console.log(`Stock data loaded for dashboard. Critical: ${criticalCount}, Low: ${lowCount}, Good: ${goodCount}`);

    } catch (error) {
        console.error('Error loading stock data for dashboard:', error);
        criticalStockList.innerHTML = `<p style="color:red;">Error loading stock data: ${error.message}</p>`;
        stockSummary.innerHTML = `<p style="color:red;">Error loading summary data.</p>`;
    }

    // --- Fetch and Render Recent Wastage Log ---
    try {
        recentWastageList.innerHTML = ''; // Clear loading message
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoTimestamp = firebase.firestore.Timestamp.fromDate(sevenDaysAgo);

        const wasteQuerySnapshot = await db.collection('locations').doc(selectedLocationId).collection('wastage_log')
            .where('timestamp', '>=', sevenDaysAgoTimestamp)
            .orderBy('timestamp', 'desc')
            .limit(3) // Display top 3 recent wastage entries
            .get();

        if (wasteQuerySnapshot.empty) {
            recentWastageList.innerHTML = '<li>No waste logged in the last 7 days.</li>';
        } else {
            wasteQuerySnapshot.forEach(doc => {
                const logEntry = doc.data();
                recentWastageList.insertAdjacentHTML('beforeend', createRecentWasteItemHtml(logEntry));
            });
            // Optional: Add a link to view full wastage log
            recentWastageList.insertAdjacentHTML('beforeend', `
                <li class="view-all-link">
                    <button class="auth-button quick-action-btn small-btn" data-target-page="wastage-log">View All Wastage</button>
                </li>
            `);
        }
        console.log('Recent wastage log loaded for dashboard.');
    } catch (error) {
        console.error('Error loading recent wastage for dashboard:', error);
        recentWastageList.innerHTML = `<li style="color:red;">Error loading recent waste: ${error.message}</li>`;
    }

    // No direct navigation from quick action buttons on dashboard
    // They now open the modal via the event listeners defined above.
    // The "View All Wastage" button within the wastage card still navigates.
    document.querySelectorAll('.view-all-link .quick-action-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const targetPage = event.currentTarget.dataset.targetPage;
            if (targetPage && window.mainApp && typeof window.mainApp.handleNavigationClick === 'function') {
                window.mainApp.handleNavigationClick(targetPage);
            } else {
                console.warn(`Could not navigate to page: ${targetPage}. mainApp.handleNavigationClick not found.`);
            }
        });
    });

    console.log(`Dashboard overview rendered for ${locationName}.`);
}


/**
 * Shows the quick stock adjustment modal.
 * @param {'add'|'waste'} type - The type of adjustment ('add' or 'waste').
 */
export async function showQuickAdjustmentModal(type) { // Exported this function
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        alert('Please select a location first.');
        return;
    }

    const title = type === 'add' ? 'Quick Add Stock' : 'Quick Log Waste';
    const items = getCurrentStockItems(); // Get current items from stock.js

    let itemOptions = '';
    if (items.length === 0) {
        itemOptions = '<option value="" disabled selected>No items found</option>';
    } else {
        // Group items by category and sort them
        const categorizedItems = items.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});

        // Sort categories alphabetically
        const sortedCategories = Object.keys(categorizedItems).sort();

        // Build item options with optgroups
        itemOptions += '<option value="" disabled selected>Select Item</option>';
        sortedCategories.forEach(category => {
            itemOptions += `<optgroup label="${category}">`;
            // Sort items within each category alphabetically
            categorizedItems[category].sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
                itemOptions += `<option value="${item.id}">${item.name} (${item.unit || 'units'})</option>`;
            });
            itemOptions += `</optgroup>`;
        });
    }

    let qtyOptions = '<option value="" disabled selected>Select Qty</option>';
    for (let i = 1; i <= 50; i++) { // Max 50 units for quick adjustment
        qtyOptions += `<option value="${i}">${i}</option>`;
    }

    const bodyHtml = `
        <div class="modal-input-group">
            <div class="select-wrapper">
                <select id="modalItemSelect" class="waste-select">${itemOptions}</select>
                <i class="fas fa-chevron-down select-arrow"></i>
            </div>
            <div class="select-wrapper">
                <select id="modalQtySelect" class="waste-select">${qtyOptions}</select>
                <i class="fas fa-chevron-down select-arrow"></i>
            </div>
            ${type === 'waste' ? `<input type="text" id="modalReasonInput" placeholder="Reason for waste" class="auth-input modal-input">` : ''}
        </div>
    `;

    const footerHtml = `
        <button id="modalConfirmBtn" class="auth-button">Confirm</button>
        <button id="modalCancelBtn" class="auth-button secondary-btn">Cancel</button>
    `;

    openModal(title, bodyHtml, footerHtml);

    // Attach event listeners to modal elements after they are in the DOM
    document.getElementById('modalConfirmBtn').addEventListener('click', () => handleModalAdjustment(type));
    document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
}

/**
 * Handles the stock adjustment from the modal.
 * @param {'add'|'waste'} type - The type of adjustment ('add' or 'waste').
 */
async function handleModalAdjustment(type) {
    const selectedLocationId = getSelectedLocation();
    const itemSelect = document.getElementById('modalItemSelect');
    const qtySelect = document.getElementById('modalQtySelect');
    const reasonInput = document.getElementById('modalReasonInput');

    const itemId = itemSelect.value;
    const quantity = parseInt(qtySelect.value, 10);
    const reason = type === 'waste' ? reasonInput.value.trim() : '';

    if (!itemId || isNaN(quantity) || quantity <= 0) {
        modalMessage.textContent = 'Please select an item and a valid quantity.';
        modalMessage.style.display = 'block';
        return;
    }

    if (type === 'waste' && !reason) {
        modalMessage.textContent = 'A reason for waste is required.';
        modalMessage.style.display = 'block';
        return;
    }

    modalMessage.textContent = 'Processing...';
    modalMessage.style.display = 'block';

    const itemDocRef = db.collection('locations').doc(selectedLocationId).collection('items').doc(itemId);
    let success = false;

    try {
        if (type === 'add') {
            await itemDocRef.update({ currentStock: firebase.firestore.FieldValue.increment(quantity) });
            success = true;
            console.log(`Added ${quantity} of ${itemId} at ${selectedLocationId}.`);
        } else { // type === 'waste'
            await itemDocRef.update({ currentStock: firebase.firestore.FieldValue.increment(-quantity) });
            await db.collection('locations').doc(selectedLocationId).collection('wastage_log').add({
                item: itemSelect.options[itemSelect.selectedIndex].text.split('(')[0].trim(), // Get item name without unit
                itemId: itemId,
                quantity: quantity,
                unit: itemSelect.options[itemSelect.selectedIndex].text.split('(')[1]?.replace(')', '') || 'units', // Extract unit
                reason: reason,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: auth.currentUser ? auth.currentUser.email : 'Unknown User'
            });
            success = true;
            console.log(`Logged ${quantity} of ${itemId} as wasted at ${selectedLocationId}. Reason: ${reason}`);
        }

        modalMessage.textContent = success ? `${type === 'add' ? 'Added' : 'Logged waste'} successfully!` : 'Operation failed.';
        setTimeout(() => {
            closeModal();
            // Re-render the dashboard to reflect changes
            renderDashboardOverviewPage();
            // Optionally, re-render stock management page if it's the current view (though dashboard re-render is usually enough)
            // if (document.getElementById('stockManagementPage').classList.contains('active-page')) {
            //     renderStockManagementPage();
            // }
        }, 1000);

    } catch (error) {
        console.error('Error during quick adjustment:', error);
        modalMessage.textContent = `Operation failed: ${error.message}`;
        modalMessage.style.display = 'block';
    }
}
