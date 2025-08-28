// --- rota.js ---
import { db } from './firebase.js';
import {
    createRotaContainerHtml,
    createRotaGridHtml,
    createRotaMobileHtml,
    createAssignStaffModalHtml
} from './rota-template.js';

let currentWeekStartDate;
let allStaff = [];

/**
 * Main function to render the entire rota page.
 */
export async function renderRotaPage() {
    const rotaContent = document.getElementById('rotaContent');
    rotaContent.innerHTML = `<div id="rotaContainer"></div>`;

    // Set initial date to the start of the current week (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1...
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
    currentWeekStartDate = new Date(today.setDate(diff));
    currentWeekStartDate.setHours(0, 0, 0, 0); // Normalize to midnight

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
 * Renders the weekly rota section.
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
        const rotaData = rotaDoc.exists ? rotaDoc.data() : {};

        rotaGridContainer.innerHTML = createRotaGridHtml(rotaData, allStaff) + createRotaMobileHtml(rotaData, allStaff);

        attachRotaActionListeners();
    } catch (error) {
        console.error("Error rendering rota:", error);
        rotaGridContainer.innerHTML = `<p class="error-message">Could not load rota.</p>`;
    }
}

/**
 * Opens the modal to assign staff to a specific shift.
 */
async function openAssignStaffModal(day, shift) {
    const weekId = getWeekId(currentWeekStartDate);
    const rotaDoc = await db.collection('rota').doc(weekId).get();
    const assignedUids = rotaDoc.exists ? rotaDoc.data()[day]?.[shift] || [] : [];

    const bodyHtml = createAssignStaffModalHtml(allStaff, assignedUids);
    const footerHtml = `<button id="saveRotaAssignmentBtn" class="auth-button">Save</button>`;

    window.mainApp.openModal(`Assign Staff: ${day.charAt(0).toUpperCase() + day.slice(1)} (${shift})`, bodyHtml, footerHtml);

    document.getElementById('saveRotaAssignmentBtn').addEventListener('click', () => handleSaveRotaAssignment(day, shift));
}

/**
 * Saves the selected staff for a shift to Firestore.
 */
async function handleSaveRotaAssignment(day, shift) {
    const weekId = getWeekId(currentWeekStartDate);
    const form = document.getElementById('assignStaffForm');
    const checkedUids = Array.from(form.querySelectorAll('input[name="assignedStaff"]:checked')).map(cb => cb.value);

    const rotaRef = db.collection('rota').doc(weekId);
    try {
        await rotaRef.set({ [day]: { [shift]: checkedUids } }, { merge: true });
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
async function handleRemoveStaffFromShift(day, shift, uid) {
    const staffName = allStaff.find(s => s.uid === uid)?.name || 'this staff member';
    if (!confirm(`Are you sure you want to remove ${staffName} from this shift?`)) return;

    const weekId = getWeekId(currentWeekStartDate);
    const rotaRef = db.collection('rota').doc(weekId);
    try {
        await rotaRef.update({
            [`${day}.${shift}`]: firebase.firestore.FieldValue.arrayRemove(uid)
        });
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
        const addBtn = event.target.closest('.add-staff-btn');
        const staffTag = event.target.closest('.staff-tag');

        if (addBtn) {
            const { day, shift } = addBtn.dataset;
            openAssignStaffModal(day, shift);
        } else if (staffTag) {
            const { day, shift, uid } = staffTag.dataset;
            handleRemoveStaffFromShift(day, shift, uid);
        }
    });
}
