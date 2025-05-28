// --- 1. Firebase Configuration ---
// IMPORTANT: This is your unique Firebase project configuration.
// Do not share your apiKey publicly in production applications.
const firebaseConfig = {
  apiKey: "AIzaSyA4hS3texgNpdQbjj8QIECY4n0Nl3SWwTo",
  authDomain: "friez-burgz.firebaseapp.com",
  projectId: "friez-burgz",
  storageBucket: "friez-burgz.firebasestorage.app",
  messagingSenderId: "369360939966",
  appId: "1:369360939966:web:760d870c8c0f2a8f6667ef",
  measurementId: "G-67WXCWCC2X"
};

// Initialize Firebase services
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- 2. DOM Element References ---
const authContainer = document.getElementById('authContainer');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn'); // Email login button
const googleLoginBtn = document.getElementById('googleLoginBtn'); // Google login button
const authMessage = document.getElementById('authMessage'); // Authentication message display
const mainAppContainer = document.getElementById('mainAppContainer'); // Main application container
const logoutBtn = document.getElementById('logoutBtn'); // Logout button

// Stock Category Item Lists (Mapped to HTML container IDs)
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

// Wastage Log Elements
const wasteItemSelect = document.getElementById('wasteItemSelect');
const wasteQtySelect = document.getElementById('wasteQtySelect');
const logWasteBtn = document.getElementById('logWasteBtn');
const wasteLogList = document.getElementById('wasteLogList');

let allItems = []; // Global array to store all loaded stock items for quick lookup

// --- 3. Authentication Logic ---

// Email/Password Login Handler
loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        authMessage.textContent = ''; // Clear any previous error messages on success
    } catch (error) {
        authMessage.textContent = `Login failed: ${error.message}`;
        console.error('Email/Password Login error:', error);
    }
});

// Google Sign-In Handler
googleLoginBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
        authMessage.textContent = ''; // Clear any previous error messages on success
    } catch (error) {
        authMessage.textContent = `Google Sign-in failed: ${error.message}`;
        console.error('Google Sign-in error:', error);
    }
});

// Logout Handler
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to log out. Please try again.');
    }
});

// Firebase Authentication State Observer
// This function runs whenever the user's sign-in status changes.
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in, show the main application
        authContainer.style.display = 'none';
        mainAppContainer.style.display = 'block';
        loadStockItems(); // Load stock data
        loadWasteLog();   // Load waste log
    } else {
        // User is signed out, show the authentication screen
        authContainer.style.display = 'flex';
        mainAppContainer.style.display = 'none';
        // Clear inputs on logout for security
        loginEmail.value = '';
        loginPassword.value = '';
        authMessage.textContent = '';
    }
});

// --- 4. Stock Management Logic ---

/**
 * Fetches all stock items from Firestore and renders them into their respective categories.
 */
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
                // Log a warning if an item's category doesn't have a matching HTML container
                console.warn(`No HTML element found for category: "${item.category}". Item "${item.name}" will not be displayed.`);
            }
        });

        populateWasteItemSelect(); // Update the waste dropdown with current items
    } catch (error) {
        console.error('Error loading stock items:', error);
        alert('Failed to load stock items. Please check Firebase permissions and console for more details.');
    }
}

/**
 * Creates the HTML element for a single stock item.
 * @param {Object} item - The item object from Firestore.
 * @returns {HTMLElement} The created stock item div.
 */
