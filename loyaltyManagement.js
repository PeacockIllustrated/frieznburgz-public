// --- loyaltyManagement.js ---
// Manages the rendering and logic for the Admin Dashboard's Loyalty Management page.

// Import database and auth instances. Note: functions is not exported from firebase.js,
// so we'll obtain the Functions service from the global firebase instance instead.
import { db, auth } from './firebase.js';
import { getSelectedLocation, getLocationDisplayName } from './config.js'; // For store context

// DOM Elements
const loyaltyManagementContent = document.getElementById('loyaltyManagementContent');

// Obtain the Firebase Functions service via the global firebase instance. This avoids relying
// on a non-existent named export from firebase.js. Ensure the Firebase Functions SDK is loaded
// via script tags in index.html.


// Callable Cloud Functions from Admin SDK for admin tasks
const adminAdjustStampCallable = functions.httpsCallable('adminAdjustStamp');
const redeemRewardCallable = functions.httpsCallable('redeemReward'); // Reusing existing one

// State
let currentCustomerLoyaltyCard = null; // The loyalty card currently being viewed/managed

/**
 * Renders the Loyalty Management page.
 * Provides UI for searching customers, viewing their loyalty cards,
 * and performing admin actions.
 */
export async function renderLoyaltyManagementPage() {
    const selectedLocationId = getSelectedLocation();
    const locationName = selectedLocationId ? getLocationDisplayName(selectedLocationId) : 'N/A';

    loyaltyManagementContent.innerHTML = `
        <h2 class="page-title">Loyalty Management</h2>
        <p>Manage customer loyalty cards for ${locationName}.</p>

        <div class="loyalty-admin-card">
            <h3 class="card-title">Find Customer Loyalty Card</h3>
            <div class="input-group">
                <input type="text" id="customerSearchInput" placeholder="Enter customer email or UID" class="auth-input">
                <button id="searchCustomerBtn" class="auth-button small-btn"><i class="fas fa-search"></i> Search</button>
            </div>
            <p id="searchMessage" class="auth-message"></p>
        </div>

        <div id="customerLoyaltyDetails" class="loyalty-admin-card" style="display: none;">
            <h3 class="card-title">Customer Loyalty Details <span id="customerNameDisplay"></span></h3>
            <p class="current-customer-info" id="currentCustomerInfo"></p>

            <div class="stamps-overview">
                <h4>Current Stamps: <span id="currentStampsDisplay">0</span> / <span id="totalStampsRequiredDisplay">0</span></h4>
                <div class="stamp-display-grid small-grid" id="adminStampDisplayGrid">
                    <!-- Stamps will be rendered here -->
                </div>
            </div>

            <div class="unclaimed-rewards-admin">
                <h4>Unclaimed Rewards:</h4>
                <div id="unclaimedRewardsAdminList" class="unclaimed-rewards-list-admin">
                    <p>No unclaimed rewards.</p>
                </div>
            </div>

            <div class="admin-actions-grid">
                <div class="admin-action-box">
                    <h4>Redeem Reward</h4>
                    <input type="text" id="redeemCodeInput" placeholder="Enter reward code" class="auth-input">
                    <button id="redeemRewardBtn" class="auth-button">Redeem</button>
                    <p id="redeemMessage" class="auth-message"></p>
                </div>
                <div class="admin-action-box">
                    <h4>Adjust Stamps Manually</h4>
                    <input type="number" id="adjustStampInput" placeholder="New stamp count (e.g., 5)" class="auth-input" min="0">
                    <input type="text" id="adjustReasonInput" placeholder="Reason (e.g., system error)" class="auth-input">
                    <button id="adjustStampsBtn" class="auth-button">Adjust</button>
                    <p id="adjustMessage" class="auth-message"></p>
                </div>
            </div>

            <div class="loyalty-history-admin">
                <h3 class="section-title">Full Stamp & Redemption History</h3>
                <ul id="fullHistoryList" class="stamp-history-list">
                    <li>Loading history...</li>
                </ul>
            </div>
        </div>
    `;

    // Attach event listeners
    document.getElementById('searchCustomerBtn').addEventListener('click', searchCustomer);
    document.getElementById('redeemRewardBtn').addEventListener('click', handleRedeemReward);
    document.getElementById('adjustStampsBtn').addEventListener('click', handleAdminAdjustStamps);

    console.log('Loyalty Management page rendered.');
}

