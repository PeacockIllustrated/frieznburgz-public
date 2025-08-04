// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
// Import the CORS middleware
const cors = require('cors')({ origin: true }); // Allows all origins by default in development

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// --- Loyalty System Configuration ---
const DEFAULT_STAMP_THRESHOLD = 5;
const DEFAULT_REWARD_DESCRIPTION = "Free Classic Burger";
const STAMP_COOLDOWN_MINUTES = 0.5;

function generateRewardCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'FBG-';
    for (let i = 0; i < 6; i++) {
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
    // Callable Cloud Functions automatically handle CORS,
    // but sometimes custom origins or complex setups might need explicit handling.
    // The 'functions.https.onCall' structure usually manages simple CORS.
    // If the error persists, this is where you'd manually apply cors.

    // For now, let's keep the structure clean, as onCall should handle basic CORS.
    // If this specific error is happening with onCall, it might be due to a misconfiguration
    // or a specific preflight issue not covered by default onCall handling.
    // Let's ensure the function code itself is correctly structured.

    // If the problem persists after deploy, you might need to wrap the logic like this:
    /*
    return cors((req, res) => {
        // Your actual function logic goes here, operating on req and res
        // For a callable function, this is tricky as it's not a standard HTTP request.
        // `onCall` is designed to be simpler.
        // The most common cause is the `origin` not being explicitly listed in `functions/package.json`
        // or implicitly handled by `origin: true` in the `cors` initialization.
    });
    */

    // Let's re-verify the basic setup of onCall function and its interaction with Netlify.
    // The error `net::ERR_FAILED` sometimes indicates the preflight failed entirely,
    // meaning the function didn't even get to execute its logic.

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
        let loyaltyCardData = {
            activeProgramId: 'standard_stamps',
            currentStamps: 0,
            stamps: [],
            rewardUnlocked: false,
            rewardCode: null,
            lastStampTime: null,
            lastClaimed: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUsedStoreId: storeId
        };

        if (doc.exists) {
            loyaltyCardData = doc.data();
            if (loyaltyCardData.lastStampTime) {
                const lastStampDate = loyaltyCardData.lastStampTime.toDate();
                const now = new Date();
                const diffMinutes = (now.getTime() - lastStampDate.getTime()) / (1000 * 60);

                if (diffMinutes < STAMP_COOLDOWN_MINUTES) {
                    throw new functions.https.HttpsError(
                        'resource-exhausted',
                        `Please wait ${Math.ceil(STAMP_COOLDOWN_MINUTES - diffMinutes * 60)} seconds before adding another stamp.`, // Corrected message to seconds
                        { cooldown: STAMP_COOLDOWN_MINUTES - diffMinutes }
                    );
                }
            }
        } else {
            console.log(`Creating new loyalty card for user ${userId} at store ${storeId}.`);
        }

        const programRef = db.collection('loyaltyPrograms').doc(loyaltyCardData.activeProgramId);
        const programDoc = await transaction.get(programRef);

        if (!programDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Loyalty program ${loyaltyCardData.activeProgramId} not found.`);
        }
        const programRules = programDoc.data();
        const stampThreshold = programRules.stampCountRequired || DEFAULT_STAMP_THRESHOLD;

        if (loyaltyCardData.rewardUnlocked === true) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                'Reward is already unlocked. Please redeem your current reward first.'
            );
        }

        const newStamp = {
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            method: method || 'unknown',
            staffId: userId, // customer's UID
            storeId: storeId
        };
        // Ensure stamps is an array before pushing
        if (!Array.isArray(loyaltyCardData.stamps)) {
            loyaltyCardData.stamps = [];
        }
        loyaltyCardData.stamps.push(newStamp);
        loyaltyCardData.currentStamps = (loyaltyCardData.currentStamps || 0) + 1;
        loyaltyCardData.lastStampTime = admin.firestore.FieldValue.serverTimestamp();
        loyaltyCardData.lastUsedStoreId = storeId;

        if (loyaltyCardData.currentStamps >= stampThreshold) {
            loyaltyCardData.rewardUnlocked = true;
            loyaltyCardData.rewardCode = generateRewardCode();
            console.log(`Reward unlocked for user ${userId}: ${loyaltyCardData.rewardCode}`);
        }

        transaction.set(loyaltyCardRef, loyaltyCardData, { merge: true });

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

exports.redeemReward = functions.https.onCall(async (data, context) => {
    // ... (Your existing redeemReward function code) ...
    // This function also benefits from callable function's default CORS handling.
    // If it were a standard HTTP function, you'd apply cors middleware here too.

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Staff member must be authenticated to redeem a reward.');
    }
    const staffId = context.auth.uid;
    const { userId, storeId, rewardCode } = data;

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

        if (!loyaltyCardData.rewardUnlocked || loyaltyCardData.rewardCode !== rewardCode) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Invalid or unredeemable reward code for this user.'
            );
        }

        const programRef = db.collection('loyaltyPrograms').doc(loyaltyCardData.activeProgramId);
        const programDoc = await transaction.get(programRef);
        const programRules = programDoc.exists ? programDoc.data() : {};
        const rewardDescription = programRules.rewardDescription || DEFAULT_REWARD_DESCRIPTION;

        transaction.update(customerLoyaltyCardRef, {
            currentStamps: 0,
            rewardUnlocked: false,
            rewardCode: null,
            lastClaimed: admin.firestore.FieldValue.serverTimestamp()
        });

        db.collection('rewardsRedeemed').add({
            userId: userId,
            programId: loyaltyCardData.activeProgramId,
            rewardCode: rewardCode,
            redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
            staffId: staffId,
            storeId: storeId,
            rewardDescription: rewardDescription
        });

        return {
            status: 'success',
            message: `Reward "${rewardDescription}" redeemed successfully for user ${userId}. Stamps reset.`,
            newStamps: 0
        };
    });
});
