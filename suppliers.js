// --- suppliers.js ---
// Manages the rendering and logic for the Suppliers page.

import { db } from './firebase.js'; // Firebase Firestore instance
import { getSelectedLocation } from './config.js'; // To ensure a location is selected (though suppliers might be global)
import { createSupplierCardHtml, createSupplierDetailsModalBodyHtml } from './suppliers-template.js'; // Template for supplier cards and modal body
import { getAllUniqueStockItems } from './stock.js'; // NEW: To get a global list of items

// --- Universal Modal Elements ---
// (Assume these are managed by dashboard.js and exposed via window.mainApp)
// No direct DOM element retrieval here, instead use window.mainApp.openModal/closeModal
// and modalMessage for feedback.

// Define a variable to hold all unique items globally for the suppliers module
let allUniqueStockItemsCache = [];

/**
 * Renders the Suppliers Management page.
 * Fetches and displays supplier information.
 */
export async function renderSuppliersPage() {
    const suppliersPage = document.getElementById('suppliersPage'); // Get it here on render

    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        suppliersPage.innerHTML = `
            <h2 class="page-title">Suppliers</h2>
            <p>Please select a location first to manage suppliers.</p>
        `;
        return;
    }

    suppliersPage.innerHTML = `
        <h2 class="page-title">Suppliers</h2>
        <div class="suppliers-actions">
            <button id="addSupplierBtn" class="auth-button quick-action-btn">Add New Supplier</button>
        </div>
        <div id="supplierList" class="supplier-list-grid">
            <!-- Supplier cards will be loaded here -->
            <p>Loading suppliers...</p>
        </div>
    `;

    const addSupplierBtn = document.getElementById('addSupplierBtn');
    const supplierListContainer = document.getElementById('supplierList');

    addSupplierBtn.addEventListener('click', () => openSupplierModal());

    // Pre-fetch all unique items once when rendering the page
    allUniqueStockItemsCache = await getAllUniqueStockItems();

    await loadSuppliers(supplierListContainer);
    console.log('Suppliers page rendered.');
}

/**
 * Loads and displays supplier cards from Firestore.
 * @param {HTMLElement} container - The DOM element to append supplier cards to.
 */
async function loadSuppliers(container) {
    container.innerHTML = ''; // Clear loading message

    try {
        // Fetch suppliers from a global 'suppliers' collection
        const suppliersRef = db.collection('suppliers');
        const querySnapshot = await suppliersRef.orderBy('name').get();
        const suppliers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (suppliers.length === 0) {
            container.innerHTML = '<p>No suppliers found. Click "Add New Supplier" to get started.</p>';
            return;
        }

        suppliers.forEach(supplier => {
            // Pass the cached allUniqueStockItemsCache to the card template
            container.insertAdjacentHTML('beforeend', createSupplierCardHtml(supplier, allUniqueStockItemsCache));
        });

        // Attach event listeners to "View Details" buttons
        container.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const supplierCard = event.target.closest('.supplier-card');
                const supplierId = supplierCard.dataset.supplierId;
                const supplierData = suppliers.find(s => s.id === supplierId);
                if (supplierData) {
                    openSupplierModal(supplierData);
                } else {
                    console.error('Supplier data not found for ID:', supplierId);
                    // Use modal message for user feedback
                    if (window.mainApp && typeof window.mainApp.openModal === 'function') {
                        window.mainApp.openModal('Error', '<p>Could not retrieve supplier details.</p>', '', 'red');
                    }
                }
            });
        });

        console.log(`Loaded ${suppliers.length} suppliers from Firestore.`);

    } catch (error) {
        console.error('Error loading suppliers from Firestore:', error);
        container.innerHTML = `<p style="color:red;">Error loading suppliers: ${error.message}. Check console and Firebase permissions.</p>`;
    }
}

/**
 * Opens the universal modal for adding or viewing/editing a supplier.
 * @param {Object|null} supplierData - The supplier object if editing, or null for adding a new one.
 */
async function openSupplierModal(supplierData = null) {
    const isNew = !supplierData || !supplierData.id; // Corrected check for new supplier
    const title = isNew ? 'Add New Supplier' : `Details: ${supplierData.name}`;

    // Use the pre-fetched allUniqueStockItemsCache
    const bodyHtml = createSupplierDetailsModalBodyHtml(supplierData, allUniqueStockItemsCache);
    let footerHtml = '';

    if (isNew) {
        footerHtml = `<button id="saveSupplierBtn" class="auth-button">Add Supplier</button>`;
    } else {
        footerHtml = `<button id="editSupplierBtn" class="auth-button">Save Changes</button>`;
        // Consider a delete button for existing suppliers
        footerHtml += `<button id="deleteSupplierBtn" class="auth-button secondary-btn" style="background-color: #dc3545; border-color: #dc3545;">Delete Supplier</button>`;
    }
    footerHtml += `<button id="cancelSupplierBtn" class="auth-button secondary-btn">Cancel</button>`;


    // Use modal functions exposed by main.js
    if (window.mainApp && typeof window.mainApp.openModal === 'function') {
        window.mainApp.openModal(title, bodyHtml, footerHtml);
    } else {
        console.error('Error: openModal function not found on window.mainApp. Is dashboard.js loaded and exported correctly?');
        alert('Could not open supplier modal. Please check application setup.');
        return;
    }

    // Attach event listeners to modal buttons AFTER modal is open
    document.getElementById('cancelSupplierBtn').addEventListener('click', closeModal);

    const saveOrEditBtn = document.getElementById(isNew ? 'saveSupplierBtn' : 'editSupplierBtn');
    if (saveOrEditBtn) {
        saveOrEditBtn.addEventListener('click', () => handleSaveOrEditSupplier(supplierData));
    }

    const deleteBtn = document.getElementById('deleteSupplierBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => handleDeleteSupplier(supplierData.id, supplierData.name));
    }
}