/**
 * Searches for a customer's loyalty card by email or UID.
 */
async function searchCustomer() {
    const searchInput = document.getElementById('customerSearchInput').value.trim();
    const searchMessage = document.getElementById('searchMessage');
    const customerLoyaltyDetails = document.getElementById('customerLoyaltyDetails');

    searchMessage.textContent = 'Searching...';
    customerLoyaltyDetails.style.display = 'none'; // Hide details while searching
    currentCustomerLoyaltyCard = null; // Clear previous customer data

    if (!searchInput) {
        searchMessage.textContent = 'Please enter an email or UID.';
        return;
    }

    try {
        let customerDocRef;
        // Assume searchInput is a UID first, then try email lookup if it fails.
        customerDocRef = db.collection('loyaltyCards').doc(searchInput);
        let docSnap = await customerDocRef.get();

        if (!docSnap.exists) {
            // If not found by UID, try by email. This requires querying the 'loyaltyCards' collection.
            const querySnapshot = await db.collection('loyaltyCards')
                                        .where('email', '==', searchInput)
                                        .limit(1)
                                        .get();
            if (!querySnapshot.empty) {
                docSnap = querySnapshot.docs[0];
                customerDocRef = docSnap.ref; // Update ref to the found doc
            }
        }

        if (docSnap.exists) {
            currentCustomerLoyaltyCard = { id: docSnap.id, ...docSnap.data() };
            searchMessage.textContent = '';
            displayCustomerLoyaltyDetails(currentCustomerLoyaltyCard);
            customerLoyaltyDetails.style.display = 'block';
        } else {
            searchMessage.textContent = 'Customer loyalty card not found. Check email/UID.';
        }
    } catch (error) {
        console.error('Error searching customer:', error);
        searchMessage.textContent = `Error searching: ${error.message}`;
    }
}

/**
 * Displays the loyalty card details for the found customer.
 * @param {Object} customerData - The loyalty card document data.
 */
async function displayCustomerLoyaltyDetails(customerData) {
    document.getElementById('customerNameDisplay').textContent = `- ${customerData.fullName || customerData.email || customerData.id}`;
    document.getElementById('currentCustomerInfo').textContent = `Email: ${customerData.email || 'N/A'} | UID: ${customerData.id}`;
    document.getElementById('currentStampsDisplay').textContent = customerData.currentStamps;

    // Fetch and display program rules for total stamps required and rewards
    let programRules = { totalStampsRequired: 10, rewards: [] }; // Default fallback
    try {
        const programDoc = await db.collection('loyaltyPrograms').doc(customerData.activeProgramId || 'standard_stamps').get();
        if (programDoc.exists) {
            programRules = programDoc.data();
        }
    } catch (error) {
        console.error("Error fetching loyalty program rules:", error);
    }
    document.getElementById('totalStampsRequiredDisplay').textContent = programRules.totalStampsRequired;

    // Render stamp circles for admin view (reusing logic but different DOM element)
    renderAdminStamps(customerData.currentStamps, programRules.totalStampsRequired, programRules.rewards);
    
    // Display unclaimed rewards
    const unclaimedRewardsAdminList = document.getElementById('unclaimedRewardsAdminList');
    unclaimedRewardsAdminList.innerHTML = '';
    if (customerData.unlockedRewards && customerData.unlockedRewards.length > 0) {
        customerData.unlockedRewards.forEach(reward => {
            const rewardItem = document.createElement('div');
            rewardItem.classList.add('unclaimed-reward-item-admin');
            rewardItem.innerHTML = `
                <p><strong>${reward.description}</strong> (Code: ${reward.rewardCode})</p>
                <p class="small-text">Unlocked: ${reward.unlockedAt ? reward.unlockedAt.toDate().toLocaleString() : 'N/A'}</p>
            `;
            unclaimedRewardsAdminList.appendChild(rewardItem);
        });
    } else {
        unclaimedRewardsAdminList.innerHTML = '<p>No unclaimed rewards for this customer.</p>';
    }

    // Display full history (stamps + redemptions)
    await displayFullHistory(customerData.id);
}

