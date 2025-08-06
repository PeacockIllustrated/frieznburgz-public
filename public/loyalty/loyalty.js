// --- public/loyalty/loyalty.js ---
// Main logic for the customer-facing loyalty application.

import { db, auth, functions } from './firebase-loyalty-config.js';

// DOM Elements
const loyaltyCardElement = document.getElementById('loyaltyCard');
const cardStatusMessage = document.getElementById('cardStatusMessage');
const stampDisplayGrid = document.getElementById('stampDisplayGrid');
const unclaimedRewardsSection = document.getElementById('unclaimedRewardsSection');
const unclaimedRewardsList = document.getElementById('unclaimedRewardsList');
const getStampBtn = document.getElementById('getStampBtn');
const actionMessage = document.getElementById('actionMessage');
const stampHistoryList = document.getElementById('stampHistoryList');
const redemptionHistoryList = document.getElementById('redemptionHistoryList');
const logoutBtn = document.getElementById('logoutBtn');
const processingOverlay = document.getElementById('processing-overlay'); // New overlay element

// Firebase Cloud Functions Callable
const addStampCallable = functions.httpsCallable('addStamp');

// State
let currentUser = null;
let loyaltyCardRef = null;
let unsubscribeLoyaltyCard = null;
let currentLoyaltyProgram = null;
let currentStampCount = 0; // Keep track of the current stamp count for animations

// --- Utility Functions ---

function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.style.color = isError ? 'var(--red)' : 'var(--success-green)';
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 4000);
}

function getRewardIcon(rewardId) {
    switch (rewardId) {
        case 'filletz_reward': return 'fa-drumstick-bite';
        case 'burger_reward': return 'fa-burger';
        case 'coffee_reward': return 'fa-mug-hot';
        default: return 'fa-gift';
    }
}

function renderStamps(currentStamps, totalStampsRequired, rewards) {
    stampDisplayGrid.innerHTML = '';
    const numStamps = totalStampsRequired || 10;

    for (let i = 0; i < numStamps; i++) {
        const stampCircle = document.createElement('div');
        stampCircle.classList.add('stamp-circle');
        
        const rewardAtThisPosition = rewards.find(r => r.threshold === (i + 1));

        if (i < currentStamps) {
            stampCircle.classList.add('filled');
        } else {
            if (rewardAtThisPosition) {
                const icon = getRewardIcon(rewardAtThisPosition.id);
                stampCircle.innerHTML = `<i class="fas ${icon} reward-icon"></i>`;
                stampCircle.setAttribute('title', `Reward at ${i + 1} stamps: ${rewardAtThisPosition.description}`);
            }
        }
        stampDisplayGrid.appendChild(stampCircle);
    }
    cardStatusMessage.textContent = `You have ${currentStamps} of ${numStamps} stamps!`;
    cardStatusMessage.style.color = 'var(--red)';
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

        document.querySelectorAll('.unclaimed-reward-item .copy-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const codeToCopy = event.currentTarget.dataset.code;
                navigator.clipboard.writeText(codeToCopy).then(() => {
                    alert('Reward code copied to clipboard!');
                }).catch(err => console.error('Could not copy text: ', err));
            });
        });
    } else {
        unclaimedRewardsSection.style.display = 'none';
    }
}

