// --- public/loyalty/loyalty.js ---
// Main logic for the customer-facing loyalty application.

import { db, auth, functions } from './firebase-loyalty-config.js';

// DOM Elements
const loyaltyCardElement = document.getElementById('loyaltyCard');
const cardStatusMessage = document.getElementById('cardStatusMessage');
const stampDisplayGrid = document.getElementById('stampDisplayGrid');
const unclaimedRewardsSection = document.getElementById('unclaimedRewardsSection');
const unclaimedRewardsList = document.getElementById('unclaimedRewardsList'); // New element
const getStampBtn = document.getElementById('getStampBtn');
const actionMessage = document.getElementById('actionMessage');
const stampHistoryList = document.getElementById('stampHistoryList');
const redemptionHistoryList = document.getElementById('redemptionHistoryList');
const logoutBtn = document.getElementById('logoutBtn');

// Firebase Cloud Functions Callable
const addStampCallable = functions.httpsCallable('addStamp');

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

function getRewardIcon(rewardId) {
    // Map reward IDs to Font Awesome icons
    switch (rewardId) {
        case 'filletz_reward': return 'fa-drumstick-bite'; // Chicken/fillet icon
        case 'burger_reward': return 'fa-burger'; // Burger icon
        case 'coffee_reward': return 'fa-mug-hot'; // Coffee icon
        default: return 'fa-gift'; // Generic gift icon
    }
}

function renderStamps(currentStamps, totalStampsRequired, rewards) {
    stampDisplayGrid.innerHTML = '';
    const numStamps = totalStampsRequired || 10; // Default to 10 if not set

    for (let i = 0; i < numStamps; i++) {
        const stampCircle = document.createElement('div');
        stampCircle.classList.add('stamp-circle');
        
        // Check if this stamp position corresponds to a reward
        const rewardAtThisPosition = rewards.find(r => r.threshold === (i + 1));

        if (i < currentStamps) {
            stampCircle.classList.add('filled');
            // If filled, remove any potential icon to show solid stamp
            stampCircle.innerHTML = ''; 
        } else {
            // If not filled, add the watermark icon for the reward if applicable
            if (rewardAtThisPosition) {
                const icon = getRewardIcon(rewardAtThisPosition.id);
                stampCircle.innerHTML = `<i class="fas ${icon} reward-icon"></i>`;
                stampCircle.setAttribute('title', `Reward at ${i + 1} stamps: ${rewardAtThisPosition.description}`);
            } else {
                // Optionally add a subtle number for empty stamps
                // stampCircle.textContent = i + 1;
            }
        }
        stampDisplayGrid.appendChild(stampCircle);
    }
    cardStatusMessage.textContent = `You have ${currentStamps} of ${numStamps} stamps!`;
    cardStatusMessage.style.color = 'var(--red)'; // Text on khaki should be red
}

