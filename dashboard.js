// --- dashboard.js (Final, Complete Version with Staff Summary) ---

import { db, auth } from './firebase.js';
import { getSelectedLocation, getLocationDisplayName } from './config.js';
import { createDashboardCardHtml, createCriticalItemHtml, createRecentWasteItemHtml, createStaffSummaryCardHtml } from './dashboard-template.js';
import { getCurrentStockItems } from './stock.js';

// --- DOM Elements ---
const dashboardPage = document.getElementById('dashboardPage');

// --- Modal Elements & Functions ---
const universalModal = document.getElementById('universalModal');
const closeModalButton = universalModal.querySelector('.close-button');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalMessage = document.getElementById('modalMessage');
const modalFooter = document.getElementById('modalFooter');

closeModalButton.addEventListener('click', closeModal);
universalModal.addEventListener('click', (event) => {
    if (event.target === universalModal) {
        closeModal();
    }
});

export function openModal(title, bodyHtml, footerHtml = '', message = '') {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    modalFooter.innerHTML = footerHtml;
    modalMessage.textContent = message;
    universalModal.style.display = 'flex';
    modalMessage.style.display = 'none';
}

export function closeModal() {
    universalModal.style.display = 'none';
    modalTitle.textContent = '';
    modalBody.innerHTML = '';
    modalFooter.textContent = '';
    modalMessage.textContent = '';
    if (window.mainApp && window.mainApp.hideCustomTooltip) {
        window.mainApp.hideCustomTooltip();
    }
}

/**
 * Renders the Dashboard Overview page.
 */
export async function renderDashboardOverviewPage() {
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        dashboardPage.innerHTML = `<h2 class="page-title">Dashboard Overview</h2><p>Welcome! Please select a location to get started.</p>`;
        return;
    }
    const locationName = getLocationDisplayName(selectedLocationId);

    // Render the grid structure, including a placeholder for the new staff card
    dashboardPage.innerHTML = `
        <h2 class="page-title">Dashboard Overview</h2>
        <p>Welcome to your Friez n Burgz Admin Dashboard for ${locationName}!</p>
        <div class="dashboard-summary-grid">
            <div id="stockOverviewCard" class="dashboard-card"><h3 class="card-title">Stock Overview</h3><div id="stockSummary"><p>Loading...</p></div></div>
            <div id="criticalStockCard" class="dashboard-card"><h3 class="card-title">Critical Stock Alerts</h3><div id="criticalStockList"><p>Loading...</p></div></div>
            <div id="staffSummaryCard" class="dashboard-card"><h3 class="card-title">Staff Training Summary</h3><div id="staffSummaryContent"><p>Loading...</p></div></div>
            <div id="wastageLogCard" class="dashboard-card"><h3 class="card-title">Recent Wastage Log</h3><ul id="recentWastageList"><p>Loading...</p></ul></div>
            <div id="quickActionsCard" class="dashboard-card quick-actions-card">
                <h3 class="card-title">Quick Actions</h3>
                <div class="quick-actions-content">
                    <button class="auth-button quick-action-btn" id="quickAddStockBtn">Quick Add Stock</button>
                    <button class="auth-button quick-action-btn" id="quickLogWasteBtn">Quick Log Waste</button>
                    <button class="auth-button quick-action-btn disabled" disabled>Create Order (Coming Soon)</button>
                </div>
            </div>
        </div>
    `;

    // Attach event listeners for Quick Actions
    document.getElementById('quickAddStockBtn').addEventListener('click', () => showQuickAdjustmentModal('add'));
    document.getElementById('quickLogWasteBtn').addEventListener('click', () => showQuickAdjustmentModal('waste'));

    // Fetch and Render All Data in Parallel
    await Promise.all([
        renderStockSummary(),
        renderWastageSummary(),
        renderStaffSummary()
    ]);
}

/**
 * Fetches and renders the stock summary cards and critical alerts.
 */
