// --- rota.js ---
import { db } from './firebase.js';
import {
    createRotaContainerHtml,
    createRotaGridHtml,
    createRotaMobileHtml,
    createShiftModalHtml,
    createAssignStaffModalHtml
} from './rota-template.js';

let currentWeekStartDate;
let allStaff = [];
let rotaData = {};

/**
 * Main function to render the entire rota page.
 */
export async function renderRotaPage() {
    const rotaContent = document.getElementById('rotaContent');
    rotaContent.innerHTML = `<div id="rotaContainer"></div>`;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    currentWeekStartDate = new Date(today.setDate(diff));
    currentWeekStartDate.setHours(0, 0, 0, 0);

    await loadAllStaff();
    await renderRota();
}

/**
 * Fetches and stores the list of all staff members.
 */
async function loadAllStaff() {
    try {
        const staffSnapshot = await db.collection('staff').orderBy('name').get();
        allStaff = staffSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error loading staff list:", error);
    }
}

/**
 * Renders the weekly rota section, including fetching data.
 */
async function renderRota() {
    const rotaContainer = document.getElementById('rotaContainer');
    if (!rotaContainer) return;

    rotaContainer.innerHTML = createRotaContainerHtml(currentWeekStartDate);
    attachRotaNavListeners();

    const weekId = getWeekId(currentWeekStartDate);
    const rotaGridContainer = document.getElementById('rotaGridContainer');
    try {
        const rotaDoc = await db.collection('rota').doc(weekId).get();
        rotaData = rotaDoc.exists ? rotaDoc.data() : {};

        // Ensure every day has an array, even if empty
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
            if (!rotaData[day]) {
                rotaData[day] = [];
            }
        });

        rotaGridContainer.innerHTML = createRotaGridHtml(rotaData, allStaff) + createRotaMobileHtml(rotaData, allStaff);
        attachRotaActionListeners();
    } catch (error) {
        console.error("Error rendering rota:", error);
        rotaGridContainer.innerHTML = `<p class="error-message">Could not load rota.</p>`;
    }
}

// --- SHIFT MANAGEMENT ---

/**
 * Opens a modal to add a new shift or edit an existing one.
 */
function openShiftModal(day, shiftId = null) {
    const shift = shiftId ? rotaData[day].find(s => s.id === shiftId) : null;
    const title = shiftId ? 'Edit Shift' : 'Add New Shift';
    const bodyHtml = createShiftModalHtml(shift);
    const footerHtml = `<button id="saveShiftBtn" class="auth-button">Save Shift</button>`;

    window.mainApp.openModal(title, bodyHtml, footerHtml);

    document.getElementById('saveShiftBtn').addEventListener('click', () => handleSaveShift(day, shiftId));
}

/**
 * Saves a new shift or updates an existing one in Firestore.
 */
async function handleSaveShift(day, shiftId = null) {
    const startTime = document.getElementById('shiftStartTime').value;
    const endTime = document.getElementById('shiftEndTime').value;
    if (!startTime || !endTime) {
        alert("Please select both a start and end time.");
        return;
    }

    const weekId = getWeekId(currentWeekStartDate);
    const rotaRef = db.collection('rota').doc(weekId);
    let dayShifts = rotaData[day] || [];

    if (shiftId) { // Editing existing shift
        dayShifts = dayShifts.map(shift =>
            shift.id === shiftId ? { ...shift, startTime, endTime } : shift
        );
    } else { // Adding new shift
        const newShift = {
            id: `shift_${Date.now()}`,
            startTime,
            endTime,
            staff: []
        };
        dayShifts.push(newShift);
    }

    try {
        await rotaRef.set({ [day]: dayShifts }, { merge: true });
        window.mainApp.closeModal();
        renderRota();
    } catch (error) {
        console.error("Error saving shift:", error);
        alert("Failed to save shift.");
    }
}

/**
 * Deletes a shift from a day.
 */
async function handleDeleteShift(day, shiftId) {
    if (!confirm("Are you sure you want to delete this entire shift?")) return;

    const weekId = getWeekId(currentWeekStartDate);
    const rotaRef = db.collection('rota').doc(weekId);
    const updatedShifts = rotaData[day].filter(shift => shift.id !== shiftId);

    try {
        await rotaRef.set({ [day]: updatedShifts }, { merge: true });
        renderRota();
    } catch (error) {
        console.error("Error deleting shift:", error);
        alert("Failed to delete shift.");
    }
}

