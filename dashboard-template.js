// --- dashboard-template.js ---
// Provides HTML templating for dashboard overview components.

/**
 * Generates the HTML for a single dashboard summary card (Good, Low, Critical).
 * @param {string} statusClass - 'good', 'low', or 'critical' for styling.
 * @param {number} count - The number of items in this status.
 * @param {string} title - The title of the card (e.g., 'Good Stock').
 * @returns {string} The HTML string for the dashboard summary card.
 */
export function createDashboardCardHtml(statusClass, count, title) {
    return `
        <div class="summary-card ${statusClass}">
            <div class="summary-circle ${statusClass}">
                <span class="summary-count">${count}</span>
            </div>
            <p class="summary-title">${title}</p>
        </div>
    `;
}

/**
 * Generates the HTML for a single critical item in the alerts list.
 * Reuses a minimal version of the stock item visual.
 * @param {Object} item - The item object with name, currentStock, unit, reorderPoint.
 * @returns {string} The HTML string for a critical item alert.
 */
export function createCriticalItemHtml(item) {
    const stockStatusClass = item.currentStock <= item.reorderPoint / 2 ? 'critical' : 'low'; // Should only be critical/low here

    return `
        <div class="critical-item-entry">
            <div class="critical-indicator-circle ${stockStatusClass}">
                <span class="critical-stock-count">${item.currentStock}</span>
            </div>
            <p class="critical-item-name">${item.name} (${item.unit || 'units'})</p>
            <span class="critical-reorder-info">Reorder Pt: ${item.reorderPoint}</span>
        </div>
    `;
}

/**
 * Generates the HTML for a single recent waste log entry.
 * @param {Object} logEntry - The waste log entry object.
 * @returns {string} The HTML string for the waste log item.
 */
export function createRecentWasteItemHtml(logEntry) {
    // Safely convert Firestore Timestamp to local date string
    const timestampDate = logEntry.timestamp instanceof firebase.firestore.Timestamp
                            ? logEntry.timestamp.toDate().toLocaleString()
                            : (logEntry.timestamp ? new Date(logEntry.timestamp.seconds * 1000).toLocaleString() : 'N/A');

    // Truncate long reasons for cleaner display
    const displayReason = logEntry.reason.length > 30 ? logEntry.reason.substring(0, 27) + '...' : logEntry.reason; // Shorter for dashboard

    return `
        <li class="waste-log-item dashboard-waste-item">
            ${logEntry.item} | ${logEntry.quantity} ${logEntry.unit || 'units'} (${displayReason}) - <span class="waste-timestamp">${timestampDate}</span>
        </li>
    `;
}