async function renderStockSummary() {
    const stockSummary = document.getElementById('stockSummary');
    const criticalStockList = document.getElementById('criticalStockList');
    const selectedLocationId = getSelectedLocation();
    try {
        const itemsRef = db.collection('locations').doc(selectedLocationId).collection('items');
        const querySnapshot = await itemsRef.get();
        const allItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const criticalItems = allItems.filter(item => item.currentStock <= item.reorderPoint / 2);
        const lowItems = allItems.filter(item => item.currentStock > item.reorderPoint / 2 && item.currentStock <= item.reorderPoint);
        const goodItems = allItems.filter(item => item.currentStock > item.reorderPoint);

        stockSummary.innerHTML = `
            <div class="summary-top-row">
                ${createDashboardCardHtml('good', goodItems.length, 'Good Stock')}
                ${createDashboardCardHtml('low', lowItems.length, 'Low Stock')}
            </div>
            <div class="summary-bottom-row">
                ${createDashboardCardHtml('critical', criticalItems.length, 'Critical Stock')}
            </div>
        `;
        criticalStockList.innerHTML = criticalItems.length > 0 ? criticalItems.map(createCriticalItemHtml).join('') : '<p>No critical stock alerts. Good job!</p>';
    } catch (error) {
        console.error('Error loading stock summary:', error);
        stockSummary.innerHTML = `<p style="color:red;">Error loading stock data.</p>`;
        criticalStockList.innerHTML = `<p style="color:red;">Error loading stock alerts.</p>`;
    }
}

/**
 * Fetches and renders the recent wastage log summary.
 */
async function renderWastageSummary() {
    const recentWastageList = document.getElementById('recentWastageList');
    const selectedLocationId = getSelectedLocation();
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const wasteQuerySnapshot = await db.collection('locations').doc(selectedLocationId).collection('wastage_log')
            .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(sevenDaysAgo))
            .orderBy('timestamp', 'desc')
            .limit(3)
            .get();
            
        if (wasteQuerySnapshot.empty) {
            recentWastageList.innerHTML = '<li>No waste logged in the last 7 days.</li>';
        } else {
            recentWastageList.innerHTML = wasteQuerySnapshot.docs.map(doc => createRecentWasteItemHtml(doc.data())).join('');
        }
    } catch (error) {
        console.error('Error loading wastage summary:', error);
        recentWastageList.innerHTML = '<li>Error loading waste log.</li>';
    }
}

/**
 * Fetches staff and progress data to render the staff summary card.
 */
async function renderStaffSummary() {
    const staffSummaryContent = document.getElementById('staffSummaryContent');
    const TOTAL_HANDBOOK_SECTIONS = 12;

    try {
        const [staffSnapshot, usersSnapshot] = await Promise.all([
            db.collection('staff').get(),
            db.collection('users').get()
        ]);

        const staffData = staffSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        const progressData = {};
        usersSnapshot.forEach(doc => { progressData[doc.id] = doc.data(); });

        const totalEmployees = staffData.length;
        let upToDateCount = 0;
        const locationScores = {};

        staffData.forEach(staff => {
            const userProgress = progressData[staff.uid] || { readSections: [], quizHistory: [] };
            const location = staff.locationId || 'Unassigned';
            if (userProgress.readSections && userProgress.readSections.length >= TOTAL_HANDBOOK_SECTIONS) {
                upToDateCount++;
            }
            if (!locationScores[location]) {
                locationScores[location] = { totalScore: 0, quizCount: 0 };
            }
            if (userProgress.quizHistory && userProgress.quizHistory.length > 0) {
                userProgress.quizHistory.forEach(quiz => {
                    locationScores[location].totalScore += (quiz.score / quiz.total);
                    locationScores[location].quizCount++;
                });
            }
        });

        const locationAverages = Object.keys(locationScores).map(locId => {
            const data = locationScores[locId];
            const average = data.quizCount > 0 ? (data.totalScore / data.quizCount) * 100 : 0;
            return { name: getLocationDisplayName(locId), score: Math.round(average) };
        });

        staffSummaryContent.innerHTML = createStaffSummaryCardHtml({
            totalEmployees,
            upToDateCount,
            locationAverages
        });

    } catch (error) {
        console.error("Error rendering staff summary:", error);
        staffSummaryContent.innerHTML = `<p style="color:red;">Error loading staff data.</p>`;
    }
}

/**
 * Shows the quick stock adjustment modal.
 * @param {'add'|'waste'} type - The type of adjustment.
 */