// --- STAFF ASSIGNMENT ---

/**
 * Opens the modal to assign staff to a specific shift.
 */
function openAssignStaffModal(day, shiftId) {
    const shift = rotaData[day].find(s => s.id === shiftId);
    if (!shift) return;

    const assignedUids = shift.staff || [];
    const bodyHtml = createAssignStaffModalHtml(allStaff, assignedUids);
    const footerHtml = `<button id="saveRotaAssignmentBtn" class="auth-button">Save</button>`;

    window.mainApp.openModal(`Assign Staff: ${shift.startTime}-${shift.endTime}`, bodyHtml, footerHtml);

    document.getElementById('saveRotaAssignmentBtn').addEventListener('click', () => handleSaveRotaAssignment(day, shiftId));
}

/**
 * Saves the selected staff for a shift to Firestore.
 */
async function handleSaveRotaAssignment(day, shiftId) {
    const form = document.getElementById('assignStaffForm');
    const checkedUids = Array.from(form.querySelectorAll('input[name="assignedStaff"]:checked')).map(cb => cb.value);

    const updatedShifts = rotaData[day].map(shift =>
        shift.id === shiftId ? { ...shift, staff: checkedUids } : shift
    );

    const weekId = getWeekId(currentWeekStartDate);
    const rotaRef = db.collection('rota').doc(weekId);
    try {
        await rotaRef.set({ [day]: updatedShifts }, { merge: true });
        window.mainApp.closeModal();
        renderRota();
    } catch (error) {
        console.error("Error saving rota assignment:", error);
        alert("Failed to save assignment.");
    }
}

/**
 * Removes a staff member from a specific shift.
 */
async function handleRemoveStaffFromShift(day, shiftId, uid) {
    const shift = rotaData[day].find(s => s.id === shiftId);
    if (!shift) return;

    const staffName = allStaff.find(s => s.uid === uid)?.name || 'this staff member';
    if (!confirm(`Are you sure you want to remove ${staffName} from this shift?`)) return;

    const updatedStaff = shift.staff.filter(staffUid => staffUid !== uid);
    const updatedShifts = rotaData[day].map(s =>
        s.id === shiftId ? { ...s, staff: updatedStaff } : s
    );

    const weekId = getWeekId(currentWeekStartDate);
    const rotaRef = db.collection('rota').doc(weekId);
    try {
        await rotaRef.set({ [day]: updatedShifts }, { merge: true });
        renderRota();
    } catch(error) {
        console.error("Error removing staff from shift:", error);
        alert("Failed to remove staff member.");
    }
}

// --- UTILITY AND EVENT LISTENERS ---

function getWeekId(d) {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function attachRotaNavListeners() {
    document.getElementById('rotaPrevWeekBtn').addEventListener('click', () => {
        currentWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);
        renderRota();
    });
    document.getElementById('rotaNextWeekBtn').addEventListener('click', () => {
        currentWeekStartDate.setDate(currentWeekStartDate.getDate() + 7);
        renderRota();
    });
}

function attachRotaActionListeners() {
    document.getElementById('rotaGridContainer').addEventListener('click', (event) => {
        const addShiftBtn = event.target.closest('.add-shift-btn');
        const editShiftBtn = event.target.closest('.edit-shift-btn');
        const deleteShiftBtn = event.target.closest('.delete-shift-btn');
        const assignStaffBtn = event.target.closest('.assign-staff-btn');
        const staffTag = event.target.closest('.staff-tag-small');

        if (addShiftBtn) {
            openShiftModal(addShiftBtn.dataset.day);
        } else if (editShiftBtn) {
            const shiftCard = editShiftBtn.closest('.shift-card');
            openShiftModal(shiftCard.dataset.day, shiftCard.dataset.shiftId);
        } else if (deleteShiftBtn) {
            const shiftCard = deleteShiftBtn.closest('.shift-card');
            handleDeleteShift(shiftCard.dataset.day, shiftCard.dataset.shiftId);
        } else if (assignStaffBtn) {
            const shiftCard = assignStaffBtn.closest('.shift-card');
            openAssignStaffModal(shiftCard.dataset.day, shiftCard.dataset.shiftId);
        } else if (staffTag) {
            handleRemoveStaffFromShift(staffTag.dataset.day, staffTag.dataset.shiftId, staffTag.dataset.uid);
        }
    });
}
