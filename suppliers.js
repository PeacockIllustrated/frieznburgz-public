// --- suppliers.js ---
// Manages the rendering and logic for the Suppliers page.

import { db } from './firebase.js'; // Firebase Firestore instance
import { getSelectedLocation } from './config.js'; // To ensure a location is selected (though suppliers might be global)
import { createSupplierCardHtml, createSupplierDetailsModalBodyHtml } from './suppliers-template.js'; // Template for supplier cards and modal body

// --- DOM Elements ---
const suppliersPage = document.getElementById('suppliersPage');

// Universal Modal Elements (assume it's managed by dashboard.js, but suppliers.js will use it)
const universalModal = document.getElementById('universalModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalMessage = document.getElementById('modalMessage');
const modalFooter = document.getElementById('modalFooter');

// Mock data for suppliers (will eventually come from Firestore)
const mockSuppliers = [
    {
        id: 'meat_co_ltd',
        name: 'F&B Meat & Poultry Ltd',
        contactPerson: 'Sarah Jenkins',
        email: 'sales@fnbmeat.co.uk',
        phone: '+44 191 234 5678',
        address: '123 Slaughter Lane, Newcastle, NE1 1AA',
        itemsSupplied: ['Beef Patties', 'Plain Chicken Filletz', 'Chicken Breast', 'Bacon Strips'],
        notes: 'Primary supplier for all meat and poultry products. Deliveries Mon/Wed/Fri.'
    },
    {
        id: 'veg_supply_uk',
        name: 'Fresh Veg UK',
        contactPerson: 'Mohammed Ali',
        email: 'orders@freshveguk.co.uk',
        phone: '+44 7712 345678',
        address: 'Unit 5, Green Market, Durham, DH1 1BB',
        itemsSupplied: ['Shredded Lettuce', 'Diced Onions', 'Fries Potatoes'],
        notes: 'Local produce supplier. Offers organic options. Deliveries Tue/Thu.'
    },
    {
        id: 'dairy_direct',
        name: 'Dairy Direct Group',
        contactPerson: 'Emily White',
        email: 'info@dairydirect.com',
        phone: '+44 20 7946 0000',
        address: 'Dairy House, London, SW1A 0AA',
        itemsSupplied: ['American Cheese', 'Halloumi Cheese', 'Mozzarella Patties'],
        notes: 'Cheese and dairy products. Minimum order quantity applies.'
    },
    {
        id: 'sauce_solutions',
        name: 'Sauce & Condiment Solutions',
        contactPerson: 'David Lee',
        email: 'support@saucesolutions.co.uk',
        phone: '+44 161 789 0123',
        address: 'The Condiment Hub, Manchester, M1 2BB',
        itemsSupplied: ['Classic Sauce', 'Heinz Ketchup', 'Special Sauce Base', 'Honey Chilli Glaze'],
        notes: 'Specializes in custom sauces. Lead time of 3-5 days for bespoke orders.'
    },
    {
        id: 'bakery_bakes',
        name: 'Daily Bakes Bakery',
        contactPerson: 'Chris Green',
        email: 'contact@dailybakes.co.uk',
        phone: '+44 113 555 1234',
        address: 'Bakers Lane, Leeds, LS1 3AB',
        itemsSupplied: ['Burger Buns'],
        notes: 'Freshly baked buns daily. Orders must be placed 24 hours in advance.'
    }
];


/**
 * Renders the Suppliers Management page.
 * Fetches and displays supplier information.
 */
export async function renderSuppliersPage() {
    const selectedLocationId = getSelectedLocation(); // Still good to check for location context
    if (!selectedLocationId) {
        // While suppliers might be global, we still assume a location context for the dashboard
        suppliersPage.innerHTML = `
            <h2 class="page-title">Suppliers</h2>
            <p>Please select a location first to manage suppliers, or manage global suppliers (future feature).</p>
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

    await loadSuppliers(supplierListContainer);
    console.log('Suppliers page rendered.');
}

/**
 * Loads and displays supplier cards.
 * @param {HTMLElement} container - The DOM element to append supplier cards to.
 */
async function loadSuppliers(container) {
    container.innerHTML = ''; // Clear loading message

    // In a real app, this would fetch from Firestore:
    // const suppliersRef = db.collection('suppliers'); // Or db.collection('locations').doc(selectedLocationId).collection('suppliers');
    // const querySnapshot = await suppliersRef.get();
    // const suppliers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const suppliers = mockSuppliers; // Using mock data for now

    if (suppliers.length === 0) {
        container.innerHTML = '<p>No suppliers found. Click "Add New Supplier" to get started.</p>';
        return;
    }

    suppliers.forEach(supplier => {
        container.insertAdjacentHTML('beforeend', createSupplierCardHtml(supplier));
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
                alert('Could not retrieve supplier details.');
            }
        });
    });

    console.log(`Loaded ${suppliers.length} suppliers.`);
}

/**
 * Opens the universal modal for adding or viewing/editing a supplier.
 * @param {Object|null} supplierData - The supplier object if editing, or null for adding a new one.
 */
function openSupplierModal(supplierData = null) {
    const isNew = !supplierData;
    const title = isNew ? 'Add New Supplier' : `Details: ${supplierData.name}`;
    const bodyHtml = createSupplierDetailsModalBodyHtml(supplierData);
    const footerHtml = `
        ${isNew ? `<button id="saveSupplierBtn" class="auth-button">Add Supplier</button>` : `<button id="editSupplierBtn" class="auth-button">Edit Details</button>`}
        <button id="cancelSupplierBtn" class="auth-button secondary-btn">Cancel</button>
    `;

    // Helper from dashboard.js to open the modal
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
        if (!isNew) { // If editing existing, initially disable edit button until changes are made (optional)
            // For now, we'll just allow direct editing after clicking "Edit Details"
        }
    }
}

/**
 * Handles saving or editing a supplier via the modal.
 * @param {Object|null} originalSupplierData - The original supplier object if editing, null if adding.
 */
async function handleSaveOrEditSupplier(originalSupplierData) {
    // Get values from modal inputs
    const supplierId = originalSupplierData ? originalSupplierData.id : null;
    const name = document.getElementById('supplierName').value.trim();
    const contactPerson = document.getElementById('contactPerson').value.trim();
    const email = document.getElementById('supplierEmail').value.trim();
    const phone = document.getElementById('supplierPhone').value.trim();
    const address = document.getElementById('supplierAddress').value.trim();
    const notes = document.getElementById('supplierNotes').value.trim();

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
        // For new suppliers, itemsSupplied would typically be empty or linked in stock
        itemsSupplied: originalSupplierData ? originalSupplierData.itemsSupplied : []
    };

    modalMessage.textContent = 'Saving supplier...';
    modalMessage.style.display = 'block';

    try {
        // In a real Firebase app:
        // if (supplierId) {
        //     await db.collection('suppliers').doc(supplierId).update(supplierToSave);
        //     console.log(`Supplier ${supplierId} updated.`);
        // } else {
        //     await db.collection('suppliers').add(supplierToSave); // Firestore will generate ID
        //     console.log('New supplier added.');
        // }

        // For mock data, simulate save
        if (originalSupplierData) {
            Object.assign(originalSupplierData, supplierToSave); // Update in mock array
            console.log(`Mock supplier ${supplierId} updated.`);
        } else {
            // Assign a simple mock ID for the new entry for display purposes
            const newMockId = `mock_supplier_${mockSuppliers.length + 1}`;
            mockSuppliers.push({ id: newMockId, ...supplierToSave });
            console.log('New mock supplier added.');
        }


        modalMessage.textContent = 'Supplier saved successfully!';
        setTimeout(() => {
            closeModal(); // Call dashboard.js's closeModal helper
            renderSuppliersPage(); // Re-render the suppliers page to show updates
        }, 800);

    } catch (error) {
        console.error('Error saving supplier:', error);
        modalMessage.textContent = `Error saving supplier: ${error.message}`;
        modalMessage.style.display = 'block';
    }
}

// Re-expose closeModal from mainApp/dashboard.js for use within this module
// This is a workaround since modal functions are centralized in dashboard.js
function closeModal() {
    if (window.mainApp && typeof window.mainApp.closeModal === 'function') {
        window.mainApp.closeModal();
    } else {
        console.error('Error: closeModal function not found on window.mainApp.');
    }
}
