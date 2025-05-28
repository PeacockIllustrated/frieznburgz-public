// ** YOUR FIREBASE CONFIGURATION **
const firebaseConfig = {
  apiKey: "AIzaSyA4hS3texgNpdQbjj8QIECY4n0Nl3SWwTo",
  authDomain: "friez-burgz.firebaseapp.com",
  projectId: "friez-burgz",
  storageBucket: "friez-burgz.firebasestorage.app",
  messagingSenderId: "369360939966",
  appId: "1:369360939966:web:760d870c8c0f2a8f6667ef",
  measurementId: "G-67WXCWCC2X"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const authContainer = document.getElementById('authContainer');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const authMessage = document.getElementById('authMessage');
const mainAppContainer = document.getElementById('mainAppContainer');
const logoutBtn = document.getElementById('logoutBtn'); // New logout button

// Stock Category Item Lists (matching HTML IDs and expected Firestore `category` field)
const itemLists = {
    'Meat': document.getElementById('meatItemList'),
    'Cheeses': document.getElementById('cheesesItemList'),
    'Specialz Ingredients': document.getElementById('specialsItemList'),
    'Filletz Ingredients': document.getElementById('filletzItemList'),
    'Milkshakes of the Week': document.getElementById('milkshakesItemList'),
    'Produce & Vegetables': document.getElementById('produceItemList'),
    'Sauces & Condiments': document.getElementById('saucesItemList'),
    'Breads & Baked Goods': document.getElementById('breadsItemList'),
    'Other Essentials': document.getElementById('otherItemList')
};

const wasteItemSelect = document.getElementById('wasteItemSelect');
const wasteQtySelect = document.getElementById('wasteQtySelect');
const logWasteBtn = document.getElementById('logWasteBtn');
const wasteLogList = document.getElementById('wasteLogList');

let allItems = []; // To store all stock items for waste dropdown

// --- Authentication ---

// Email/Password Login
loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        authMessage.textContent = ''; // Clear any previous error messages
    } catch (error) {
        authMessage.textContent = `Login failed: ${error.message}`;
        console.error('Login error:', error);
    }
});

// Google Sign-In
googleLoginBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
        authMessage.textContent = ''; // Clear any previous error messages
    } catch (error) {
        authMessage.textContent = `Google Sign-in failed: ${error.message}`;
        console.error('Google Sign-in error:', error);
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to log out. Please try again.');
    }
});


auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in, show app, hide auth
        authContainer.style.display = 'none';
        mainAppContainer.style.display = 'block';
        loadStockItems();
        loadWasteLog();
    } else {
        // User is signed out, show auth, hide app
        authContainer.style.display = 'flex';
        mainAppContainer.style.display = 'none';
    }
});

// --- Stock Management ---

async function loadStockItems() {
    try {
        const querySnapshot = await db.collection('items').orderBy('name').get();
        allItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Clear existing items in all category lists before rendering
        Object.values(itemLists).forEach(listElement => {
            if (listElement) listElement.innerHTML = '';
        });

        // Populate items by category
        allItems.forEach(item => {
            if (itemLists[item.category]) { // Check if the category has a corresponding HTML element
                const itemElement = createStockItemElement(item);
                itemLists[item.category].appendChild(itemElement);
            } else {
                console.warn(`No HTML element found for category: "${item.category}". Item "${item.name}" will not be displayed.`);
            }
        });

        populateWasteItemSelect(); // Populate waste dropdown after all items are loaded
    } catch (error) {
        console.error('Error loading stock items:', error);
        alert('Failed to load stock items. Check Firebase permissions and console for more details.');
    }
}

