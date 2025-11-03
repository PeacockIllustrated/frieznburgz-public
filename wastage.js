// --- wastage.js ---
// Manages wastage logging and display for the selected location.

import { db } from './firebase.js';
import { auth } from './firebase.js'; // Needed for auth.currentUser.email for logging who made the entry
import { getSelectedLocation } from './config.js';
import { getCurrentStockItems } from './stock.js'; // To get item list for dropdown
import { createWasteLogItemHtml } from './templates/wastage-template.js'; // Template for individual waste log items

// We no longer get these elements at the top, but inside the render function.


/**
 * Renders the Wastage Log page content.
 * Populates dropdowns and loads recent waste entries for the selected location.
 */
export async function renderWastageLogPage() {
    const wastageLogContent = document.getElementById('wastageLogContent'); // GET IT HERE!

    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        wastageLogContent.innerHTML = '<p>Please select a location first to log waste.</p>';
        console.warn('wastage.js: No location selected for wastage log.');
        return;
    }

    const locationDisplayName = selectedLocationId.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    // 1. Set up the basic HTML structure for the wastage page
    // Important: We rebuild the wastage-card HTML structure each time to ensure fresh event listeners.
    wastageLogContent.innerHTML = `
        <h3 class="subsection-title">Wastage Log for ${locationDisplayName}</h3>
        <div class="wastage-card">
            <div class="wastage-actions">
                <p>Ready to log new waste?</p>
                <button id="logNewWasteEntryBtn" class="auth-button quick-action-btn">Log New Waste Entry</button>
            </div>
            <h4 class="wastage-log-heading">Waste Log (Prev. 7 Days)</h4>
            <ul class="waste-log-list" id="wasteLogList">
                <!-- Waste log entries will be dynamically loaded here -->
            </ul>
        </div>
    `;


    // 2. IMPORTANT: Get references to the newly created DOM elements *within this page*
    // These must be retrieved *after* the innerHTML assignment.
    const logNewWasteEntryBtn = document.getElementById('logNewWasteEntryBtn');
    const currentWasteLogList = document.getElementById('wasteLogList');

    // 3. Attach event listeners to newly created elements
    if (logNewWasteEntryBtn) {
        logNewWasteEntryBtn.addEventListener('click', () => {
            if (window.mainApp && typeof window.mainApp.showQuickAdjustmentModal === 'function') {
                window.mainApp.showQuickAdjustmentModal('waste');
            } else {
                console.error('mainApp.showQuickAdjustmentModal is not available.');
                alert('An error occurred. Cannot open waste logging modal.');
            }
        });
    } else {
        console.error('wastage.js: Log New Waste Entry button not found after rendering.');
    }


    // 4. Load log entries
    await loadWasteLog(currentWasteLogList); // Load initial log entries
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

    if (!logList) {
        console.error('wastage.js: Waste log list element not found. Cannot load log.');
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
