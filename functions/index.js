// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
// Import the CORS middleware (ensure you ran npm install cors)
const cors = require('cors')({ origin: true }); // Still including for completeness, though onCall handles many cases

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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ012345654321789'; // Added more chars for variety
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
                unlockedRewards: [], // Array to store unlocked but unclaimed rewards
                lastStampTime: null,
                lastClaimedRewardThreshold: 0, // Tracks the highest threshold claimed
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

        // If totalStampsRequired is 0 or less, prevent stamps from being added.
        if (totalStampsRequired <= 0) {
            throw new functions.https.HttpsError('failed-precondition', `Loyalty program "${programIdToUse}" has an invalid total stamps required.`);
        }


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

        // Check for newly unlocked rewards
        let newlyUnlockedRewards = [];
        allRewards.sort((a, b) => a.threshold - b.threshold); // Ensure rewards are checked in order
        
        for (const reward of allRewards) {
            // Check if current stamps meet or exceed the threshold for this reward
            // AND if this specific reward tier hasn't been unlocked/claimed previously in the current cycle
            const alreadyUnlockedThisTier = loyaltyCardData.unlockedRewards.some(ur => ur.programRewardId === reward.id);
            // Crucial: check against lastClaimedRewardThreshold to ensure intermediate rewards aren't re-unlocked if user has passed them
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

        // Handle card reset if total stamps are reached or exceeded
        if (loyaltyCardData.currentStamps >= totalStampsRequired) {
            // Check if the final reward (at totalStampsRequired) has been unlocked.
            // If it hasn't, the user is at max stamps but didn't trigger the unlock for the final reward yet.
            // Let's assume hitting totalStampsRequired implicitly unlocks the final reward if not already.
            const finalReward = allRewards.find(r => r.threshold === totalStampsRequired);
            const finalRewardAlreadyUnlocked = loyaltyCardData.unlockedRewards.some(ur => ur.programRewardId === finalReward?.id);

            // If the card is 'full' and the final reward isn't pending, it means they might have passed it.
            // For a physical card, once you hit the last stamp, you get the reward.
            // We only truly reset the card when the final reward is *claimed*.
            // So, no reset here based purely on `currentStamps >= totalStampsRequired`.
            // The `redeemReward` function will handle the reset upon claiming the final reward.
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
    // Ensure the staff member has admin role for this sensitive operation
    if (!context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admin users can redeem rewards.');
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
                'Invalid or already redeemed reward code for this user. Please ensure the code is correct and still active.'
            );
        }

        const redeemedReward = loyaltyCardData.unlockedRewards[rewardToRedeemIndex];

        // Get program rules for logging and determining reset logic
        const programRef = db.collection('loyaltyPrograms').doc(loyaltyCardData.activeProgramId || DEFAULT_PROGRAM_ID);
        const programDoc = await transaction.get(programRef);
        const programRules = programDoc.exists ? programDoc.data() : {};
        const rewardDescription = redeemedReward.description; // Use description from the unlocked reward object
        const totalStampsRequired = programRules.totalStampsRequired || DEFAULT_TOTAL_STAMPS_REQUIRED;


        // Remove the redeemed reward from the unlockedRewards array
        const updatedUnlockedRewards = loyaltyCardData.unlockedRewards.filter(
            (r, index) => index !== rewardToRedeemIndex
        );

        let newCurrentStamps = loyaltyCardData.currentStamps;
        let newLastClaimedRewardThreshold = loyaltyCardData.lastClaimedRewardThreshold;
        let newStampsArray = loyaltyCardData.stamps;

        // Find the threshold of the redeemed reward from the program rules
        const redeemedRewardProgramRule = programRules.rewards?.find(r => r.id === redeemedReward.programRewardId);
        if (redeemedRewardProgramRule) {
            newLastClaimedRewardThreshold = redeemedRewardProgramRule.threshold;
        }

        // If the redeemed reward is the final reward in the program (e.g., 10th stamp burger), reset stamps to 0.
        // This emulates getting a new card.
        if (redeemedRewardProgramRule && redeemedRewardProgramRule.threshold === totalStampsRequired) {
            newCurrentStamps = 0;
            newStampsArray = []; // Clear stamps history for a new card
            newLastClaimedRewardThreshold = 0; // Reset claimed threshold for a new cycle
            loyaltyCardData.unlockedRewards = []; // Clear all remaining unlocked rewards if final is claimed (they forfeit other pending rewards)
            functions.logger.log(`Final reward (${rewardCode}) claimed for user ${userId}. Loyalty card reset.`);
        } else {
             // For intermediate rewards (e.g., 5th stamp Filletz), stamps are NOT reset.
             // We only update the lastClaimedRewardThreshold to prevent re-unlocking it.
             functions.logger.log(`Intermediate reward (${rewardCode}) claimed for user ${userId}. Stamps NOT reset.`);
        }


        transaction.update(customerLoyaltyCardRef, {
            currentStamps: newCurrentStamps,
            unlockedRewards: updatedUnlockedRewards, // Save updated array
            lastClaimed: admin.firestore.FieldValue.serverTimestamp(), // Log redemption time
            lastClaimedRewardThreshold: newLastClaimedRewardThreshold, // Update the last claimed threshold
            stamps: newStampsArray // Update stamps array if cleared (empty if final reward)
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


/**
 * Cloud Function: adminAdjustStamp
 * Allows an admin to manually adjust a user's stamp count.
 * This function should be called from the ADMIN DASHBOARD.
 * It does NOT unlock rewards automatically. It's for data correction/override.
 *
 * @param {Object} data - Contains userId (customer's UID), newStampCount, and reason.
 * @param {Object} context - Contains authentication info of the admin user.
 */
exports.adminAdjustStamp = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check (Admin User)
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admin users can manually adjust stamps.');
    }

    const adminId = context.auth.uid;
    const { userId, newStampCount, reason } = data;

    if (!userId || typeof newStampCount !== 'number' || newStampCount < 0) {
        throw new functions.https.HttpsError('invalid-argument', 'Customer User ID and a valid non-negative new stamp count are required.');
    }

    const customerLoyaltyCardRef = db.collection('loyaltyCards').doc(userId);

    return db.runTransaction(async (transaction) => {
        const doc = await transaction.get(customerLoyaltyCardRef);

        if (!doc.exists) {
            throw new functions.https.HttpsError('not-found', 'Customer loyalty card not found.');
        }

        const loyaltyCardData = doc.data();
        if (!loyaltyCardData.stamps) loyaltyCardData.stamps = [];

        // Log the adjustment
        const adjustmentLogEntry = {
            timestamp: admin.firestore.Timestamp.now(),
            method: 'AdminAdjust',
            oldStamps: loyaltyCardData.currentStamps,
            newStamps: newStampCount,
            reason: reason || 'Manual adjustment by admin',
            adminId: adminId
        };
        loyaltyCardData.stamps.push(adjustmentLogEntry); // Add to the stamp history for audit

        // Update currentStamps directly
        loyaltyCardData.currentStamps = newStampCount;
        
        // When stamps are manually adjusted, we do NOT trigger automatic reward unlocking.
        // Rewards should only be unlocked via the customer's natural progression or specific admin action to trigger it.
        // We also do NOT clear unlockedRewards or lastClaimedRewardThreshold here,
        // as this is just a count adjustment, not a cycle reset.

        transaction.update(customerLoyaltyCardRef, loyaltyCardData); // Update the loyalty card

        return {
            status: 'success',
            message: `Stamps for user ${userId} manually adjusted to ${newStampCount}.`,
            newStamps: newStampCount
        };
    });
});
