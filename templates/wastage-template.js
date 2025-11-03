// --- wastage-template.js ---
// Provides HTML templating for waste log display.

/**
 * Generates the HTML string for a single waste log item.
 * @param {Object} logEntry - The waste log entry object.
 * @returns {string} The HTML string for the waste log item.
 */
export function createWasteLogItemHtml(logEntry) {
    // Safely convert Firestore Timestamp to local date string
    const timestampDate = logEntry.timestamp instanceof firebase.firestore.Timestamp
                            ? logEntry.timestamp.toDate().toLocaleString()
                            : (logEntry.timestamp ? new Date(logEntry.timestamp.seconds * 1000).toLocaleString() : 'N/A');

    // Truncate long reasons for cleaner display
    const displayReason = logEntry.reason.length > 50 ? logEntry.reason.substring(0, 47) + '...' : logEntry.reason;

    return `
        <li class="waste-log-item">
            ${logEntry.item} | ${logEntry.quantity} ${logEntry.unit || 'units'} | ${timestampDate} - ${displayReason}
        </li>
    `;
}