/**
 * Handles saving or editing a supplier via the modal, connecting to Firestore.
 * @param {Object|null} originalSupplierData - The original supplier object if editing, null if adding.
 */
async function handleSaveOrEditSupplier(originalSupplierData) {
    const modalMessage = document.getElementById('modalMessage'); // Get modal message element
    modalMessage.style.display = 'none'; // Hide previous message

    // Get values from modal inputs
    const supplierId = originalSupplierData ? originalSupplierData.id : null;
    const name = document.getElementById('supplierName').value.trim();
    const contactPerson = document.getElementById('contactPerson').value.trim();
    const email = document.getElementById('supplierEmail').value.trim();
    const phone = document.getElementById('supplierPhone').value.trim();
    const address = document.getElementById('supplierAddress').value.trim();
    const notes = document.getElementById('supplierNotes').value.trim();

    // NEW: Get selected items from checkboxes
    const selectedItemsCheckboxes = document.querySelectorAll('.modal-supplier-details-form input[name="itemsSupplied"]:checked');
    const itemsSupplied = Array.from(selectedItemsCheckboxes).map(cb => cb.value);


    if (!name || !contactPerson || !email || !phone) {
        modalMessage.textContent = 'Please fill in all required fields (Name, Contact Person, Email, Phone).';
        modalMessage.style.display = 'block';
        return;
    }

    const supplierToSave = {
        name,
        contactPerson,
        email,
        phone,
        address,
        notes,
        itemsSupplied // NEW: Use the array from checked checkboxes
    };

    modalMessage.textContent = 'Processing...';
    modalMessage.style.display = 'block';

    try {
        if (supplierId) {
            // Update existing supplier
            await db.collection('suppliers').doc(supplierId).update(supplierToSave);
            console.log(`Supplier ${supplierId} updated in Firestore.`);
        } else {
            // Add new supplier
            await db.collection('suppliers').add(supplierToSave); // Firestore will generate ID
            console.log('New supplier added to Firestore.');
        }

        modalMessage.textContent = 'Supplier saved successfully!';
        setTimeout(() => {
            closeModal(); // Call main.js's exposed closeModal helper
            renderSuppliersPage(); // Re-render the suppliers page to show updates
        }, 800);

    } catch (error) {
        console.error('Error saving supplier to Firestore:', error);
        modalMessage.textContent = `Error saving supplier: ${error.message}`;
        modalMessage.style.display = 'block';
    }
}

/**
 * Handles deleting a supplier from Firestore.
 * @param {string} supplierId - The ID of the supplier to delete.
 * @param {string} supplierName - The name of the supplier for confirmation message.
 */
async function handleDeleteSupplier(supplierId, supplierName) {
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.style.display = 'none';

    const confirmDelete = confirm(`Are you sure you want to delete supplier "${supplierName}"? This action cannot be undone.`);
    if (!confirmDelete) {
        modalMessage.textContent = 'Deletion cancelled.';
        modalMessage.style.display = 'block';
        return;
    }

    modalMessage.textContent = 'Deleting supplier...';
    modalMessage.style.display = 'block';

    try {
        await db.collection('suppliers').doc(supplierId).delete();
        console.log(`Supplier ${supplierId} deleted from Firestore.`);

        modalMessage.textContent = 'Supplier deleted successfully!';
        setTimeout(() => {
            closeModal();
            renderSuppliersPage(); // Re-render the suppliers page after deletion
        }, 800);

    } catch (error) {
        console.error('Error deleting supplier from Firestore:', error);
        modalMessage.textContent = `Error deleting supplier: ${error.message}`;
        modalMessage.style.display = 'block';
    }
}


// Expose closeModal from mainApp/dashboard.js for use within this module
// This is a workaround since modal functions are centralized in dashboard.js
function closeModal() {
    if (window.mainApp && typeof window.mainApp.closeModal === 'function') {
        window.mainApp.closeModal();
    } else {
        console.error('Error: closeModal function not found on window.mainApp.');
    }
}
