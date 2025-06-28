// --- dashboard-template.js (Final Version) ---

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
 * @param {Object} item - The item object with name, currentStock, unit, reorderPoint.
 * @returns {string} The HTML string for a critical item alert.
 */
export function createCriticalItemHtml(item) {
    const stockStatusClass = item.currentStock <= item.reorderPoint / 2 ? 'critical' : 'low';

    return `
        <div class="critical-item-entry">
            <div class="critical-indicator-circle ${stockStatusClass}">
                <span class="critical-stock-count">${item.currentStock}</span>
            </div>
            <div class="critical-item-details">
                <p class="critical-item-name">${item.name} (${item.unit || 'units'})</p>
                <span class="critical-reorder-info">Reorder Pt: ${item.reorderPoint}</span>
            </div>
        </div>
    `;
}

/**
 * Generates the HTML for a single recent waste log entry.
 * @param {Object} logEntry - The waste log entry object.
 * @returns {string} The HTML string for the waste log item.
 */
export function createRecentWasteItemHtml(logEntry) {
    const timestampDate = logEntry.timestamp instanceof firebase.firestore.Timestamp
                            ? logEntry.timestamp.toDate().toLocaleString()
                            : (logEntry.timestamp ? new Date(logEntry.timestamp.seconds * 1000).toLocaleString() : 'N/A');

    const displayReason = logEntry.reason.length > 30 ? logEntry.reason.substring(0, 27) + '...' : logEntry.reason;

    return `
        <li class="waste-log-item dashboard-waste-item">
            ${logEntry.item} | ${logEntry.quantity} ${logEntry.unit || 'units'} (${displayReason}) - <span class="waste-timestamp">${timestampDate}</span>
        </li>
    `;
}

/**
 * NEW: Generates the HTML for the Staff Training Summary card.
 * @param {Object} summaryData - Object containing totalEmployees, upToDateCount, and locationAverages.
 * @returns {string} The HTML for the staff summary card.
 */
export function createStaffSummaryCardHtml(summaryData) {
    const { totalEmployees, upToDateCount, locationAverages } = summaryData;

    let locationBarsHtml = '';
    if (locationAverages && locationAverages.length > 0) {
        locationAverages.forEach(loc => {
            locationBarsHtml += `
                <div class="location-bar-item">
                    <div class="location-bar-progress">
                        <div class="bar-fill" style="height: ${loc.score}%;"></div>
                    </div>
                    <span class="location-bar-label">${loc.name}</span>
                </div>
            `;
        });
    } else {
        locationBarsHtml = '<p>No quiz data available.</p>';
    }

    return `
        <div class="staff-summary-content">
            <div class="staff-summary-metrics">
                <div class="metric-item">
                    <span class="metric-value">${totalEmployees}</span>
                    <span class="metric-label">Total Employees</span>
                </div>
                <div class="metric-item">
                    <span class="metric-value">${upToDateCount}</span>
                    <span class="metric-label">Training Complete</span>
                </div>
            </div>
            <hr class="staff-summary-divider">
            <div class="staff-summary-chart">
                <label class="chart-label">Store Average Quiz Scores</label>
                <div class="location-bars-container">
                    ${locationBarsHtml}
                </div>
            </div>
        </div>
    `;
}
