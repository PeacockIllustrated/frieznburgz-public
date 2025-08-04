// --- public/loyalty/loyalty.js ---
// Main logic for the customer-facing loyalty application.

import { db, auth, functions } from './firebase-loyalty-config.js';

// DOM Elements
const loyaltyCardElement = document.getElementById('loyaltyCard');
const cardStatusMessage = document.getElementById('cardStatusMessage');
const stampDisplayGrid = document.getElementById('stampDisplayGrid');
const rewardSection = document.getElementById('rewardSection');
const rewardMessage = document.getElementById('rewardMessage');
const rewardCodeElement = document.getElementById('rewardCode');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const getStampBtn = document.getElementById('getStampBtn');
const actionMessage = document.getElementById('actionMessage');
const stampHistoryList = document.getElementById('stampHistoryList');
const redemptionHistoryList = document.getElementById('redemptionHistoryList');
const logoutBtn = document.getElementById('logoutBtn');

// Firebase Cloud Functions Callable
const addStampCallable = functions.httpsCallable('addStamp');
const redeemRewardCallable = functions.httpsCallable('redeemReward'); // This will eventually be called from ADMIN, not customer app

// State
let currentUser = null;
let loyaltyCardRef = null;
let unsubscribeLoyaltyCard = null; // For real-time listener cleanup
let currentLoyaltyProgram = null; // Stores details of the active loyalty program

// --- Utility Functions ---

function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.style.color = isError ? 'var(--red)' : 'var(--success-green)';
    element.style.display = 'block';
    // Clear message after some time, unless it's a persistent status
    if (!isError) {
        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    }
}

function renderStamps(currentStamps, requiredStamps) {
    stampDisplayGrid.innerHTML = '';
    for (let i = 0; i < requiredStamps; i++) {
        const stampCircle = document.createElement('div');
        stampCircle.classList.add('stamp-circle');
        if (i < currentStamps) {
            stampCircle.classList.add('filled');
        }
        stampDisplayGrid.appendChild(stampCircle);
    }
    cardStatusMessage.textContent = `You have ${currentStamps} of ${requiredStamps} stamps!`;
    cardStatusMessage.style.color = 'var(--dim-grey)'; // Reset color
}

function renderReward(rewardUnlocked, rewardCode, rewardDescription) {
    if (rewardUnlocked) {
        rewardMessage.textContent = `🎉 Reward Unlocked: ${rewardDescription}!`;
        rewardCodeElement.textContent = rewardCode;
        rewardSection.style.display = 'flex';
    } else {
        rewardSection.style.display = 'none';
        rewardCodeElement.textContent = '';
    }
}

function renderStampHistory(stamps) {
    stampHistoryList.innerHTML = '';
    if (stamps && stamps.length > 0) {
        // Sort newest first
        stamps.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
        stamps.forEach(stamp => {
            const li = document.createElement('li');
            li.classList.add('history-item');
            const date = stamp.timestamp ? stamp.timestamp.toDate().toLocaleString() : 'N/A';
            li.innerHTML = `Stamp added at ${date} <span class="history-detail"> (Store: ${stamp.storeId || 'Unknown'}, Method: ${stamp.method || 'Unknown'})</span>`;
            stampHistoryList.appendChild(li);
        });
    } else {
        stampHistoryList.innerHTML = '<li>No stamps recorded yet.</li>';
    }
}

function renderRedemptionHistory(redemptions) {
    redemptionHistoryList.innerHTML = '';
    if (redemptions && redemptions.length > 0) {
        // Sort newest first
        redemptions.sort((a, b) => b.redeemedAt.toMillis() - a.redeemedAt.toMillis());
        redemptions.forEach(redemption => {
            const li = document.createElement('li');
            li.classList.add('history-item', 'redeemed');
            const date = redemption.redeemedAt ? redemption.redeemedAt.toDate().toLocaleString() : 'N/A';
            li.innerHTML = `Reward "${redemption.rewardDescription}" redeemed on ${date} <span class="history-detail"> (Store: ${redemption.storeId || 'Unknown'})</span>`;
            redemptionHistoryList.appendChild(li);
        });
    } else {
        redemptionHistoryList.innerHTML = '<li>No rewards redeemed yet.</li>';
    }
}