function renderUnclaimedRewards(unlockedRewards) {
    unclaimedRewardsList.innerHTML = '';
    if (unlockedRewards && unlockedRewards.length > 0) {
        unclaimedRewardsSection.style.display = 'block';
        unlockedRewards.forEach(reward => {
            const rewardItem = document.createElement('div');
            rewardItem.classList.add('unclaimed-reward-item');
            rewardItem.innerHTML = `
                <p class="unclaimed-reward-message">🎉 ${reward.description} Unlocked!</p>
                <div class="reward-code-box">
                    <span class="reward-code">${reward.rewardCode}</span>
                    <button class="copy-button" data-code="${reward.rewardCode}"><i class="fas fa-copy"></i></button>
                </div>
            `;
            unclaimedRewardsList.appendChild(rewardItem);
        });

        // Attach copy listeners to newly created buttons
        document.querySelectorAll('.unclaimed-reward-item .copy-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const codeToCopy = event.currentTarget.dataset.code;
                navigator.clipboard.writeText(codeToCopy).then(() => {
                    alert('Reward code copied to clipboard!');
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                });
            });
        });

    } else {
        unclaimedRewardsSection.style.display = 'none';
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
            unlockedRewards: [],
            lastClaimedRewardThreshold: 0,
            activeProgramId: currentLoyaltyProgram.id
        };

        if (doc.exists) {
            loyaltyCardData = doc.data();
            // Ensure fields are present
            if (!loyaltyCardData.stamps) loyaltyCardData.stamps = [];
            if (!loyaltyCardData.unlockedRewards) loyaltyCardData.unlockedRewards = [];
            if (typeof loyaltyCardData.currentStamps !== 'number') loyaltyCardData.currentStamps = 0;
            if (typeof loyaltyCardData.lastClaimedRewardThreshold !== 'number') loyaltyCardData.lastClaimedRewardThreshold = 0;
        } else {
             // This branch should ideally not be hit if registration/login correctly creates the doc.
             // If it is hit, it means a user authenticated without a loyalty card doc.
             // The login.html/register.html scripts ensure the doc is created.
             // For safety, you might want to consider creating it here too,
             // or ensuring the auth flow is the only entry point.
             console.log("Loyalty card document does not exist for user. Relying on login/register to create it.");
             showMessage(cardStatusMessage, "Your loyalty card is being set up. Please try again in a moment.", false);
             return;
        }

        // Render loyalty card state
        renderStamps(loyaltyCardData.currentStamps, currentLoyaltyProgram.totalStampsRequired, currentLoyaltyProgram.rewards);
        renderUnclaimedRewards(loyaltyCardData.unlockedRewards);
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
        const demoStoreId = 'forrest_hall'; // Replace with dynamic store ID in production

        const result = await addStampCallable({ storeId: demoStoreId, method: 'ManualButton' });
        console.log('Stamp added result:', result.data);
        // UI will update automatically via the Firestore snapshot listener
        showMessage(actionMessage, result.data.message || 'Stamp added!', false);

    } catch (error) {
        console.error('Error adding stamp:', error);
        if (error.code === 'resource-exhausted') {
            const cooldownSeconds = error.details?.cooldown ? Math.ceil(error.details.cooldown) : 30;
            showMessage(actionMessage, `Wait ${cooldownSeconds} seconds before stamping again.`, true);
        } else if (error.code === 'failed-precondition') {
            showMessage(actionMessage, `You have an unclaimed reward. Redeem it first!`, true);
        } else if (error.code === 'not-found') {
             showMessage(actionMessage, `Loyalty program not found. Contact staff.`, true);
        }
        else {
            showMessage(actionMessage, `Failed to add stamp: ${error.message}`, true);
        }
        getStampBtn.disabled = false; // Re-enable button on error
    }
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

    // Check URL for stamp action (for NFC/QR integration)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('action') && urlParams.get('action') === 'stamp' && urlParams.has('storeId')) {
        const storeIdFromUrl = urlParams.get('storeId');
        // If user is already authenticated, directly attempt stamp.
        // Otherwise, loyalty-auth.js will handle redirect to login, and then
        // after login, they'll land back here and the stamp will be attempted.
        document.addEventListener('userAuthenticatedLoyalty', async (event) => {
             // Only attempt stamp if it hasn't been done yet on this page load
             if (!getStampBtn.disabled && actionMessage.textContent === '') { // Simple check to prevent double stamping on redirect
                getStampBtn.disabled = true; // Disable to prevent multiple calls
                actionMessage.textContent = 'Processing stamp from tap...';
                actionMessage.style.color = 'var(--dim-grey)';
                 try {
                    const result = await addStampCallable({ storeId: storeIdFromUrl, method: 'NFC_QR_Tap' });
                    showMessage(actionMessage, result.data.message || 'Stamp added from tap!', false);
                 } catch (error) {
                    console.error('Error adding stamp from URL:', error);
                    if (error.code === 'resource-exhausted') {
                        const cooldownSeconds = error.details?.cooldown ? Math.ceil(error.details.cooldown) : 30;
                        showMessage(actionMessage, `Wait ${cooldownSeconds} seconds before stamping again.`, true);
                    } else if (error.code === 'failed-precondition') {
                        showMessage(actionMessage, `You have an unclaimed reward. Redeem it first!`, true);
                    } else {
                        showMessage(actionMessage, `Failed to add stamp from tap: ${error.message}`, true);
                    }
                 } finally {
                     getStampBtn.disabled = false; // Re-enable after attempt
                     // Clean URL to prevent re-stamping on refresh
                     history.replaceState({}, document.title, window.location.pathname);
                 }
            }
        }, { once: true }); // Ensure this event listener runs only once
    }
});