/**
 * Renders the stamp circles for the Admin view.
 */
function renderAdminStamps(currentStamps, totalStampsRequired, rewards) {
    const adminStampDisplayGrid = document.getElementById('adminStampDisplayGrid');
    adminStampDisplayGrid.innerHTML = '';
    const numStamps = totalStampsRequired || 10;

    for (let i = 0; i < numStamps; i++) {
        const stampCircle = document.createElement('div');
        stampCircle.classList.add('stamp-circle', 'small-circle'); // Add 'small-circle' for admin view
        
        const rewardAtThisPosition = rewards.find(r => r.threshold === (i + 1));

        if (i < currentStamps) {
            stampCircle.classList.add('filled');
        } else {
            if (rewardAtThisPosition) {
                // You might need a fa icon map here similar to loyalty.js, or just use a generic icon
                let icon = '';
                if (rewardAtThisPosition.id === 'filletz_reward') icon = 'fa-drumstick-bite';
                else if (rewardAtThisPosition.id === 'burger_reward') icon = 'fa-burger';
                else if (rewardAtThisPosition.id === 'coffee_reward') icon = 'fa-mug-hot';
                else icon = 'fa-gift';

                stampCircle.innerHTML = `<i class="fas ${icon} reward-icon"></i>`;
            }
        }
        adminStampDisplayGrid.appendChild(stampCircle);
    }
}


/**
 * Handles reward redemption by an admin.
 */
async function handleRedeemReward() {
    const redeemCodeInput = document.getElementById('redeemCodeInput');
    const redeemMessage = document.getElementById('redeemMessage');

    const rewardCode = redeemCodeInput.value.trim();
    if (!rewardCode) {
        redeemMessage.textContent = 'Please enter a reward code.';
        return;
    }
    if (!currentCustomerLoyaltyCard) {
        redeemMessage.textContent = 'Please search and select a customer first.';
        return;
    }

    redeemMessage.textContent = 'Processing redemption...';
    try {
        const selectedLocationId = getSelectedLocation(); // Get current admin's selected location
        if (!selectedLocationId) {
            redeemMessage.textContent = 'Please select a location in the header first.';
            return;
        }

        const result = await redeemRewardCallable({
            userId: currentCustomerLoyaltyCard.id,
            storeId: selectedLocationId,
            rewardCode: rewardCode
        });

        redeemMessage.textContent = result.data.message;
        redeemCodeInput.value = ''; // Clear input

        // Refresh customer details to show updated state (will be done by snapshot listener if active)
        await searchCustomer(); // Re-search to refresh data shown

    } catch (error) {
        console.error('Error redeeming reward:', error);
        redeemMessage.textContent = `Redemption failed: ${error.message}. ${error.details ? error.details.message : ''}`;
    }
}

/**
 * Handles manual stamp adjustments by an admin.
 */
