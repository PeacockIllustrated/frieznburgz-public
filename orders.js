// --- orders.js ---
// Manages the rendering and logic for the Orders page.

import { db } from './firebase.js';
import { auth } from './firebase.js'; // To log who created/received the order
import { getSelectedLocation } from './config.js';
import { createOrderCardHtml, createOrderFormModalBodyHtml } from './orders-template.js';
import { getAllUniqueStockItems } from './stock.js'; // To get item list for order form
import { renderStockManagementPage } from './stock.js'; // To re-render stock page after receiving order
import { getSuppliers } from './suppliers.js'; // To get supplier list for order form

// --- DOM Elements ---
const ordersPage = document.getElementById('ordersPage');

// Caches for frequently needed data
let allUniqueStockItemsCache = [];
let allSuppliersCache = [];

/**
 * Renders the Orders page content.
 */
export async function renderOrdersPage() {
    console.log('orders.js: renderOrdersPage called.');

    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        ordersPage.innerHTML = `
            <h2 class="page-title">Orders</h2>
            <p>Please select a location first to view orders.</p>
        `;
        return;
    }

    const locationDisplayName = selectedLocationId.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    ordersPage.innerHTML = `
        <h2 class="page-title">Orders for ${locationDisplayName}</h2>
        <div class="orders-actions">
            <button id="createNewOrderBtn" class="auth-button quick-action-btn">Create New Order</button>
            <!-- Future: Filters for status, date range etc. -->
        </div>
        <div id="ordersList" class="orders-list-grid">
            <p>Loading orders...</p>
        </div>
    `;

    const createNewOrderBtn = document.getElementById('createNewOrderBtn');
    const ordersListContainer = document.getElementById('ordersList');

    createNewOrderBtn.addEventListener('click', () => openOrderModal());

    // Pre-fetch and cache data for modals
    allUniqueStockItemsCache = await getAllUniqueStockItems();
    allSuppliersCache = await getSuppliers();

    await loadOrders(ordersListContainer);
    console.log(`orders.js: Orders page rendered for ${locationDisplayName}.`);
}

/**
 * Loads and displays orders from Firestore for the selected location.
 * @param {HTMLElement} container - The DOM element to append order cards to.
 */
async function loadOrders(container) {
    container.innerHTML = ''; // Clear loading message

    const selectedLocationId = getSelectedLocation();
    if (!selectedLocationId) {
        container.innerHTML = '<p>No location selected to load orders.</p>';
        return;
    }

    try {
        const ordersRef = db.collection('locations').doc(selectedLocationId).collection('orders');
        // Fetch recent orders, e.g., last 30 days, or simply all orders ordered by timestamp
        const querySnapshot = await ordersRef.orderBy('timestampOrdered', 'desc').get();
        const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (orders.length === 0) {
            container.innerHTML = '<p>No orders found for this location. Click "Create New Order" to get started.</p>';
            return;
        }

        orders.forEach(order => {
            container.insertAdjacentHTML('beforeend', createOrderCardHtml(order));
        });

        // Attach event listeners for order cards
        container.querySelectorAll('.view-order-details-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const orderCard = event.target.closest('.order-card');
                const orderId = orderCard.dataset.orderId;
                const orderData = orders.find(o => o.id === orderId);
                if (orderData) {
                    openOrderModal(orderData);
                } else {
                    console.error('Order data not found for ID:', orderId);
                    alert('Could not retrieve order details.');
                }
            });
        });

        container.querySelectorAll('.receive-order-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const orderCard = event.target.closest('.order-card');
                const orderId = orderCard.dataset.orderId;
                const orderData = orders.find(o => o.id === orderId);
                if (orderData) {
                    handleReceiveOrder(orderData);
                } else {
                    console.error('Order data not found for ID:', orderId);
                    alert('Could not receive order.');
                }
            });
        });

        console.log(`orders.js: Loaded ${orders.length} orders from Firestore.`);

    } catch (error) {
        console.error('orders.js: Error loading orders from Firestore:', error);
        container.innerHTML = `<p style="color:red;">Error loading orders: ${error.message}. Check console and Firebase permissions.</p>`;
    }
}

/**
 * Opens the universal modal for creating or viewing/editing an order.
 * @param {Object|null} orderData - The order object if editing, or null for creating a new one.
 */
