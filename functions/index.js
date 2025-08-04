// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
// Import the CORS middleware (ensure you ran npm install cors)
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// --- Loyalty System Configuration Defaults ---
// These are fallbacks if loyaltyPrograms collection is empty or misconfigured.
const DEFAULT_PROGRAM_ID = 'standard_stamps';
const DEFAULT_TOTAL_STAMPS_REQUIRED = 10;
const DEFAULT_REWARDS = [
    { id: 'filletz_reward', threshold: 5, description: 'Free Filletz' },
    { id: 'burger_reward', threshold: 10, description: 'Free Classic Burger' }
];
const STAMP_COOLDOWN_SECONDS = 30; // Cooldown period to prevent rapid re-stamping

// --- Helper to generate a unique reward code ---
function generateRewardCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'FBG-';
    for (let i = 0; i < 6; i++) { // FBG-XXXXXX
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Cloud Function: addStamp
 * Adds a stamp to a user's loyalty card.
 * This function should be called from the customer's loyalty app.
 *
 * @param {Object} data - Contains storeId and tap/scan method.
 * @param {Object} context - Contains authentication info of the calling user.
 */
exports.addStamp = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to add a stamp.');
    }
    const userId = context.auth.uid;
    const { storeId, method } = data;

    if (!storeId) {
        throw new functions.https.HttpsError('invalid-argument', 'Store ID is required.');
    }

    const loyaltyCardRef = db.collection('loyaltyCards').doc(userId);

    return db.runTransaction(async (transaction) => {
        const doc = await transaction.get(loyaltyCardRef);
        let loyaltyCardData;

        // Initialize default data if document doesn't exist
        if (!doc.exists) {
            loyaltyCardData = {
                activeProgramId: DEFAULT_PROGRAM_ID,
                currentStamps: 0,
                stamps: [], // Ensure this is initialized as an empty array
                unlockedRewards: [], // NEW: Array to store unlocked but unclaimed rewards
                lastStampTime: null,
                lastClaimedRewardThreshold: 0, // NEW: Tracks the highest threshold claimed
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastUsedStoreId: storeId,
                fullName: null, // Placeholder, client can update on register
                email: null     // Placeholder, client can update on register
            };
            console.log(`Creating new loyalty card for user ${userId} at store ${storeId}.`);
        } else {
            loyaltyCardData = doc.data();
            // Ensure necessary fields are initialized if migrating old data or first login
            if (!loyaltyCardData.stamps) loyaltyCardData.stamps = [];
            if (!loyaltyCardData.unlockedRewards) loyaltyCardData.unlockedRewards = [];
            if (typeof loyaltyCardData.currentStamps !== 'number') loyaltyCardData.currentStamps = 0;
            if (typeof loyaltyCardData.lastClaimedRewardThreshold !== 'number') loyaltyCardData.lastClaimedRewardThreshold = 0;


            // Cooldown check: Prevent stamping too frequently
            if (loyaltyCardData.lastStampTime) {
                const lastStampDate = loyaltyCardData.lastStampTime.toDate();
                const now = new Date();
                const diffSeconds = (now.getTime() - lastStampDate.getTime()) / 1000;

                if (diffSeconds < STAMP_COOLDOWN_SECONDS) {
                    throw new functions.https.HttpsError(
                        'resource-exhausted',
                        `Please wait ${Math.ceil(STAMP_COOLDOWN_SECONDS - diffSeconds)} seconds before adding another stamp.`,
                        { cooldown: STAMP_COOLDOWN_SECONDS - diffSeconds }
                    );
                }
            }
        }

        // Get current loyalty program rules
        const programIdToUse = loyaltyCardData.activeProgramId || DEFAULT_PROGRAM_ID;
        const programRef = db.collection('loyaltyPrograms').doc(programIdToUse);
        const programDoc = await transaction.get(programRef);

        if (!programDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Loyalty program "${programIdToUse}" not found. Please ensure it's imported.`);
        }
        const programRules = programDoc.data();
        const allRewards = programRules.rewards || DEFAULT_REWARDS;
        const totalStampsRequired = programRules.totalStampsRequired || DEFAULT_TOTAL_STAMPS_REQUIRED;

        // Add the new stamp
        const newStampEntry = {
            timestamp: admin.firestore.Timestamp.now(), // Use Timestamp.now() for array elements
            method: method || 'unknown',
            storeId: storeId
        };
        loyaltyCardData.stamps.push(newStampEntry);
        loyaltyCardData.currentStamps = (loyaltyCardData.currentStamps || 0) + 1;
        
        // Use FieldValue.serverTimestamp() for top-level lastStampTime
        loyaltyCardData.lastStampTime = admin.firestore.FieldValue.serverTimestamp(); 
        loyaltyCardData.lastUsedStoreId = storeId;

        // Check for unlocked rewards (ITERATE THROUGH ALL REWARDS)
        let newlyUnlockedRewards = [];
        allRewards.sort((a, b) => a.threshold - b.threshold); // Ensure rewards are checked in order
        
        for (const reward of allRewards) {
            // Check if current stamps meet or exceed the threshold for this reward
            // AND if this specific reward tier hasn't been unlocked/claimed previously in the current cycle
            const alreadyUnlockedThisTier = loyaltyCardData.unlockedRewards.some(ur => ur.programRewardId === reward.id);
            const claimedThisTierPreviously = loyaltyCardData.lastClaimedRewardThreshold >= reward.threshold;

            if (loyaltyCardData.currentStamps >= reward.threshold && !alreadyUnlockedThisTier && !claimedThisTierPreviously) {
                const newReward = {
                    programRewardId: reward.id,
                    rewardCode: generateRewardCode(),
                    unlockedAt: admin.firestore.Timestamp.now(),
                    description: reward.description
                };
                loyaltyCardData.unlockedRewards.push(newReward);
                newlyUnlockedRewards.push(newReward); // For response message
                console.log(`Reward "${reward.description}" unlocked for user ${userId}: ${newReward.rewardCode}`);
            }
        }

        // If currentStamps exceeds totalStampsRequired, reset to 0 and start a new cycle
        // This emulates the physical card being 'full' and a new one starting
        if (loyaltyCardData.currentStamps > totalStampsRequired) {
            loyaltyCardData.currentStamps = loyaltyCardData.currentStamps % totalStampsRequired; // Keep remainder if any
            if (loyaltyCardData.currentStamps === 0) { // If it's exactly 10, it becomes 0, so next stamp is 1
                 // Make sure to remove any unlocked rewards from previous cycle (already claimed)
                 loyaltyCardData.unlockedRewards = loyaltyCardData.unlockedRewards.filter(ur => !newlyUnlockedRewards.some(nur => nur.programRewardId === ur.programRewardId));
            }
            loyaltyCardData.stamps = loyaltyCardData.stamps.slice(-loyaltyCardData.currentStamps); // Keep only stamps relevant to new cycle
            loyaltyCardData.lastClaimedRewardThreshold = 0; // Reset for new cycle
        }


        // Update the loyalty card document
        transaction.set(loyaltyCardRef, loyaltyCardData, { merge: true });

        // Return updated state to client
        return {
            status: 'success',
            message: 'Stamp added successfully!',
            currentStamps: loyaltyCardData.currentStamps,
            totalStampsRequired: totalStampsRequired,
            unlockedRewards: loyaltyCardData.unlockedRewards, // Send back all currently unlocked rewards
            newlyUnlockedRewards: newlyUnlockedRewards // Specifically what was just unlocked
        };
    });
});