function renderStampHistory(stamps) {
    stampHistoryList.innerHTML = '';
    if (stamps && stamps.length > 0) {
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
    if (unsubscribeLoyaltyCard) unsubscribeLoyaltyCard();

    try {
        const programsSnapshot = await db.collection('loyaltyPrograms').get();
        const standardProgramDoc = programsSnapshot.docs.find(doc => doc.id === 'standard_stamps' && doc.data().isActive);
        currentLoyaltyProgram = standardProgramDoc ? standardProgramDoc.data() : null;

        if (!currentLoyaltyProgram) {
            showMessage(cardStatusMessage, "No active loyalty programs found.", true);
            return;
        }
    } catch (error) {
        console.error("Error fetching loyalty programs:", error);
        showMessage(cardStatusMessage, "Error loading loyalty programs.", true);
        return;
    }

    loyaltyCardRef = db.collection('loyaltyCards').doc(currentUser.uid);
    unsubscribeLoyaltyCard = loyaltyCardRef.onSnapshot(async (doc) => {
        let loyaltyCardData = { currentStamps: 0, stamps: [], unlockedRewards: [] };
        if (doc.exists) {
            loyaltyCardData = doc.data();
            currentStampCount = loyaltyCardData.currentStamps || 0; // Update state
        }

        renderStamps(loyaltyCardData.currentStamps, currentLoyaltyProgram.totalStampsRequired, currentLoyaltyProgram.rewards);
        renderUnclaimedRewards(loyaltyCardData.unlockedRewards);
        renderStampHistory(loyaltyCardData.stamps);
        
        try {
            const redemptionSnapshot = await db.collection('rewardsRedeemed').where('userId', '==', currentUser.uid).orderBy('redeemedAt', 'desc').limit(5).get();
            renderRedemptionHistory(redemptionSnapshot.docs.map(doc => doc.data()));
        } catch (error) {
            console.error("Error fetching redemption history:", error);
            redemptionHistoryList.innerHTML = '<li>Error loading redemption history.</li>';
        }
    }, (error) => {
        console.error("Error listening to loyalty card changes:", error);
        showMessage(cardStatusMessage, "Failed to load loyalty card data.", true);
    });
}

/**
 * NEW: Centralized function to handle a stamp attempt with UI feedback.
 * @param {string} storeId - The ID of the store where the stamp is being given.
 * @param {string} method - The method used (e.g., 'ManualButton', 'NFC_QR_Tap').
 */
async function processStampAttempt(storeId, method) {
    if (getStampBtn.disabled) return; // Prevent multiple clicks

    getStampBtn.disabled = true;
    processingOverlay.classList.add('visible');

    // Find the next stamp to be animated
    const stampsOnCard = stampDisplayGrid.querySelectorAll('.stamp-circle');
    const targetStampElement = stampsOnCard[currentStampCount];

    try {
        const result = await addStampCallable({ storeId, method });
        // The onSnapshot listener will handle the official re-render.
        // This animation provides immediate feedback.
        if (targetStampElement) {
            targetStampElement.classList.add('stamp-success-animation');
            // Clean up animation class after it runs
            setTimeout(() => targetStampElement.classList.remove('stamp-success-animation'), 600);
        }
        showMessage(actionMessage, result.data.message || 'Stamp added!', false);

    } catch (error) {
        console.error('Error adding stamp:', error);
        loyaltyCardElement.classList.add('stamp-failure-animation');
        setTimeout(() => loyaltyCardElement.classList.remove('stamp-failure-animation'), 600);

        if (error.code === 'resource-exhausted') {
            const cooldown = error.details?.cooldown ? Math.ceil(error.details.cooldown) : 30;
            showMessage(actionMessage, `Wait ${cooldown} seconds before stamping again.`, true);
        } else {
            showMessage(actionMessage, `Failed to add stamp: ${error.message}`, true);
        }
    } finally {
        // Hide overlay after a short delay to let the user see the animation
        setTimeout(() => {
            processingOverlay.classList.remove('visible');
            getStampBtn.disabled = false;
        }, 1000);
    }
}

// --- Event Handlers ---

getStampBtn.addEventListener('click', () => {
    const demoStoreId = 'forrest_hall'; // Replace with dynamic store ID in production
    processStampAttempt(demoStoreId, 'ManualButton');
});

logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'loyalty-login.html';
    } catch (error) {
        console.error("Error logging out:", error);
        alert("Failed to log out.");
    }
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    let stampAttempted = false; // Flag to prevent multiple runs on one page load

    document.addEventListener('userAuthenticatedLoyalty', (event) => {
        currentUser = event.detail.user;
        startLoyaltyCardListener();

        // Check for stamp action from URL, now that we know user is logged in
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('action') && urlParams.get('action') === 'stamp' && urlParams.has('storeId') && !stampAttempted) {
            stampAttempted = true; // Set flag
            const storeIdFromUrl = urlParams.get('storeId');
            
            // Wait a brief moment for the card to render before animating
            setTimeout(() => {
                processStampAttempt(storeIdFromUrl, 'NFC_QR_Tap');
                // Clean URL to prevent re-stamping on refresh
                history.replaceState({}, document.title, window.location.pathname);
            }, 500);
        }
    });
});
