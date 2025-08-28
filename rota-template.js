// --- rota-template.js ---
// Provides HTML templates for the new, redesigned Rota page.

// --- HELPER FUNCTIONS ---

// Helper to get staff name safely
const getStaffName = (uid, staffList) => staffList.find(s => s.uid === uid)?.name || 'Unknown User';

// --- ROTA CONTAINER TEMPLATE ---

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
                    <div class="week-selector-container">
                        <span id="rotaWeekDisplay" class="rota-week-display">${weekDisplay} <i class="fas fa-calendar-day"></i></span>
                        <div id="calendarPopup" class="calendar-popup"></div>
                    </div>
                    <button id="rotaNextWeekBtn" class="auth-button small-btn secondary-btn">Next ></button>
                </div>
            </div>
            <div id="rotaGridContainer" class="rota-grid-container-professional">
                <p>Loading rota...</p>
            </div>
        </div>
    `;
}

/**
 * Generates the HTML for the calendar popup.
 * @param {Date} dateForMonth - A date within the month to be displayed.
 * @param {Date} currentWeekStartDate - The start date of the currently selected week.
 * @returns {string} The HTML for the calendar.
 */
export function createCalendarHtml(dateForMonth, currentWeekStartDate) {
    const month = dateForMonth.getMonth();
    const year = dateForMonth.getFullYear();
    const monthName = dateForMonth.toLocaleString('default', { month: 'long' });

    let html = `
        <div class="calendar-header">
            <button id="calendarPrevMonthBtn">&lt;</button>
            <span class="calendar-month-year">${monthName} ${year}</span>
            <button id="calendarNextMonthBtn">&gt;</button>
        </div>
        <div class="calendar-grid">
            <div class="day-name">Mon</div>
            <div class="day-name">Tue</div>
            <div class="day-name">Wed</div>
            <div class="day-name">Thu</div>
            <div class="day-name">Fri</div>
            <div class="day-name">Sat</div>
            <div class="day-name">Sun</div>
    `;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Adjust to start the week on Monday
    let dayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon...
    dayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;

    for (let i = 0; i < dayOfWeek; i++) {
        html += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split('T')[0];

        let classes = 'calendar-day';
        if (date.getTime() >= currentWeekStartDate.getTime() && date.getTime() < currentWeekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000) {
            classes += ' in-week';
        }
        if (date.getMonth() !== month) {
            classes += ' other-month';
        }

        html += `<div class="${classes}" data-date="${dateString}">${day}</div>`;
    }

    html += `</div>`;
    return html;
}

// --- ROTA GRID AND SHIFT CARD TEMPLATES (DESKTOP) ---

/**
 * Generates the HTML for the professional rota grid (desktop view).
 * @param {Object} rotaData - The rota data for the week from Firestore.
 * @param {Array} staffList - The full list of staff members.
 * @returns {string} The HTML for the rota grid.
 */
export function createRotaGridHtml(rotaData = {}, staffList = []) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    let gridHtml = `<div class="rota-desktop-view-professional">`;
    days.forEach(day => {
        const shifts = rotaData[day] || [];
        const shiftCardsHtml = shifts.map(shift => createShiftCardHtml(day, shift, staffList)).join('');

        gridHtml += `
            <div class="day-column">
                <div class="day-header">${day.charAt(0).toUpperCase() + day.slice(1)}</div>
                <div class="shifts-container">
                    ${shiftCardsHtml}
                </div>
                <button class="add-shift-btn auth-button small-btn" data-day="${day}">+ Add Shift</button>
            </div>
        `;
    });
    gridHtml += `</div>`;
    return gridHtml;
}

/**
 * Generates the HTML for a single shift card.
 * @param {string} day - The day of the week.
 * @param {Object} shift - The shift object.
 * @param {Array} staffList - The full list of staff members.
 * @returns {string} The HTML for the shift card.
 */
function createShiftCardHtml(day, shift, staffList) {
    const staffHtml = shift.staff.map(uid =>
        `<div class="staff-tag-small" data-day="${day}" data-shift-id="${shift.id}" data-uid="${uid}">
            ${getStaffName(uid, staffList)}<span class="remove-staff-icon">×</span>
        </div>`
    ).join('');

    return `
        <div class="shift-card" data-day="${day}" data-shift-id="${shift.id}">
            <div class="shift-card-header">
                <span class="shift-time">${shift.startTime} - ${shift.endTime}</span>
                <div class="shift-actions">
                    <button class="edit-shift-btn" title="Edit shift time"><i class="fas fa-edit"></i></button>
                    <button class="delete-shift-btn" title="Delete shift"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="shift-card-body">
                <div class="assigned-staff-list">${staffHtml}</div>
                <button class="assign-staff-btn auth-button tiny-btn" data-day="${day}" data-shift-id="${shift.id}">+ Assign</button>
            </div>
        </div>
    `;
}

// --- MOBILE VIEW TEMPLATES ---

/**
 * Generates the HTML for the mobile-friendly rota list.
 * @param {Object} rotaData - The rota data for the week from Firestore.
 * @param {Array} staffList - The full list of staff members.
 * @returns {string} The HTML for the mobile rota view.
 */
export function createRotaMobileHtml(rotaData = {}, staffList = []) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    let mobileHtml = `<div class="rota-mobile-view">`;
    days.forEach(day => {
        const shifts = rotaData[day] || [];
        const shiftCardsHtml = shifts.map(shift => createShiftCardHtml(day, shift, staffList)).join('');

        mobileHtml += `
            <div class="mobile-day-card-professional">
                <div class="mobile-day-header">${day.charAt(0).toUpperCase() + day.slice(1)}</div>
                ${shiftCardsHtml}
                <button class="add-shift-btn auth-button small-btn" data-day="${day}">+ Add Shift</button>
            </div>
        `;
    });
    mobileHtml += `</div>`;
    return mobileHtml;
}

// --- MODAL TEMPLATES ---

/**
 * Generates the HTML for the "Add/Edit Shift" modal.
 * @param {Object} shift - The existing shift data, or null for a new shift.
 * @returns {string} The HTML for the modal's body.
 */
export function createShiftModalHtml(shift = null) {
    const startTime = shift ? shift.startTime : '09:00';
    const endTime = shift ? shift.endTime : '17:00';
    return `
        <form id="shiftForm" class="modal-form">
            <div class="form-field">
                <label for="shiftStartTime">Start Time</label>
                <input type="time" id="shiftStartTime" value="${startTime}" required>
            </div>
            <div class="form-field">
                <label for="shiftEndTime">End Time</label>
                <input type="time" id="shiftEndTime" value="${endTime}" required>
            </div>
        </form>
    `;
}

/**
 * Generates the HTML for the "Assign Staff" modal.
 * @param {Array} staffList - The full list of staff members.
 * @param {Array} assignedUids - An array of UIDs for staff already assigned to this shift.
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