function createStockItemElement(item) {
    const div = document.createElement('div');
    div.classList.add('stock-item');
    div.dataset.itemId = item.id; // Store Firestore document ID for easy lookup

    // Determine stock indicator color and fill level
    let stockStatusClass = '';
    let fillHeight = '0%';
    const reorderPoint = typeof item.reorderPoint === 'number' ? item.reorderPoint : 0;
    const currentStock = typeof item.currentStock === 'number' ? item.currentStock : 0;

    if (currentStock <= reorderPoint / 2) {
        stockStatusClass = 'critical';
    } else if (currentStock <= reorderPoint) {
        stockStatusClass = 'low';
    } else { // currentStock > reorderPoint
        stockStatusClass = 'good';
    }

    // Calculate fill height based on a hypothetical max stock (for visual representation only)
    const visualMaxStock = Math.max(currentStock, (item.reorderQuantity || 0) * 2, reorderPoint * 3, 100);
    if (currentStock >= 0) {
        fillHeight = `${Math.min(100, (currentStock / visualMaxStock) * 100)}%`;
    }

    div.innerHTML = `
        <div class="stock-indicator-circle ${stockStatusClass}">
             <div class="stock-indicator-fill" style="height: ${fillHeight};"></div>
        </div>
        <span class="item-name">${item.name} (${item.unit || 'units'})</span>
        <div class="stock-controls">
            <button class="control-button decrement-btn">-</button>
            <input type="number" class="stock-input" value="${currentStock}" min="0">
            <button class="control-button increment-btn">+</button>
        </div>
        <button class="add-stock-button reorder-btn" title="Message Supplier">
            <i class="fas fa-plus"></i>
        </button>
    `;

    // Add event listeners for stock controls and reorder button
    const decrementBtn = div.querySelector('.decrement-btn');
    const incrementBtn = div.querySelector('.increment-btn');
    const stockInput = div.querySelector('.stock-input');
    const reorderBtn = div.querySelector('.reorder-btn');

    decrementBtn.addEventListener('click', () => updateStock(item.id, -1, stockInput));
    incrementBtn.addEventListener('click', () => updateStock(item.id, 1, stockInput));
    // Listen for 'change' event on input to update when user types a new value
    stockInput.addEventListener('change', () => updateStock(item.id, 0, stockInput));
    reorderBtn.addEventListener('click', () => messageSupplier(item));

    return div;
}

/**
 * Updates the stock level for an item in Firestore.
 * @param {string} itemId - The ID of the item document in Firestore.
 * @param {number} change - The amount to change stock by (+1, -1) or 0 for manual input.
 * @param {HTMLInputElement} inputElement - The stock input field element.
 */
async function updateStock(itemId, change, inputElement) {
    const docRef = db.collection('items').doc(itemId);
    let newStock;

    if (change === 0) { // Manual input change (user typed a value)
        newStock = parseInt(inputElement.value, 10);
        if (isNaN(newStock) || newStock < 0) {
            alert('Please enter a valid stock quantity (non-negative number).');
            loadStockItems(); // Reload UI to revert invalid input
            return;
        }
    } else { // Increment/Decrement button click
        const currentStock = parseInt(inputElement.value, 10);
        newStock = currentStock + change;
        if (newStock < 0) newStock = 0; // Prevent stock from going negative
    }

    try {
        await docRef.update({ currentStock: newStock });
        // Instead of directly manipulating the input/indicator,
        // we reload all items to ensure UI consistency with Firestore data.
        loadStockItems();
        console.log(`Stock for ${itemId} updated to ${newStock}`);
    } catch (error) {
        console.error('Error updating stock:', error);
        alert('Failed to update stock. Please check Firebase permissions or network connection.');
    }
}

/**
 * Generates an email to the supplier for reordering.
 * @param {Object} item - The item to reorder.
 */
function messageSupplier(item) {
    // For MVP, this opens a mailto link.
    // In a future version, this would trigger a backend function to send an actual email.
    const recipient = 'supplier@example.com'; // Replace with your actual supplier email
    const subject = `Order Request: ${item.name} from Friez n Burgz`;
    const body = `Dear Supplier,\n\nWe would like to order ${item.reorderQuantity || 'N/A'} ${item.unit || 'units'} of ${item.name}.\n\nOur current stock is ${item.currentStock} ${item.unit || 'units'}.\n\nPlease let us know the availability and estimated delivery time.\n\nThank you,\nFriez n Burgz Management`;

    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    alert(`Drafting email to supplier for ${item.name}. Please check your email client. Remember, a human must approve this order.`);
}