/**
 * Cloud Function: redeemReward
 * Redeems an unlocked reward for a user.
 * This function should be called from the ADMIN DASHBOARD by a staff member.
 *
 * @param {Object} data - Contains userId (customer's UID), storeId (where redeemed), rewardCode (entered by staff).
 * @param {Object} context - Contains authentication info of the staff member.
 */
exports.redeemReward = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check (Staff Member)
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Staff member must be authenticated to redeem a reward.');
    }
    const staffId = context.auth.uid; // This is the staff member's UID
    const { userId, storeId, rewardCode } = data; // userId is the CUSTOMER's UID

    if (!userId || !storeId || !rewardCode) {
        throw new functions.https.HttpsError('invalid-argument', 'Customer User ID, Store ID, and Reward Code are required.');
    }

    const customerLoyaltyCardRef = db.collection('loyaltyCards').doc(userId);

    return db.runTransaction(async (transaction) => {
        const doc = await transaction.get(customerLoyaltyCardRef);

        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', 'Customer loyalty card not found.');
        }

        const loyaltyCardData = doc.data();
        if (!loyaltyCardData.unlockedRewards) loyaltyCardData.unlockedRewards = [];

        // 2. Validate Reward Conditions: Find the specific unlocked reward by code
        const rewardToRedeemIndex = loyaltyCardData.unlockedRewards.findIndex(r => r.rewardCode === rewardCode);

        if (rewardToRedeemIndex === -1) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Invalid or already redeemed reward code for this user.'
            );
        }

        const redeemedReward = loyaltyCardData.unlockedRewards[rewardToRedeemIndex];

        // Get program rules for logging
        const programRef = db.collection('loyaltyPrograms').doc(loyaltyCardData.activeProgramId || DEFAULT_PROGRAM_ID);
        const programDoc = await transaction.get(programRef);
        const programRules = programDoc.exists ? programDoc.data() : {};
        const rewardDescription = redeemedReward.description; // Use description from the unlocked reward object

        // 3. Update Loyalty Card: Remove redeemed reward, reset stamps if it's the highest tier claimed
        const updatedUnlockedRewards = loyaltyCardData.unlockedRewards.filter(
            (r, index) => index !== rewardToRedeemIndex
        );

        let newCurrentStamps = loyaltyCardData.currentStamps;
        let newLastClaimedRewardThreshold = loyaltyCardData.lastClaimedRewardThreshold;
        let newStampsArray = loyaltyCardData.stamps;

        // Find the threshold of the redeemed reward from the program rules
        const redeemedRewardProgramRule = programRules.rewards.find(r => r.id === redeemedReward.programRewardId);
        if (redeemedRewardProgramRule) {
            newLastClaimedRewardThreshold = redeemedRewardProgramRule.threshold;
        }

        // If the redeemed reward is the final reward in the program, reset stamps to 0
        if (redeemedRewardProgramRule && redeemedRewardProgramRule.threshold === programRules.totalStampsRequired) {
            newCurrentStamps = 0;
            newStampsArray = []; // Clear stamps history for a new card
            newLastClaimedRewardThreshold = 0; // Reset claimed threshold for a new cycle
            loyaltyCardData.unlockedRewards = []; // Clear all remaining unlocked rewards if final is claimed
        } else {
             // For intermediate rewards, we keep the stamps and remaining unlocked rewards.
             // We only update the lastClaimedRewardThreshold to prevent re-unlocking it.
             // The visual implementation on the frontend for how many circles remain filled might be tricky
             // if stamps are not truly reset. But data-wise, this is cleaner.
        }


        transaction.update(customerLoyaltyCardRef, {
            currentStamps: newCurrentStamps,
            unlockedRewards: updatedUnlockedRewards, // Save updated array
            lastClaimed: admin.firestore.FieldValue.serverTimestamp(),
            lastClaimedRewardThreshold: newLastClaimedRewardThreshold, // Update the last claimed threshold
            stamps: newStampsArray // Update stamps array if cleared
        });

        // 4. Log the Redemption (for analytics and audit)
        db.collection('rewardsRedeemed').add({
            userId: userId,
            programId: loyaltyCardData.activeProgramId,
            rewardCode: rewardCode,
            redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
            staffId: staffId, // The staff member who redeemed it
            storeId: storeId,
            rewardDescription: rewardDescription, // Denormalize reward info
            rewardTierId: redeemedReward.programRewardId // Log which tier was redeemed
        });

        return {
            status: 'success',
            message: `Reward "${rewardDescription}" redeemed successfully for user ${userId}.`,
            newStamps: newCurrentStamps
        };
    });
});
