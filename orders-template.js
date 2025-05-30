// --- orders-template.js ---
// Provides HTML templating for the Orders page components.

/**
 * Generates the HTML for a single order card/summary item.
 * @param {Object} order - The order object.
 * @returns {string} The HTML string for an order card.
 */
export function createOrderCardHtml(order) {
    const orderDate = order.timestampOrdered ? order.timestampOrdered.toDate().toLocaleDateString() : 'N/A';
    const receivedDate = order.timestampReceived ? order.timestampReceived.toDate().toLocaleDateString() : 'Not Received';
    const totalItems = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

    let statusClass = '';
    if (order.status === 'Pending') {
        statusClass = 'status-pending';
    } else if (order.status === 'Received') {
        statusClass = 'status-received';
    } else if (order.status === 'Cancelled') {
        statusClass = 'status-cancelled';
    }

    return `
        <div class="order-card ${statusClass}" data-order-id="${order.id}">
            <div class="order-summary-header">
                <h3 class="order-supplier-name">${order.supplierName || 'No Supplier'}</h3>
                <span class="order-status ${statusClass}">${order.status}</span>
            </div>
            <div class="order-summary-details">
                <p>Ordered: ${orderDate} by ${order.orderedBy || 'Unknown'}</p>
                <p>Total Items: ${totalItems}</p>
                <p>Received: ${receivedDate}</p>
            </div>
            <div class="order-actions">
                <button class="auth-button small-btn view-order-details-btn">View Details</button>
                ${order.status === 'Pending' ? `<button class="auth-button small-btn receive-order-btn">Receive Order</button>` : ''}
            </div>
        </div>
    `;
}

/**
 * Generates the HTML for the order form/details modal body.
 * @param {Object} order - The order object (for editing) or null/empty (for new).
 * @param {Array<Object>} allItems - All unique stock items.
 * @param {Array<Object>} allSuppliers - All available suppliers.
 * @returns {string} The HTML string for the order modal form.
 */
export function createOrderFormModalBodyHtml(order = {}, allItems = [], allSuppliers = []) {
    const isNew = !order.id;

    // Build supplier options
    let supplierOptions = '<option value="" disabled selected>Select Supplier</option>';
    if (allSuppliers.length === 0) {
        supplierOptions += '<option value="" disabled>No suppliers found</option>';
    } else {
        allSuppliers.forEach(supplier => {
            const selected = order.supplierId === supplier.id ? 'selected' : '';
            supplierOptions += `<option value="${supplier.id}" ${selected}>${supplier.name}</option>`;
        });
    }

    // Build item options for dynamic rows
    let itemOptions = '<option value="" disabled selected>Select Item</option>';
    if (allItems.length === 0) {
        itemOptions += '<option value="" disabled>No items found</option>';
    } else {
        const categorizedItems = allItems.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});

        Object.keys(categorizedItems).sort().forEach(category => {
            itemOptions += `<optgroup label="${category}">`;
            categorizedItems[category].sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
                itemOptions += `<option value="${item.id}" data-unit="${item.unit || 'units'}">${item.name} (${item.unit || 'units'})</option>`;
            });
            itemOptions += `</optgroup>`;
        });
    }

    // Generate initial item rows for existing order or one empty row for new order
    let initialItemRowsHtml = '';
    const itemsToDisplay = (order.items && order.items.length > 0) ? order.items : [{}]; // One empty object for new row

    itemsToDisplay.forEach((item, index) => {
        const selectedItemOption = item.itemId ? `value="${item.itemId}" selected` : '';
        initialItemRowsHtml += `
            <div class="order-item-row" data-item-id="${item.itemId || ''}">
                <div class="select-wrapper">
                    <select class="order-item-select">${itemOptions.replace(selectedItemOption, `${selectedItemOption} selected`)}</select>
                    <i class="fas fa-chevron-down select-arrow"></i>
                </div>
                <input type="number" class="order-item-qty auth-input modal-input" value="${item.quantity || ''}" min="1" placeholder="Qty">
                <span class="order-item-unit">${item.unit || 'units'}</span>
                <button class="remove-item-btn secondary-btn" type="button"><i class="fas fa-times"></i></button>
            </div>
        `;
    });


    // Read-only fields for existing orders
    const orderedBy = order.orderedBy || 'N/A';
    const timestampOrdered = order.timestampOrdered ? order.timestampOrdered.toDate().toLocaleString() : 'N/A';
    const timestampReceived = order.timestampReceived ? order.timestampReceived.toDate().toLocaleString() : 'Not Received';

    return `
        <div class="modal-order-form">
            ${!isNew ? `
                <div class="order-info-read-only">
                    <p><strong>Status:</strong> <span class="order-status-display">${order.status || 'Unknown'}</span></p>
                    <p><strong>Ordered By:</strong> ${orderedBy}</p>
                    <p><strong>Ordered On:</strong> ${timestampOrdered}</p>
                    <p><strong>Received On:</strong> ${timestampReceived}</p>
                    <hr class="order-divider"/>
                </div>
            ` : ''}

            <div class="modal-input-group">
                <label for="orderSupplierSelect">Supplier:</label>
                <div class="select-wrapper">
                    <select id="orderSupplierSelect" class="order-select" ${!isNew ? 'disabled' : ''}>${supplierOptions}</select>
                    <i class="fas fa-chevron-down select-arrow"></i>
                </div>
            </div>

            <div class="order-items-list-container">
                <label>Order Items:</label>
                <div id="orderItemsList" class="order-items-list">
                    ${initialItemRowsHtml}
                </div>
                <button id="addOrderItemBtn" class="auth-button small-btn" type="button">Add Item</button>
            </div>

            <div class="modal-input-group">
                <label for="orderNotes">Notes:</label>
                <textarea id="orderNotes" class="auth-input modal-input" placeholder="Any delivery notes or special instructions...">${order.notes || ''}</textarea>
            </div>
        </div>
    `;
}