export async function showQuickAdjustmentModal(type) {
    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        alert('Please select a location first.');
        return;
    }
    const title = type === 'add' ? 'Quick Add Stock' : 'Quick Log Waste';
    const items = getCurrentStockItems();
    let itemOptions = '';
    if (items.length === 0) {
        itemOptions = '<option value="" disabled selected>No items found</option>';
    } else {
        const categorizedItems = items.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {});
        const sortedCategories = Object.keys(categorizedItems).sort();
        itemOptions += '<option value="" disabled selected>Select Item</option>';
        sortedCategories.forEach(category => {
            itemOptions += `<optgroup label="${category}">`;
            categorizedItems[category].sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
                itemOptions += `<option value="${item.id}">${item.name} (${item.unit || 'units'})</option>`;
            });
            itemOptions += `</optgroup>`;
        });
    }
    const qtyControlsHtml = `<div class="stock-controls-group"><div class="stock-controls"><button class="control-button decrement-btn">-</button><input type="number" id="modalQtyInput" class="stock-input" value="1" min="1"><button class="control-button increment-btn">+</button></div></div>`;
    const bodyHtml = `<div class="modal-input-group"><div class="select-wrapper"><select id="modalItemSelect" class="waste-select">${itemOptions}</select><i class="fas fa-chevron-down select-arrow"></i></div>${qtyControlsHtml}${type === 'waste' ? `<input type="text" id="modalReasonInput" placeholder="Reason for waste" class="auth-input modal-input">` : ''}</div>`;
    const footerHtml = `<button id="modalConfirmBtn" class="auth-button">Confirm</button><button id="modalCancelBtn" class="auth-button secondary-btn">Cancel</button>`;
    openModal(title, bodyHtml, footerHtml);
    document.getElementById('modalConfirmBtn').addEventListener('click', () => handleModalAdjustment(type));
    document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
    const modalQtyInput = document.getElementById('modalQtyInput');
    if (modalQtyInput) {
        const decrementBtn = modalQtyInput.closest('.stock-controls').querySelector('.decrement-btn');
        const incrementBtn = modalQtyInput.closest('.stock-controls').querySelector('.increment-btn');
        if (decrementBtn) decrementBtn.addEventListener('click', () => { let val = parseInt(modalQtyInput.value, 10) || 1; modalQtyInput.value = Math.max(1, val - 1); });
        if (incrementBtn) incrementBtn.addEventListener('click', () => { let val = parseInt(modalQtyInput.value, 10) || 0; modalQtyInput.value = val + 1; });
        modalQtyInput.addEventListener('change', () => { if (parseInt(modalQtyInput.value, 10) < 1) modalQtyInput.value = 1; });
    }
}

/**
 * Handles the stock adjustment from the modal.
 * @param {'add'|'waste'} type - The type of adjustment.
 */
async function handleModalAdjustment(type) {
    const selectedLocationId = getSelectedLocation();
    const itemSelect = document.getElementById('modalItemSelect');
    const qtyInput = document.getElementById('modalQtyInput');
    const reasonInput = document.getElementById('modalReasonInput');
    const itemId = itemSelect.value;
    const quantity = parseInt(qtyInput.value, 10);
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
    try {
        if (type === 'add') {
            await itemDocRef.update({ currentStock: firebase.firestore.FieldValue.increment(quantity) });
        } else {
            await itemDocRef.update({ currentStock: firebase.firestore.FieldValue.increment(-quantity) });
            await db.collection('locations').doc(selectedLocationId).collection('wastage_log').add({ item: itemSelect.options[itemSelect.selectedIndex].text.split('(')[0].trim(), itemId, quantity, unit: itemSelect.options[itemSelect.selectedIndex].text.split('(')[1]?.replace(')', '') || 'units', reason, timestamp: firebase.firestore.FieldValue.serverTimestamp(), updatedBy: auth.currentUser ? auth.currentUser.email : 'Unknown' });
        }
        modalMessage.textContent = 'Operation successful!';
        setTimeout(() => { closeModal(); renderDashboardOverviewPage(); }, 1000);
    } catch (error) {
        console.error('Error during quick adjustment:', error);
        modalMessage.textContent = `Operation failed: ${error.message}`;
    }
}