// --- Main Loyalty Card Listener & Renderer ---
async function startLoyaltyCardListener() {
    if (unsubscribeLoyaltyCard) {
        unsubscribeLoyaltyCard(); // Clean up previous listener if exists
    }

    // Fetch loyalty programs first
    try {
        const programsSnapshot = await db.collection('loyaltyPrograms').get();
        if (programsSnapshot.empty) {
            showMessage(cardStatusMessage, "No loyalty programs defined. Please contact management.", true);
            return;
        }
        // For simplicity, we'll use the first active program found, or 'standard_stamps' if it exists.
        // In a real app, users might select a program or have one assigned.
        currentLoyaltyProgram = programsSnapshot.docs.find(doc => doc.id === 'standard_stamps' && doc.data().isActive) ||
                                programsSnapshot.docs.find(doc => doc.data().isActive);

        if (!currentLoyaltyProgram) {
            showMessage(cardStatusMessage, "No active loyalty programs found. Please contact management.", true);
            return;
        }
        currentLoyaltyProgram = currentLoyaltyProgram.data(); // Get data from DocumentSnapshot

    } catch (error) {
        console.error("Error fetching loyalty programs:", error);
        showMessage(cardStatusMessage, "Error loading loyalty programs. Please try again later.", true);
        return;
    }

    loyaltyCardRef = db.collection('loyaltyCards').doc(currentUser.uid);

    unsubscribeLoyaltyCard = loyaltyCardRef.onSnapshot(async (doc) => {
        let loyaltyCardData = {
            currentStamps: 0,
            stamps: [],
            rewardUnlocked: false,
            rewardCode: null,
            activeProgramId: currentLoyaltyProgram.id
        };

        if (doc.exists) {
            loyaltyCardData = doc.data();
            // Ensure fields are present
            if (!loyaltyCardData.stamps) loyaltyCardData.stamps = [];
            if (typeof loyaltyCardData.currentStamps !== 'number') loyaltyCardData.currentStamps = 0;
            if (typeof loyaltyCardData.rewardUnlocked !== 'boolean') loyaltyCardData.rewardUnlocked = false;
        } else {
            // First time user, create a blank document if it doesn't exist
            await loyaltyCardRef.set({
                activeProgramId: currentLoyaltyProgram.id,
                currentStamps: 0,
                stamps: [],
                rewardUnlocked: false,
                rewardCode: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastStampTime: null
            });
            console.log("Created initial loyalty card document for new user.");
        }

        // Render loyalty card state
        renderStamps(loyaltyCardData.currentStamps, currentLoyaltyProgram.stampCountRequired);
        renderReward(loyaltyCardData.rewardUnlocked, loyaltyCardData.rewardCode, currentLoyaltyProgram.rewardDescription);
        renderStampHistory(loyaltyCardData.stamps);
        
        // Fetch and render redemption history separately (not part of loyaltyCard doc)
        try {
            const redemptionSnapshot = await db.collection('rewardsRedeemed')
                                            .where('userId', '==', currentUser.uid)
                                            .orderBy('redeemedAt', 'desc')
                                            .limit(5) // Show recent redemptions
                                            .get();
            const redemptions = redemptionSnapshot.docs.map(doc => doc.data());
            renderRedemptionHistory(redemptions);
        } catch (error) {
            console.error("Error fetching redemption history:", error);
            redemptionHistoryList.innerHTML = '<li>Error loading redemption history.</li>';
        }

        actionMessage.textContent = ''; // Clear previous messages
        getStampBtn.disabled = false; // Enable stamp button
    }, (error) => {
        console.error("Error listening to loyalty card changes:", error);
        showMessage(cardStatusMessage, "Failed to load loyalty card data. Please refresh.", true);
    });
}

// --- Event Handlers ---

// Manual Stamp Button (for testing/fallback. Actual implementation would use NFC/QR)
getStampBtn.addEventListener('click', async () => {
    getStampBtn.disabled = true; // Prevent double-clicking
    actionMessage.textContent = 'Getting stamp...';
    actionMessage.style.color = 'var(--dim-grey)'; // Default color

    try {
        // In a real scenario, storeId would come from NFC/QR reader.
        // For demonstration, let's hardcode a store ID or get it from a global config.
        const demoStoreId = 'forrest_hall'; // Replace with dynamic store ID in production

        const result = await addStampCallable({ storeId: demoStoreId, method: 'ManualButton' });
        console.log('Stamp added result:', result.data);
        // UI will update automatically via the Firestore snapshot listener
        showMessage(actionMessage, result.data.message || 'Stamp added!', false);

    } catch (error) {
        console.error('Error adding stamp:', error);
        // Error from Cloud Function (e.g., resource-exhausted, failed-precondition)
        if (error.code === 'resource-exhausted') {
            showMessage(actionMessage, `Wait a moment before stamping again.`, true);
        } else if (error.code === 'failed-precondition') {
            showMessage(actionMessage, `Reward unlocked. Redeem it first!`, true);
        } else {
            showMessage(actionMessage, `Failed to add stamp: ${error.message}`, true);
        }
        getStampBtn.disabled = false; // Re-enable button on error
    }
});

copyCodeBtn.addEventListener('click', () => {
    const textToCopy = rewardCodeElement.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Reward code copied to clipboard!');
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
});

logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'loyalty-login.html'; // Redirect to login page
    } catch (error) {
        console.error("Error logging out:", error);
        alert("Failed to log out. Please try again.");
    }
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Listen for custom event from loyalty-auth.js after authentication
    document.addEventListener('userAuthenticatedLoyalty', (event) => {
        currentUser = event.detail.user;
        startLoyaltyCardListener();
    });
});