function createStockItemElement(item) {
    const div = document.createElement('div');
    div.classList.add('stock-item');
    div.dataset.itemId = item.id;

    // Determine stock indicator color based on currentStock vs reorderPoint
    let stockStatusClass = '';
    let fillHeight = '0%'; // Default to 0 height if stock is 0 or less
    // Ensure reorderPoint is a number, default to 0 if not
    const reorderPoint = typeof item.reorderPoint === 'number' ? item.reorderPoint : 0;

    if (item.currentStock <= reorderPoint / 2) {
        stockStatusClass = 'critical';
    } else if (item.currentStock <= reorderPoint) {
        stockStatusClass = 'low';
    } else if (item.currentStock > reorderPoint) {
        stockStatusClass = 'good';
    }

    // Calculate fill height based on a hypothetical max stock for visual representation
    // You might want to define a 'maxStock' field for each item in Firestore for better accuracy
    const visualMaxStock = Math.max(item.currentStock, (item.reorderQuantity || 0) * 2, reorderPoint * 3, 100); // Default to 100 if other values are too low
    if (item.currentStock >= 0) {
        fillHeight = `${Math.min(100, (item.currentStock / visualMaxStock) * 100)}%`;
    }

    div.innerHTML = `
        <div class="stock-indicator-circle ${stockStatusClass}">
             <div class="stock-indicator-fill" style="height: ${fillHeight};"></div>
        </div>
        <span class="item-name">${item.name} (${item.unit || 'units'})</span>
        <div class="stock-controls">
            <button class="control-button decrement-btn">-</button>
            <input type="number" class="stock-input" value="${item.currentStock}" min="0">
            <button class="control-button increment-btn">+</button>
        </div>
        <button class="add-stock-button reorder-btn" title="Message Supplier">
            <i class="fas fa-plus"></i>
        </button>
    `;

    // Event Listeners for controls
    const decrementBtn = div.querySelector('.decrement-btn');
    const incrementBtn = div.querySelector('.increment-btn');
    const stockInput = div.querySelector('.stock-input');
    const reorderBtn = div.querySelector('.reorder-btn');

    decrementBtn.addEventListener('click', () => updateStock(item.id, -1, stockInput));
    incrementBtn.addEventListener('click', () => updateStock(item.id, 1, stockInput));
    stockInput.addEventListener('change', () => updateStock(item.id, 0, stockInput)); // Update on manual input change
    reorderBtn.addEventListener('click', () => messageSupplier(item));

    return div;
}

async function updateStock(itemId, change, inputElement) {
    const docRef = db.collection('items').doc(itemId);
    let newStock;

    if (change === 0) { // Manual input change
        newStock = parseInt(inputElement.value, 10);
        if (isNaN(newStock) || newStock < 0) {
            alert('Please enter a valid stock quantity (non-negative number).');
            loadStockItems(); // Reload to revert invalid input
            return;
        }
    } else { // Increment/Decrement button
        const currentStock = parseInt(inputElement.value, 10);
        newStock = currentStock + change;
        if (newStock < 0) newStock = 0; // Prevent negative stock
    }

    try {
        await docRef.update({ currentStock: newStock });
        // Instead of directly updating input, let loadStockItems refresh for consistency
        // inputElement.value = newStock;
        // updateStockIndicator(itemId, newStock);
        loadStockItems(); // Re-load all items to reflect accurate stock and indicator status
        console.log(`Stock for ${itemId} updated to ${newStock}`);
    } catch (error) {
        console.error('Error updating stock:', error);
        alert('Failed to update stock. Please try again. Check Firebase permissions.');
    }
}

function updateStockIndicator(itemId, newStock) {
    const itemElement = document.querySelector(`.stock-item[data-item-id="${itemId}"]`);
    if (!itemElement) return;

    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    const circle = itemElement.querySelector('.stock-indicator-circle');
    const fill = itemElement.querySelector('.stock-indicator-fill');

    // Remove existing status classes
    circle.classList.remove('good', 'low', 'critical');

    let stockStatusClass = '';
    const reorderPoint = typeof item.reorderPoint === 'number' ? item.reorderPoint : 0;
    if (newStock <= reorderPoint / 2) {
        stockStatusClass = 'critical';
    } else if (newStock <= reorderPoint) {
        stockStatusClass = 'low';
    } else { // newStock > reorderPoint
        stockStatusClass = 'good';
    }
    circle.classList.add(stockStatusClass);

    // Recalculate fill height (same logic as createStockItemElement)
    const visualMaxStock = Math.max(newStock, (item.reorderQuantity || 0) * 2, reorderPoint * 3, 100);
    const fillHeight = `${Math.min(100, (newStock / visualMaxStock) * 100)}%`;
    fill.style.height = fillHeight;
}