// --- 5. Wastage Logging Logic ---

/**
 * Populates the waste item dropdown with all available stock items.
 */
function populateWasteItemSelect() {
    wasteItemSelect.innerHTML = '<option value="">Select Item</option>'; // Default placeholder option
    // Sort items alphabetically for easier selection
    const sortedItems = [...allItems].sort((a, b) => a.name.localeCompare(b.name));
    sortedItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        wasteItemSelect.appendChild(option);
    });

    wasteQtySelect.innerHTML = '<option value="">Select Qty</option>'; // Default placeholder option
    for (let i = 1; i <= 50; i++) { // Populate quantity options (adjust max as needed)
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        wasteQtySelect.appendChild(option);
    }
}

// Waste Log Button Handler
logWasteBtn.addEventListener('click', async () => {
    const selectedItemId = wasteItemSelect.value;
    const wastedQty = parseInt(wasteQtySelect.value, 10);

    if (!selectedItemId || isNaN(wastedQty) || wastedQty <= 0) {
        alert('Please select an item and a valid quantity for waste.');
        return;
    }

    const item = allItems.find(i => i.id === selectedItemId);
    if (!item) {
        alert('Selected item not found in inventory.');
        return;
    }

    // Prompt for reason, ensure it's not empty
    const reason = prompt(`Reason for wasting ${wastedQty} ${item.unit || 'units'} of ${item.name}?`);
    if (reason === null || reason.trim() === '') {
        alert('Waste not logged. A reason for wastage is required.');
        return;
    }

    try {
        // Add a new document to the 'wastage_log' collection
        await db.collection('wastage_log').add({
            item: item.name,
            itemId: item.id,
            quantity: wastedQty,
            unit: item.unit || 'units',
            reason: reason,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(), // Use server timestamp for accuracy
            updatedBy: auth.currentUser ? auth.currentUser.email : 'Unknown User' // Log who made the entry
        });

        // Deduct wasted quantity from the item's current stock in Firestore
        const currentStockRef = db.collection('items').doc(item.id);
        await currentStockRef.update({
            currentStock: firebase.firestore.FieldValue.increment(-wastedQty) // Atomically decrement stock
        });

        alert(`Logged ${wastedQty} of ${item.name} as wasted and updated stock.`);
        // Reset dropdowns
        wasteItemSelect.value = '';
        wasteQtySelect.value = '';
        loadStockItems(); // Reload stock display to reflect deduction
        loadWasteLog();   // Reload waste log to show new entry
    } catch (error) {
        console.error('Error logging waste:', error);
        alert('Failed to log waste. Please try again. Check Firebase permissions.');
    }
});

/**
 * Loads and displays recent waste log entries.
 */