async function openOrderModal(orderData = null) {
    const isNew = !orderData || !orderData.id;
    const title = isNew ? 'Create New Order' : `Order: ${orderData.supplierName || 'Details'}`;
    const bodyHtml = createOrderFormModalBodyHtml(orderData, allUniqueStockItemsCache, allSuppliersCache);
    let footerHtml = '';

    if (isNew) {
        footerHtml = `<button id="saveOrderBtn" class="auth-button">Save Order</button>`;
    } else {
        footerHtml = `<button id="updateOrderBtn" class="auth-button">Update Order</button>`;
        if (orderData.status === 'Pending') { // Only allow cancellation if pending
            footerHtml += `<button id="cancelOrderBtn" class="auth-button secondary-btn" style="background-color: #dc3545; border-color: #dc3545;">Cancel Order</button>`;
        }
    }
    footerHtml += `<button id="closeModalBtn" class="auth-button secondary-btn">Close</button>`;

    if (window.mainApp && typeof window.mainApp.openModal === 'function') {
        window.mainApp.openModal(title, bodyHtml, footerHtml);
    } else {
        console.error('orders.js: openModal function not found on window.mainApp.');
        alert('Could not open order modal. Please check application setup.');
        return;
    }

    // Attach event listeners for dynamic form elements AFTER modal is rendered
    const orderItemsList = document.getElementById('orderItemsList');
    const addOrderItemBtn = document.getElementById('addOrderItemBtn');

    if (addOrderItemBtn) {
        addOrderItemBtn.addEventListener('click', () => addOrderItemRow(orderItemsList, allUniqueStockItemsCache));
    }
    // Add event listeners to existing remove buttons (and future ones via delegation)
    orderItemsList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-item-btn') || event.target.closest('.remove-item-btn')) {
            const rowToRemove = event.target.closest('.order-item-row');
            if (orderItemsList.children.length > 1) { // Ensure at least one row remains
                rowToRemove.remove();
            } else {
                alert('An order must have at least one item.');
            }
        }
    });

    // Add event listener to dynamically update unit text
    orderItemsList.addEventListener('change', (event) => {
        const target = event.target;
        if (target.classList.contains('order-item-select')) {
            const selectedOption = target.options[target.selectedIndex];
            const unitSpan = target.closest('.order-item-row').querySelector('.order-item-unit');
            if (unitSpan) {
                unitSpan.textContent = selectedOption.dataset.unit || 'units';
            }
        }
    });


    // Attach modal action buttons
    const saveOrderBtn = document.getElementById('saveOrderBtn');
    const updateOrderBtn = document.getElementById('updateOrderBtn');
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (saveOrderBtn) saveOrderBtn.addEventListener('click', () => handleSaveOrder(orderData));
    if (updateOrderBtn) updateOrderBtn.addEventListener('click', () => handleSaveOrder(orderData));
    if (cancelOrderBtn) cancelOrderBtn.addEventListener('click', () => handleCancelOrder(orderData));
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
}

/**
 * Adds a new item row to the order modal form.
 * @param {HTMLElement} container - The container element (e.g., #orderItemsList).
 * @param {Array<Object>} allItems - All unique stock items to populate the select.
 * @param {Object} [initialItem={}] - Optional initial item data for pre-filling.
 */