function messageSupplier(item) {
    // For MVP, open mailto link with pre-filled content.
    // In a real app, this would trigger a backend function to send an email.
    const recipient = 'supplier@example.com'; // Replace with actual supplier email
    const subject = `Order Request: ${item.name} from Friez n Burgz`;
    const body = `Dear Supplier,\n\nWe would like to order ${item.reorderQuantity || 'N/A'} ${item.unit || 'units'} of ${item.name}.\n\nOur current stock is ${item.currentStock} ${item.unit || 'units'}.\n\nPlease let us know the availability and estimated delivery time.\n\nThank you,\nFriez n Burgz Management`;

    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    alert(`Drafting email to supplier for ${item.name}. Please check your email client. Remember, a human must approve this order.`);
}


// --- Wastage Log ---
function populateWasteItemSelect() {
    wasteItemSelect.innerHTML = '<option value="">Select Item</option>'; // Default option
    // Sort items alphabetically for easier selection
    const sortedItems = [...allItems].sort((a, b) => a.name.localeCompare(b.name));
    sortedItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        wasteItemSelect.appendChild(option);
    });

    wasteQtySelect.innerHTML = '<option value="">Select Qty</option>'; // Default option
    for (let i = 1; i <= 50; i++) { // Max 50 units for waste, adjust as needed
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        wasteQtySelect.appendChild(option);
    }
}

logWasteBtn.addEventListener('click', async () => {
    const selectedItemId = wasteItemSelect.value;
    const wastedQty = parseInt(wasteQtySelect.value, 10);

    if (!selectedItemId || isNaN(wastedQty) || wastedQty <= 0) {
        alert('Please select an item and a valid quantity for waste.');
        return;
    }

    const item = allItems.find(i => i.id === selectedItemId);
    if (!item) {
        alert('Selected item not found.');
        return;
    }

    const reason = prompt(`Reason for wasting ${wastedQty} ${item.unit || 'units'} of ${item.name}?`);
    if (reason === null || reason.trim() === '') {
        alert('Waste not logged. Reason is required.');
        return;
    }

    try {
        // Log waste
        await db.collection('wastage_log').add({
            item: item.name,
            itemId: item.id,
            quantity: wastedQty,
            unit: item.unit || 'units',
            reason: reason,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: auth.currentUser ? auth.currentUser.email : 'Unknown User'
        });

        // Deduct from current stock
        const currentStockRef = db.collection('items').doc(item.id);
        await currentStockRef.update({
            currentStock: firebase.firestore.FieldValue.increment(-wastedQty)
        });

        alert(`Logged ${wastedQty} of ${item.name} as wasted and updated stock.`);
        wasteItemSelect.value = '';
        wasteQtySelect.value = '';
        loadStockItems(); // Reload to show updated stock
        loadWasteLog(); // Reload waste log
    } catch (error) {
        console.error('Error logging waste:', error);
        alert('Failed to log waste. Please try again. Check Firebase permissions.');
    }
});

async function loadWasteLog() {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoTimestamp = firebase.firestore.Timestamp.fromDate(sevenDaysAgo);

        const querySnapshot = await db.collection('wastage_log')
            .where('timestamp', '>=', sevenDaysAgoTimestamp)
            .orderBy('timestamp', 'desc')
            .limit(5) // Show last 5 entries
            .get();

        wasteLogList.innerHTML = '';
        if (querySnapshot.empty) {
            const li = document.createElement('li');
            li.textContent = 'No waste logged in the last 7 days.';
            wasteLogList.appendChild(li);
        } else {
            querySnapshot.forEach(doc => {
                const data = doc.data();
                // Ensure timestamp exists and is a Firestore Timestamp object before converting
                const timestampDate = data.timestamp instanceof firebase.firestore.Timestamp
                                    ? data.timestamp.toDate().toLocaleString()
                                    : (data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : 'N/A'); // Fallback for older timestamps

                const li = document.createElement('li');
                li.classList.add('waste-log-item');
                // Trim the reason for display if it's too long
                const displayReason = data.reason.length > 50 ? data.reason.substring(0, 47) + '...' : data.reason;
                li.textContent = `${data.item} | ${data.quantity} ${data.unit || 'units'} | ${timestampDate} - ${displayReason}`;
                wasteLogList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error loading waste log:', error);
        // Do not alert for this, as it might happen often due to no logs
    }
}
