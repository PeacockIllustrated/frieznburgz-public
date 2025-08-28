// --- rota-template.js ---
// Provides HTML templates for the Rota page.

// --- ROTA TEMPLATES ---

/**
 * Generates the main HTML structure for the rota section.
 * @param {Date} weekStartDate - The start date of the week being displayed.
 * @returns {string} The HTML for the rota container and navigation.
 */
export function createRotaContainerHtml(weekStartDate) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const endDate = new Date(weekStartDate);
    endDate.setDate(weekStartDate.getDate() + 6);
    const weekDisplay = `${weekStartDate.toLocaleDateString('en-GB', options)} - ${endDate.toLocaleDateString('en-GB', options)}`;

    return `
        <div class="settings-section rota-section">
            <div class="rota-header">
                <h3 class="subsection-title">Weekly Rota</h3>
                <div class="rota-nav">
                    <button id="rotaPrevWeekBtn" class="auth-button small-btn secondary-btn">< Prev</button>
                    <span class="rota-week-display">${weekDisplay}</span>
                    <button id="rotaNextWeekBtn" class="auth-button small-btn secondary-btn">Next ></button>
                </div>
            </div>
            <div id="rotaGridContainer" class="rota-grid-container">
                <p>Loading rota...</p>
            </div>
        </div>
    `;
}

// Helper to get staff name safely
const getStaffName = (uid, staffList) => staffList.find(s => s.uid === uid)?.name || 'Unknown User';

/**
 * Generates the HTML for the rota grid (desktop view).
 * @param {Object} rotaData - The rota data for the week from Firestore.
 * @param {Array} staffList - The full list of staff members.
 * @returns {string} The HTML for the rota table.
 */
export function createRotaGridHtml(rotaData = {}, staffList = []) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const shifts = ['morning', 'afternoon'];

    let tableHtml = `<div class="rota-desktop-view"><table class="rota-table"><thead><tr><th>Shift</th>`;
    days.forEach(day => tableHtml += `<th>${day.charAt(0).toUpperCase() + day.slice(1)}</th>`);
    tableHtml += `</tr></thead><tbody>`;

    shifts.forEach(shift => {
        tableHtml += `<tr><td class="shift-label">${shift.charAt(0).toUpperCase() + shift.slice(1)}</td>`;
        days.forEach(day => {
            const assignedUids = rotaData[day]?.[shift] || [];
            const staffHtml = assignedUids.map(uid =>
                `<div class="staff-tag" data-day="${day}" data-shift="${shift}" data-uid="${uid}">
                    ${getStaffName(uid, staffList)}<span class="remove-staff-icon">×</span>
                 </div>`
            ).join('');

            tableHtml += `<td class="rota-cell"><div class="assigned-staff">${staffHtml}</div><button class="add-staff-btn" data-day="${day}" data-shift="${shift}">+ Add</button></td>`;
        });
        tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table></div>`;
    return tableHtml;
}

/**
 * Generates the HTML for the mobile-friendly rota list.
 * @param {Object} rotaData - The rota data for the week from Firestore.
 * @param {Array} staffList - The full list of staff members.
 * @returns {string} The HTML for the mobile rota view.
 */
export function createRotaMobileHtml(rotaData = {}, staffList = []) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const shifts = ['morning', 'afternoon'];

    let mobileHtml = `<div class="rota-mobile-view">`;
    days.forEach(day => {
        mobileHtml += `<div class="mobile-day-card">
            <div class="mobile-day-header">${day.charAt(0).toUpperCase() + day.slice(1)}</div>`;

        shifts.forEach(shift => {
            const assignedUids = rotaData[day]?.[shift] || [];
            const staffHtml = assignedUids.map(uid =>
                `<div class="staff-tag" data-day="${day}" data-shift="${shift}" data-uid="${uid}">
                    ${getStaffName(uid, staffList)}<span class="remove-staff-icon">×</span>
                 </div>`
            ).join('');

            mobileHtml += `<div class="mobile-shift-section">
                <div class="mobile-shift-header">${shift.charAt(0).toUpperCase() + shift.slice(1)}</div>
                <div class="mobile-shift-body">
                    ${staffHtml || '<p class="no-staff-msg">No staff assigned</p>'}
                    <button class="add-staff-btn" data-day="${day}" data-shift="${shift}">+ Assign Staff</button>
                </div>
            </div>`;
        });
        mobileHtml += `</div>`;
    });
    mobileHtml += `</div>`;
    return mobileHtml;
}

/**
 * Generates the HTML for the "Assign Staff" modal.
 * @param {Array} staffList - The full list of staff members.
 * @param {Array} assignedUids - An array of UIDs for staff already assigned to this shift.
_
 * @returns {string} The HTML for the modal's body.
 */
export function createAssignStaffModalHtml(staffList, assignedUids = []) {
    if (staffList.length === 0) {
        return '<p class="info-message">No staff members found. Please add staff profiles first.</p>';
    }

    const staffCheckboxesHtml = staffList.map(staff => {
        const isChecked = assignedUids.includes(staff.uid);
        return `
            <label class="item-checkbox-label">
                <input type="checkbox" name="assignedStaff" value="${staff.uid}" ${isChecked ? 'checked' : ''}>
                <div class="staff-avatar">${staff.name.charAt(0)}</div>
                <span>${staff.name}</span>
            </label>
        `;
    }).join('');

    return `<form id="assignStaffForm" class="modal-form">${staffCheckboxesHtml}</form>`;
}