async function loadWasteLog() {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // Calculate date 7 days ago
        const sevenDaysAgoTimestamp = firebase.firestore.Timestamp.fromDate(sevenDaysAgo);

        const querySnapshot = await db.collection('wastage_log')
            .where('timestamp', '>=', sevenDaysAgoTimestamp) // Filter for entries within last 7 days
            .orderBy('timestamp', 'desc') // Order by most recent first
            .limit(5) // Display a limited number of recent entries
            .get();

        wasteLogList.innerHTML = ''; // Clear previous log entries
        if (querySnapshot.empty) {
            const li = document.createElement('li');
            li.textContent = 'No waste logged in the last 7 days.';
            wasteLogList.appendChild(li);
        } else {
            querySnapshot.forEach(doc => {
                const data = doc.data();
                // Safely convert Firestore Timestamp to local date string
                const timestampDate = data.timestamp instanceof firebase.firestore.Timestamp
                                    ? data.timestamp.toDate().toLocaleString()
                                    : (data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : 'N/A');

                const li = document.createElement('li');
                li.classList.add('waste-log-item');
                // Truncate long reasons for cleaner display
                const displayReason = data.reason.length > 50 ? data.reason.substring(0, 47) + '...' : data.reason;
                li.textContent = `${data.item} | ${data.quantity} ${data.unit || 'units'} | ${timestampDate} - ${displayReason}`;
                wasteLogList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error loading waste log:', error);
        // Do not alert for this specific error, as it might happen when no logs exist or on initial load.
    }
}


// --- 6. One-Time Data Import Function (for initial population) ---
// This function is for initial setup. RUN IT ONCE FROM BROWSER CONSOLE AFTER LOGGING IN.
// Then you can delete or comment out this section from your script.js file.
const allIngredientsData = [
    // MEAT
    { id: 'beef_patties', name: 'Beef Patties', category: 'Meat', unit: 'lbs', currentStock: 50, reorderPoint: 20, reorderQuantity: 100 },
    { id: 'chicken_filletz_plain', name: 'Plain Chicken Filletz', category: 'Meat', unit: 'pcs', currentStock: 75, reorderPoint: 30, reorderQuantity: 150 },
    { id: 'chicken_breast', name: 'Chicken Breast', category: 'Meat', unit: 'lbs', currentStock: 40, reorderPoint: 15, reorderQuantity: 80 },
    { id: 'bacon_strips', name: 'Bacon Strips', category: 'Meat', unit: 'packs', currentStock: 60, reorderPoint: 25, reorderQuantity: 120 },
    { id: 'pastrami_slices', name: 'Pastrami Slices', category: 'Meat', unit: 'lbs', currentStock: 30, reorderPoint: 10, reorderQuantity: 50 },
    { id: 'pulled_turkey', name: 'Pulled Turkey', category: 'Meat', unit: 'lbs', currentStock: 25, reorderPoint: 10, reorderQuantity: 40 },

    // CHEESES
    { id: 'american_cheese_slices', name: 'American Cheese', category: 'Cheeses', unit: 'slices', currentStock: 120, reorderPoint: 50, reorderQuantity: 200 },
    { id: 'halloumi_cheese', name: 'Halloumi Cheese', category: 'Cheeses', unit: 'blocks', currentStock: 30, reorderPoint: 10, reorderQuantity: 50 },
    { id: 'mozzarella_patties', name: 'Mozzarella Patties', category: 'Cheeses', unit: 'pcs', currentStock: 45, reorderPoint: 15, reorderQuantity: 75 },

    // SPECIALZ INGREDIENTS (Example data for dynamic categories)
    { id: 'special_sauce_base', name: 'Special Sauce Base', category: 'Specialz Ingredients', unit: 'liters', currentStock: 10, reorderPoint: 3, reorderQuantity: 10 },
    { id: 'crispy_onions', name: 'Crispy Onions', category: 'Specialz Ingredients', unit: 'kg', currentStock: 8, reorderPoint: 2, reorderQuantity: 15 },
    { id: 'gourmet_bun', name: 'Gourmet Bun', category: 'Specialz Ingredients', unit: 'packs', currentStock: 20, reorderPoint: 5, reorderQuantity: 30 },

    // FILLETZ INGREDIENTS (Example data for dynamic categories)
    { id: 'honey_chilli_glaze', name: 'Honey Chilli Glaze', category: 'Filletz Ingredients', unit: 'liters', currentStock: 5, reorderPoint: 1, reorderQuantity: 5 },
    { id: 'chilli_flakes', name: 'Chilli Flakes', category: 'Filletz Ingredients', unit: 'kg', currentStock: 2, reorderPoint: 0.5, reorderQuantity: 2 },
    { id: 'spicy_chicken_marinade', name: 'Spicy Chicken Marinade', category: 'Filletz Ingredients', unit: 'liters', currentStock: 7, reorderPoint: 2, reorderQuantity: 10 },

    // MILKSHAKES OF THE WEEK (Example data for dynamic categories)
    { id: 'mango_puree', name: 'Mango Puree', category: 'Milkshakes of the Week', unit: 'liters', currentStock: 8, reorderPoint: 2, reorderQuantity: 5 },
    { id: 'oreo_cookies', name: 'Oreo Cookies', category: 'Milkshakes of the Week', unit: 'packs', currentStock: 15, reorderPoint: 5, reorderQuantity: 20 },
    { id: 'strawberry_syrup', name: 'Strawberry Syrup', category: 'Milkshakes of the Week', unit: 'liters', currentStock: 6, reorderPoint: 2, reorderQuantity: 8 },

    // PRODUCE & VEGETABLES (General categories)
    { id: 'lettuce_shredded', name: 'Shredded Lettuce', category: 'Produce & Vegetables', unit: 'bags', currentStock: 25, reorderPoint: 10, reorderQuantity: 40 },
    { id: 'onions_diced', name: 'Diced Onions', category: 'Produce & Vegetables', unit: 'kg', currentStock: 15, reorderPoint: 5, reorderQuantity: 25 },
    { id: 'dill_pickles', name: 'Dill Pickles', category: 'Produce & Vegetables', unit: 'jars', currentStock: 10, reorderPoint: 3, reorderQuantity: 15 },
    { id: 'fresh_chillies', name: 'Fresh Chillies', category: 'Produce & Vegetables', unit: 'kg', currentStock: 5, reorderPoint: 1, reorderQuantity: 5 },
    { id: 'potatoes_fries', name: 'Fries Potatoes', category: 'Produce & Vegetables', unit: 'kg', currentStock: 80, reorderPoint: 25, reorderQuantity: 100 },
    { id: 'corn_bites_frozen', name: 'Corn Bites (Frozen)', category: 'Produce & Vegetables', unit: 'bags', currentStock: 12, reorderPoint: 4, reorderQuantity: 20 },

    // SAUCES & CONDIMENTS (General categories)
    { id: 'classic_sauce', name: 'Classic Sauce', category: 'Sauces & Condiments', unit: 'gallons', currentStock: 15, reorderPoint: 5, reorderQuantity: 20 },
    { id: 'chipotle_mayo', name: 'Chipotle Mayo', category: 'Sauces & Condiments', unit: 'bottles', currentStock: 30, reorderPoint: 10, reorderQuantity: 20 },
    { id: 'ketchup_heinz', name: 'Heinz Ketchup', category: 'Sauces & Condiments', unit: 'gallons', currentStock: 20, reorderPoint: 8, reorderQuantity: 30 },
    { id: 'creamy_garlic', name: 'Creamy Garlic Sauce', category: 'Sauces & Condiments', unit: 'liters', currentStock: 10, reorderPoint: 3, reorderQuantity: 15 },
    { id: 'smokey_hot_sauce', name: 'Smokey Hot Sauce', category: 'Sauces & Condiments', unit: 'bottles', currentStock: 8, reorderPoint: 2, reorderQuantity: 10 },
    { id: 'bbq_sauce_smokey', name: 'Smokey BBQ Sauce', category: 'Sauces & Condiments', unit: 'liters', currentStock: 12, reorderPoint: 4, reorderQuantity: 18 },
    { id: 'garlic_parmesan_sauce', name: 'Garlic Parmesan Sauce', category: 'Sauces & Condiments', unit: 'liters', currentStock: 7, reorderPoint: 2, reorderQuantity: 10 },
    { id: 'hot_cheese_sauce', name: 'Hot Cheese Sauce', category: 'Sauces & Condiments', unit: 'liters', currentStock: 9, reorderPoint: 3, reorderQuantity: 12 },
    { id: 'gravy_mix', name: 'Gravy Mix', category: 'Sauces & Condiments', unit: 'kg', currentStock: 6, reorderPoint: 2, reorderQuantity: 8 },

    // BREADS & BAKED GOODS (General categories)
    { id: 'burger_buns', name: 'Burger Buns', category: 'Breads & Baked Goods', unit: 'packs', currentStock: 40, reorderPoint: 15, reorderQuantity: 50 },
    { id: 'breakfast_buns', name: 'Breakfast Buns', category: 'Breads & Baked Goods', unit: 'packs', currentStock: 20, reorderPoint: 8, reorderQuantity: 30 },
    { id: 'biscoff_biscuits', name: 'Biscoff Biscuits', category: 'Breads & Baked Goods', unit: 'packs', currentStock: 10, reorderPoint: 3, reorderQuantity: 15 },

    // OTHER ESSENTIALS (General categories)
    { id: 'frying_oil', name: 'Frying Oil', category: 'Other Essentials', unit: 'gallons', currentStock: 5, reorderPoint: 2, reorderQuantity: 10 },
    { id: 'coffee_beans', name: 'Coffee Beans', category: 'Other Essentials', unit: 'kg', currentStock: 3, reorderPoint: 1, reorderQuantity: 5 },
    { id: 'sugar_packets', name: 'Sugar Packets', category: 'Other Essentials', unit: 'boxes', currentStock: 20, reorderPoint: 8, reorderQuantity: 30 },
    { id: 'milk_dairy', name: 'Milk (Dairy)', category: 'Other Essentials', unit: 'liters', currentStock: 25, reorderPoint: 10, reorderQuantity: 40 },
    { id: 'whipped_cream_cans', name: 'Whipped Cream Cans', category: 'Other Essentials', unit: 'cans', currentStock: 10, reorderPoint: 3, reorderQuantity: 15 },
    { id: 'disposable_gloves', name: 'Disposable Gloves', category: 'Other Essentials', unit: 'boxes', currentStock: 18, reorderPoint: 5, reorderQuantity: 25 },
];

/**
 * Imports all ingredient data from the `allIngredientsData` array into Firestore.
 * This function is designed to be run ONCE manually from the browser's developer console
 * after a successful login to populate the database.
 *
 * IMPORTANT: After successful import, consider removing or commenting out this function
 * and the `allIngredientsData` array from your `script.js` to prevent accidental re-imports
 * and to keep your client-side code cleaner.
 */
async function importAllIngredients() {
    if (!auth.currentUser) {
        console.error("Authentication Error: You must be logged in to import data.");
        alert("Please log in before attempting to import ingredients.");
        return;
    }

    const confirmImport = confirm(
        "Are you sure you want to import all ingredients?\n\n" +
        "This will ADD new items or OVERWRITE existing items with matching IDs.\n" +
        "ONLY RUN THIS ONCE FOR INITIAL SETUP."
    );
    if (!confirmImport) {
        console.log("Import cancelled by user.");
        return;
    }

    const batch = db.batch();
    let importedCount = 0;

    for (const item of allIngredientsData) {
        const docRef = db.collection('items').doc(item.id);
        // Use .set() to create if not exists, or overwrite if exists.
        // Ensure all numeric fields are actual numbers in the data array above.
        batch.set(docRef, item);
        importedCount++;
    }

    try {
        await batch.commit();
        console.log(`Successfully imported ${importedCount} ingredients to Firestore.`);
        alert(`Successfully imported ${importedCount} ingredients! The app will now reload to display them.`);
        loadStockItems(); // Reload the UI after successful import
    } catch (error) {
        console.error("Error importing ingredients:", error);
        alert(`Failed to import ingredients: ${error.message}. Check console for details.`);
    }
}
// To run this function:
// 1. Deploy your code.
// 2. Go to your live app URL.
// 3. Log in.
// 4. Open your browser's Developer Console (F12 or right-click -> Inspect, then 'Console' tab).
// 5. Type `importAllIngredients();` and press Enter.
// 6. Confirm the action in the pop-up.