function addOrderItemRow(container, allItems, initialItem = {}) {
    const itemOptions = allItems.map(item => `
        <option value="${item.id}" data-unit="${item.unit || 'units'}" ${initialItem.itemId === item.id ? 'selected' : ''}>
            ${item.name} (${item.unit || 'units'})
        </option>
    `).join('');

    const newRowHtml = `
        <div class="order-item-row">
            <div class="select-wrapper">
                <select class="order-item-select">
                    <option value="" disabled ${!initialItem.itemId ? 'selected' : ''}>Select Item</option>
                    ${itemOptions}
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
            </div>
            <input type="number" class="order-item-qty auth-input modal-input" value="${initialItem.quantity || ''}" min="1" placeholder="Qty">
            <span class="order-item-unit">${initialItem.unit || 'units'}</span>
            <button class="remove-item-btn secondary-btn" type="button"><i class="fas fa-times"></i></button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', newRowHtml);
}

/**
 * Handles saving/updating an order to Firestore.
 * @param {Object|null} originalOrderData - The original order object if updating, null if new.
 */
async function handleSaveOrder(originalOrderData) {
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.style.display = 'none';

    const selectedLocationId = getSelectedLocation();
    const supplierSelect = document.getElementById('orderSupplierSelect');
    const orderItemsList = document.getElementById('orderItemsList');
    const orderNotes = document.getElementById('orderNotes');

    const supplierId = supplierSelect.value;
    const supplierName = supplierSelect.options[supplierSelect.selectedIndex].text;
    const notes = orderNotes.value.trim();

    const items = [];
    let isValidOrder = true;

    orderItemsList.querySelectorAll('.order-item-row').forEach(row => {
        const itemSelect = row.querySelector('.order-item-select');
        const qtyInput = row.querySelector('.order-item-qty');
        const unitSpan = row.querySelector('.order-item-unit');

        const itemId = itemSelect.value;
        const quantity = parseInt(qtyInput.value, 10);
        const itemName = itemSelect.options[itemSelect.selectedIndex].text.split('(')[0].trim();
        const itemUnit = unitSpan.textContent;

        if (!itemId || isNaN(quantity) || quantity <= 0) {
            isValidOrder = false;
            return;
        }
        items.push({ itemId, itemName, quantity, unit: itemUnit });
    });

    if (!supplierId || !isValidOrder || items.length === 0) {
        modalMessage.textContent = 'Please select a supplier and add at least one item with a valid quantity.';
        modalMessage.style.display = 'block';
        return;
    }

    const orderToSave = {
        supplierId,
        supplierName,
        items,
        notes,
        locationId: selectedLocationId,
        orderedBy: auth.currentUser ? auth.currentUser.email : 'Unknown User',
        timestampOrdered: firebase.firestore.FieldValue.serverTimestamp(),
        status: originalOrderData?.status || 'Pending' // Retain status if updating, else 'Pending'
    };

    modalMessage.textContent = 'Saving order...';
    modalMessage.style.display = 'block';

    try {
        if (originalOrderData && originalOrderData.id) {
            // Update existing order
            await db.collection('locations').doc(selectedLocationId).collection('orders').doc(originalOrderData.id).update(orderToSave);
            console.log(`Order ${originalOrderData.id} updated in Firestore.`);
        } else {
            // Create new order
            await db.collection('locations').doc(selectedLocationId).collection('orders').add(orderToSave);
            console.log('New order created in Firestore.');
        }

        modalMessage.textContent = 'Order saved successfully!';
        setTimeout(() => {
            closeModal(); // Call main.js's exposed closeModal helper
            renderOrdersPage(); // Re-render the orders page to show updates
        }, 800);

    } catch (error) {
        console.error('orders.js: Error saving order to Firestore:', error);
        modalMessage.textContent = `Error saving order: ${error.message}`;
        modalMessage.style.display = 'block';
    }
}

/**
 * Handles marking an order as received and updating stock.
 * @param {Object} orderData - The order object to mark as received.
 */
async function handleReceiveOrder(orderData) {
    const confirmReceive = confirm(`Are you sure you want to mark order from "${orderData.supplierName}" as Received? This will update stock levels.`);
    if (!confirmReceive) {
        return;
    }

    const selectedLocationId = getSelectedLocation();
    const orderDocRef = db.collection('locations').doc(selectedLocationId).collection('orders').doc(orderData.id);
    const batch = db.batch();

    // 1. Update order status to 'Received'
    batch.update(orderDocRef, {
        status: 'Received',
        timestampReceived: firebase.firestore.FieldValue.serverTimestamp()
    });

    // 2. Increment stock for each item in the order
    orderData.items.forEach(item => {
        const itemRef = db.collection('locations').doc(selectedLocationId).collection('items').doc(item.itemId);
        batch.update(itemRef, { currentStock: firebase.firestore.FieldValue.increment(item.quantity) });
    });

    try {
        await batch.commit();
        alert(`Order from ${orderData.supplierName} successfully marked as Received. Stock updated!`);
        console.log(`Order ${orderData.id} received and stock updated.`);

        closeModal(); // Close modal if it was open
        renderOrdersPage(); // Re-render orders page
        if (window.mainApp && typeof window.mainApp.handleNavigationClick === 'function') {
            window.mainApp.handleNavigationClick('stock-management'); // Optionally navigate to stock page to see changes
        }

    } catch (error) {
        console.error('orders.js: Error receiving order and updating stock:', error);
        alert(`Failed to receive order: ${error.message}`);
    }
}

/**
 * Handles cancelling an order.
 * @param {Object} orderData - The order object to cancel.
 */
async function handleCancelOrder(orderData) {
    const confirmCancel = confirm(`Are you sure you want to cancel order from "${orderData.supplierName}"?`);
    if (!confirmCancel) {
        return;
    }

    const selectedLocationId = getSelectedLocation();
    const orderDocRef = db.collection('locations').doc(selectedLocationId).collection('orders').doc(orderData.id);

    try {
        await orderDocRef.update({
            status: 'Cancelled',
            timestampReceived: firebase.firestore.FieldValue.serverTimestamp() // Log cancellation time
        });
        alert(`Order from ${orderData.supplierName} successfully cancelled.`);
        console.log(`Order ${orderData.id} cancelled.`);

        closeModal();
        renderOrdersPage();
    } catch (error) {
        console.error('orders.js: Error cancelling order:', error);
        alert(`Failed to cancel order: ${error.message}`);
    }
}

// Helper to close modal (re-exposes global function from dashboard.js)
function closeModal() {
    if (window.mainApp && typeof window.mainApp.closeModal === 'function') {
        window.mainApp.closeModal();
    } else {
        console.error('orders.js: closeModal function not found on window.mainApp.');
    }
}
