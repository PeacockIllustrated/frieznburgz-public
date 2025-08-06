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
const logoutBtn = document.getElementById('logoutBtn');
const processingOverlay = document.getElementById('processing-overlay');
const overlayProcessingContent = document.getElementById('overlay-processing');
const overlaySuccessContent = document.getElementById('overlay-success');
const overlayErrorContent = document.getElementById('overlay-error');
const overlayErrorMessage = document.getElementById('overlay-error-message');
// NEW: Gamification Elements
const streakDisplay = document.getElementById('streak-display');
const trophyCase = document.getElementById('trophy-case');

// Firebase Cloud Functions Callable
const addStampCallable = functions.httpsCallable('addStamp');

// State
let currentUser = null;
let loyaltyCardRef = null;
let unsubscribeLoyaltyCard = null;
let currentLoyaltyProgram = null;
let currentStampCount = 0;

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

// --- NEW/UPDATED RENDERING FUNCTIONS ---

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
    
    if (currentStamps >= totalStampsRequired) {
        cardStatusMessage.textContent = 'Card Complete! Redeem your reward!';
        getStampBtn.disabled = true;
        getStampBtn.textContent = 'Card Full';
    } else {
        cardStatusMessage.textContent = `You have ${currentStamps} of ${numStamps} stamps!`;
        getStampBtn.disabled = false;
        getStampBtn.innerHTML = '<i class="fas fa-hand-point-up"></i> Get My Stamp';
    }
    cardStatusMessage.style.color = 'var(--red)';
}

function renderGamification(streak, completedCards) {
    streakDisplay.innerHTML = `
        <i class="fas fa-fire-alt streak-icon"></i>
        <div class="streak-text">
            <span class="streak-count">${streak || 0}</span>
            <span class="streak-label">Day Streak</span>
        </div>
    `;
    trophyCase.innerHTML = `
        <i class="fas fa-trophy trophy-icon"></i>
        <div class="trophy-text">
            <span class="trophy-count">${completedCards || 0}</span>
            <span class="trophy-label">Cards Completed</span>
        </div>
    `;
}

async function fetchAndRenderTrophies() {
    const trophyList = document.getElementById('trophy-list');
    if (!trophyList) return;
    
    trophyList.innerHTML = '<li>Loading trophies...</li>';
    try {
        const trophySnapshot = await db.collection('completedLoyaltyCards')
            .where('userId', '==', currentUser.uid)
            .orderBy('completedAt', 'desc')
            .limit(5)
            .get();
        
        if (trophySnapshot.empty) {
            trophyList.innerHTML = '<li>No completed cards yet. Fill one up to earn a trophy!</li>';
            return;
        }

        trophyList.innerHTML = '';
        trophySnapshot.forEach(doc => {
            const trophy = doc.data();
            const date = trophy.completedAt.toDate().toLocaleDateString();
            const li = document.createElement('li');
            li.classList.add('trophy-item');
            li.innerHTML = `<i class="fas fa-award"></i> <span>${trophy.programName || 'Loyalty Card'} completed on ${date}</span>`;
            trophyList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching trophies:", error);
        trophyList.innerHTML = '<li>Could not load trophy history.</li>';
    }
}

// --- Main Listener ---
async function startLoyaltyCardListener() {
    if (unsubscribeLoyaltyCard) unsubscribeLoyaltyCard();

    // Fetch program rules once
    try {
        const programDoc = await db.collection('loyaltyPrograms').doc(DEFAULT_PROGRAM_ID).get();
        currentLoyaltyProgram = programDoc.exists ? programDoc.data() : null;
        if (!currentLoyaltyProgram) {
            showMessage(cardStatusMessage, "No active loyalty programs found.", true);
            return;
        }
    } catch (error) {
        console.error("Error fetching loyalty programs:", error);
        return;
    }

    loyaltyCardRef = db.collection('loyaltyCards').doc(currentUser.uid);
    unsubscribeLoyaltyCard = loyaltyCardRef.onSnapshot(async (doc) => {
        let cardData = { currentStamps: 0, stamps: [], unlockedRewards: [], currentStreak: 0, completedCardCount: 0 };
        if (doc.exists) {
            cardData = doc.data();
            if (cardData.currentStamps > currentStampCount) {
                const stampsOnCard = stampDisplayGrid.querySelectorAll('.stamp-circle');
                const targetStampElement = stampsOnCard[currentStampCount];
                if(targetStampElement) targetStampElement.classList.add('stamp-success-animation');
            }
            currentStampCount = cardData.currentStamps || 0;
        }

        renderStamps(cardData.currentStamps, currentLoyaltyProgram.totalStampsRequired, currentLoyaltyProgram.rewards);
        renderGamification(cardData.currentStreak, cardData.completedCardCount);
        renderUnclaimedRewards(cardData.unlockedRewards);
        // History and Trophies are now in separate sections, no need to re-render them here.
        
    }, (error) => console.error("Error listening to loyalty card changes:", error));
    
    // Initial fetch for history sections that don't need real-time updates
    fetchAndRenderTrophies();
}

async function processStampAttempt(storeId, method) {
    if (getStampBtn.disabled) return;

    getStampBtn.disabled = true;
    overlayProcessingContent.style.display = 'block';
    overlaySuccessContent.style.display = 'none';
    overlayErrorContent.style.display = 'none';
    processingOverlay.classList.add('visible');

    try {
        await addStampCallable({ storeId, method });
        overlayProcessingContent.style.display = 'none';
        overlaySuccessContent.style.display = 'block';
    } catch (error) {
        console.error('Error adding stamp:', error);
        overlayProcessingContent.style.display = 'none';
        overlayErrorContent.style.display = 'block';
        overlayErrorMessage.textContent = error.message || 'Stamp Failed';
        loyaltyCardElement.classList.add('stamp-failure-animation');
        setTimeout(() => loyaltyCardElement.classList.remove('stamp-failure-animation'), 600);
    } finally {
        setTimeout(() => {
            processingOverlay.classList.remove('visible');
            // Re-enabling is handled by the renderStamps function based on whether the card is full
        }, 1500);
    }
}

// --- Event Handlers & Init ---
getStampBtn.addEventListener('click', () => processStampAttempt('forrest_hall', 'ManualButton'));
logoutBtn.addEventListener('click', () => auth.signOut().then(() => window.location.href = 'loyalty-login.html'));

document.addEventListener('DOMContentLoaded', () => {
    let stampAttempted = false;
    document.addEventListener('userAuthenticatedLoyalty', (event) => {
        currentUser = event.detail.user;
        startLoyaltyCardListener();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('action') && urlParams.get('action') === 'stamp' && !stampAttempted) {
            stampAttempted = true;
            const storeIdFromUrl = urlParams.get('storeId');
            setTimeout(() => {
                processStampAttempt(storeIdFromUrl, 'NFC_QR_Tap');
                history.replaceState({}, document.title, window.location.pathname);
            }, 500);
        }
    });
});