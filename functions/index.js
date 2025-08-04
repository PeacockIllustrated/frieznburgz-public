// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// --- Loyalty System Configuration ---
// These are default values, but actual loyalty rules should come from loyaltyPrograms collection
const DEFAULT_STAMP_THRESHOLD = 5; // Stamps needed for a reward
const DEFAULT_REWARD_DESCRIPTION = "Free Classic Burger";
const STAMP_COOLDOWN_MINUTES = 0.5; // Cooldown period to prevent rapid re-stamping (e.g., 30 seconds)

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
    // 1. Authentication Check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to add a stamp.');
    }
    const userId = context.auth.uid;
    const { storeId, method } = data; // method: 'NFC' or 'QR'

    if (!storeId) {
        throw new functions.https.HttpsError('invalid-argument', 'Store ID is required.');
    }

    const loyaltyCardRef = db.collection('loyaltyCards').doc(userId);

    return db.runTransaction(async (transaction) => {
        const doc = await transaction.get(loyaltyCardRef);
        let loyaltyCardData = {
            activeProgramId: 'standard_stamps', // Default program, can be dynamically set
            currentStamps: 0,
            stamps: [],
            rewardUnlocked: false,
            rewardCode: null,
            lastStampTime: null,
            // Initialize other fields if they don't exist
            lastClaimed: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUsedStoreId: storeId // New field for last store used
        };

        if (doc.exists) {
            loyaltyCardData = doc.data();
            // Cooldown check: Prevent stamping too frequently
            if (loyaltyCardData.lastStampTime) {
                const lastStampDate = loyaltyCardData.lastStampTime.toDate();
                const now = new Date();
                const diffMinutes = (now.getTime() - lastStampDate.getTime()) / (1000 * 60);

                if (diffMinutes < STAMP_COOLDOWN_MINUTES) {
                    throw new functions.https.HttpsError(
                        'resource-exhausted',
                        `Please wait ${Math.ceil(STAMP_COOLDOWN_MINUTES - diffMinutes)} seconds before adding another stamp.`,
                        { cooldown: STAMP_COOLDOWN_MINUTES - diffMinutes } // Provide helpful info back to client
                    );
                }
            }
        } else {
            // First time user, create initial loyalty card data
            // Fetch default program settings if needed, but for now, use default constants
            console.log(`Creating new loyalty card for user ${userId} at store ${storeId}.`);
        }

        // Get current loyalty program rules (from 'loyaltyPrograms' collection)
        const programRef = db.collection('loyaltyPrograms').doc(loyaltyCardData.activeProgramId);
        const programDoc = await transaction.get(programRef);

        if (!programDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Loyalty program ${loyaltyCardData.activeProgramId} not found.`);
        }
        const programRules = programDoc.data();
        const stampThreshold = programRules.stampCountRequired || DEFAULT_STAMP_THRESHOLD;


        // If a reward is already unlocked, don't add more stamps until it's claimed
        if (loyaltyCardData.rewardUnlocked === true) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Reward is already unlocked. Please redeem your current reward first.'
            );
        }

        // Add the new stamp
        const newStamp = {
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            method: method || 'unknown',
            staffId: context.auth.uid, // This will be the customer's UID, as customer is stamping
            storeId: storeId
        };
        loyaltyCardData.stamps.push(newStamp); // Add to history
        loyaltyCardData.currentStamps = (loyaltyCardData.currentStamps || 0) + 1;
        loyaltyCardData.lastStampTime = admin.firestore.FieldValue.serverTimestamp();
        loyaltyCardData.lastUsedStoreId = storeId;

        // Check if reward is unlocked
        if (loyaltyCardData.currentStamps >= stampThreshold) {
            loyaltyCardData.rewardUnlocked = true;
            loyaltyCardData.rewardCode = generateRewardCode();
            console.log(`Reward unlocked for user ${userId}: ${loyaltyCardData.rewardCode}`);
        }

        // Update the loyalty card document
        transaction.set(loyaltyCardRef, loyaltyCardData, { merge: true });

        // Return updated state to client (excluding sensitive info if any)
        return {
            status: 'success',
            message: 'Stamp added successfully!',
            currentStamps: loyaltyCardData.currentStamps,
            stampCountRequired: stampThreshold,
            rewardUnlocked: loyaltyCardData.rewardUnlocked,
            rewardCode: loyaltyCardData.rewardCode,
            activeProgramId: loyaltyCardData.activeProgramId
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

        // 2. Validate Reward Conditions
        if (!loyaltyCardData.rewardUnlocked || loyaltyCardData.rewardCode !== rewardCode) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Invalid or unredeemable reward code for this user.'
            );
        }

        // Get program rules for logging
        const programRef = db.collection('loyaltyPrograms').doc(loyaltyCardData.activeProgramId);
        const programDoc = await transaction.get(programRef);
        const programRules = programDoc.exists ? programDoc.data() : {};
        const rewardDescription = programRules.rewardDescription || DEFAULT_REWARD_DESCRIPTION;


        // 3. Update Loyalty Card (Mark Reward as Redeemed and Reset)
        transaction.update(customerLoyaltyCardRef, {
            currentStamps: 0, // Reset stamps for next cycle
            rewardUnlocked: false,
            rewardCode: null, // Invalidate the used code
            lastClaimed: admin.firestore.FieldValue.serverTimestamp() // Log redemption time
        });

        // 4. Log the Redemption (for analytics and audit)
        db.collection('rewardsRedeemed').add({
            userId: userId,
            programId: loyaltyCardData.activeProgramId,
            rewardCode: rewardCode,
            redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
            staffId: staffId, // The staff member who redeemed it
            storeId: storeId,
            rewardDescription: rewardDescription // Denormalize reward info
        });

        return {
            status: 'success',
            message: `Reward "${rewardDescription}" redeemed successfully for user ${userId}. Stamps reset.`,
            newStamps: 0 // Confirm stamps reset
        };
    });
});