async function handleAdminAdjustStamps() {
    const adjustStampInput = document.getElementById('adjustStampInput');
    const adjustReasonInput = document.getElementById('adjustReasonInput');
    const adjustMessage = document.getElementById('adjustMessage');

    const newStampCount = parseInt(adjustStampInput.value, 10);
    const reason = adjustReasonInput.value.trim();

    if (isNaN(newStampCount) || newStampCount < 0) {
        adjustMessage.textContent = 'Please enter a valid non-negative number for stamps.';
        return;
    }
    if (!currentCustomerLoyaltyCard) {
        adjustMessage.textContent = 'Please search and select a customer first.';
        return;
    }
    if (!reason) {
        adjustMessage.textContent = 'A reason for adjustment is required.';
        return;
    }

    adjustMessage.textContent = 'Adjusting stamps...';
    try {
        const result = await adminAdjustStampCallable({
            userId: currentCustomerLoyaltyCard.id,
            newStampCount: newStampCount,
            reason: reason
        });

        adjustMessage.textContent = result.data.message;
        adjustStampInput.value = '';
        adjustReasonInput.value = '';

        // Refresh customer details
        await searchCustomer(); // Re-search to refresh data shown

    } catch (error) {
        console.error('Error adjusting stamps:', error);
        adjustMessage.textContent = `Adjustment failed: ${error.message}`;
    }
}

/**
 * Displays combined stamp and redemption history for the current customer.
 */
async function displayFullHistory(userId) {
    const fullHistoryList = document.getElementById('fullHistoryList');
    fullHistoryList.innerHTML = '<li>Loading full history...</li>';

    try {
        // Fetch loyalty card data (it contains the stamps array)
        const loyaltyCardDoc = await db.collection('loyaltyCards').doc(userId).get();
        const loyaltyCardData = loyaltyCardDoc.data();
        const stamps = loyaltyCardData?.stamps || [];

        // Fetch redemption history
        const redemptionSnapshot = await db.collection('rewardsRedeemed')
                                            .where('userId', '==', userId)
                                            .orderBy('redeemedAt', 'desc')
                                            .get();
        const redemptions = redemptionSnapshot.docs.map(doc => doc.data());

        const combinedHistory = [];

        stamps.forEach(stamp => {
            // Ensure stamp timestamp is a Timestamp object
            const timestamp = stamp.timestamp instanceof firebase.firestore.Timestamp ? stamp.timestamp : (stamp.timestamp ? new firebase.firestore.Timestamp(stamp.timestamp.seconds, stamp.timestamp.nanoseconds) : null);
            if (timestamp) {
                 combinedHistory.push({
                    type: 'stamp',
                    timestamp: timestamp.toMillis(),
                    date: timestamp.toDate().toLocaleString(),
                    details: stamp.method === 'AdminAdjust' ? `Admin Adjusted to ${stamp.newStamps} (${stamp.reason})` : `Got stamp from ${stamp.storeId || 'Unknown'} (${stamp.method || 'Unknown'})`
                 });
            }
        });

        redemptions.forEach(redemption => {
            const timestamp = redemption.redeemedAt instanceof firebase.firestore.Timestamp ? redemption.redeemedAt : (redemption.redeemedAt ? new firebase.firestore.Timestamp(redemption.redeemedAt.seconds, redemption.redeemedAt.nanoseconds) : null);
            if (timestamp) {
                 combinedHistory.push({
                    type: 'redeemed',
                    timestamp: timestamp.toMillis(),
                    date: timestamp.toDate().toLocaleString(),
                    details: `Redeemed "${redemption.rewardDescription}" at ${redemption.storeId || 'Unknown'} (Code: ${redemption.rewardCode})`
                 });
            }
        });

        // Sort by timestamp (most recent first)
        combinedHistory.sort((a, b) => b.timestamp - a.timestamp);

        fullHistoryList.innerHTML = '';
        if (combinedHistory.length === 0) {
            fullHistoryList.innerHTML = '<li>No history found for this customer.</li>';
        } else {
            combinedHistory.forEach(entry => {
                const li = document.createElement('li');
                li.classList.add('history-item', entry.type === 'redeemed' ? 'redeemed' : '');
                li.innerHTML = `
                    <span class="history-date">${entry.date}:</span> 
                    <span class="history-description">${entry.details}</span>
                `;
                fullHistoryList.appendChild(li);
            });
        }

    } catch (error) {
        console.error('Error fetching full history:', error);
        fullHistoryList.innerHTML = '<li>Error loading full history.</li>';
    }
}
