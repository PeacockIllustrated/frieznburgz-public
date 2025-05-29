// --- suppliers-template.js ---
// Provides HTML templating for supplier page components.

/**
 * Generates the HTML for a single supplier card/list item.
 * @param {Object} supplier - The supplier object.
 * @returns {string} The HTML string for a supplier card.
 */
export function createSupplierCardHtml(supplier) {
    return `
        <div class="supplier-card" data-supplier-id="${supplier.id}">
            <h3 class="supplier-name">${supplier.name}</h3>
            <p class="supplier-contact">Contact: ${supplier.contactPerson}</p>
            <p class="supplier-email"><i class="fas fa-envelope"></i> ${supplier.email}</p>
            <p class="supplier-phone"><i class="fas fa-phone-alt"></i> ${supplier.phone}</p>
            <button class="auth-button small-btn view-details-btn">View Details</button>
        </div>
    `;
}

/**
 * Generates the HTML for the supplier details modal body.
 * @param {Object} supplier - The supplier object. Can be null/undefined for 'add new'.
 * @returns {string} The HTML string for the supplier details form/display.
 */
export function createSupplierDetailsModalBodyHtml(supplier) {
    // Safely destructure properties, providing default empty values if supplier is null/undefined
    const {
        id,
        name,
        contactPerson,
        email,
        phone,
        address,
        itemsSupplied = [], // Default to empty array
        notes
    } = supplier || {}; // If supplier is null/undefined, use an empty object

    const isNew = !id; // Determine if it's a new supplier based on 'id' existence
    const itemsSuppliedList = itemsSupplied
        .map(item => `<li>${item}</li>`).join('');

    return `
        <div class="modal-supplier-details-form">
            <div class="modal-input-group">
                <label for="supplierName">Supplier Name:</label>
                <input type="text" id="supplierName" class="auth-input modal-input" value="${name || ''}" placeholder="e.g., Premium Meat Co." ${isNew ? '' : 'readonly'}>
            </div>
            <div class="modal-input-group">
                <label for="contactPerson">Contact Person:</label>
                <input type="text" id="contactPerson" class="auth-input modal-input" value="${contactPerson || ''}" placeholder="e.g., John Smith">
            </div>
            <div class="modal-input-group">
                <label for="supplierEmail">Email:</label>
                <input type="email" id="supplierEmail" class="auth-input modal-input" value="${email || ''}" placeholder="e.g., info@meatco.com">
            </div>
            <div class="modal-input-group">
                <label for="supplierPhone">Phone:</label>
                <input type="tel" id="supplierPhone" class="auth-input modal-input" value="${phone || ''}" placeholder="e.g., +44 1234 567890">
            </div>
            <div class="modal-input-group">
                <label for="supplierAddress">Address (Optional):</label>
                <textarea id="supplierAddress" class="auth-input modal-input" placeholder="e.g., 123 Food Street, City, Postcode">${address || ''}</textarea>
            </div>
            <div class="modal-input-group">
                <label>Items Supplied:</label>
                <ul class="items-supplied-list">
                    ${itemsSuppliedList || '<li class="no-items-listed">No specific items listed.</li>'}
                </ul>
                <p class="small-text">Note: Items supplied is for display only. Not directly editable here.</p>
            </div>
            <div class="modal-input-group">
                <label for="supplierNotes">Notes:</label>
                <textarea id="supplierNotes" class="auth-input modal-input" placeholder="Any special notes about this supplier...">${notes || ''}</textarea>
            </div>
        </div>
    `;
}
