// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// --- Loyalty System Configuration Defaults ---
const DEFAULT_PROGRAM_ID = 'standard_stamps';
const STREAK_REWARD_THRESHOLD = 7; // Reward at 7 days

// --- Helper to generate a unique reward code ---
function generateRewardCode(prefix = 'FBG') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = `${prefix}-`;
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Cloud Function: addStamp
 * Adds a stamp and updates the user's daily streak.
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
        
        if (!doc.exists) {
            // This should be handled by client-side registration, but as a fallback:
            throw new functions.https.HttpsError('not-found', 'Loyalty card not found. Please ensure you are registered.');
        }

        let loyaltyCardData = doc.data();
        
        // --- Initialize fields if they don't exist ---
        loyaltyCardData.stamps = loyaltyCardData.stamps || [];
        loyaltyCardData.unlockedRewards = loyaltyCardData.unlockedRewards || [];
        loyaltyCardData.currentStamps = loyaltyCardData.currentStamps || 0;
        loyaltyCardData.currentStreak = loyaltyCardData.currentStreak || 0;
        loyaltyCardData.completedCardCount = loyaltyCardData.completedCardCount || 0;

        // --- Fetch Program Rules ---
        const programId = loyaltyCardData.activeProgramId || DEFAULT_PROGRAM_ID;
        const programDoc = await db.collection('loyaltyPrograms').doc(programId).get();
        if (!programDoc.exists) {
            throw new functions.https.HttpsError('not-found', `Loyalty program "${programId}" not found.`);
        }
        const programRules = programDoc.data();
        const totalStampsRequired = programRules.totalStampsRequired || 10;

        // --- Prevent adding stamps to a full card ---
        if (loyaltyCardData.currentStamps >= totalStampsRequired) {
            throw new functions.https.HttpsError('failed-precondition', 'Card is full! Redeem your final reward to start a new card.');
        }

        // --- Streak Calculation Logic ---
        const now = new Date();
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        let newStreak = loyaltyCardData.currentStreak;

        if (loyaltyCardData.lastStampTime) {
            const lastStampDate = loyaltyCardData.lastStampTime.toDate();
            const lastStampUTC = new Date(Date.UTC(lastStampDate.getUTCFullYear(), lastStampDate.getUTCMonth(), lastStampDate.getUTCDate()));
            
            const diffTime = todayUTC - lastStampUTC;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                newStreak++; // Consecutive day
            } else if (diffDays > 1) {
                newStreak = 1; // Streak broken, reset to 1 for today's stamp
            }
            // If diffDays is 0, it's the same day, so streak doesn't change.
        } else {
            newStreak = 1; // First stamp ever
        }
        
        loyaltyCardData.currentStreak = newStreak;
        
        // --- Add the new stamp ---
        loyaltyCardData.stamps.push({
            timestamp: admin.firestore.Timestamp.now(),
            method: method || 'unknown',
            storeId: storeId
        });
        loyaltyCardData.currentStamps++;
        loyaltyCardData.lastStampTime = admin.firestore.FieldValue.serverTimestamp();

        // --- Reward Unlocking Logic ---
        let newlyUnlockedRewards = [];

        // Check for standard rewards
        programRules.rewards.forEach(reward => {
            const alreadyUnlocked = loyaltyCardData.unlockedRewards.some(ur => ur.programRewardId === reward.id && !ur.isStreakReward);
            if (loyaltyCardData.currentStamps >= reward.threshold && !alreadyUnlocked) {
                const newReward = {
                    programRewardId: reward.id,
                    rewardCode: generateRewardCode('FBG'),
                    unlockedAt: admin.firestore.Timestamp.now(),
                    description: reward.description,
                    isStreakReward: false
                };
                loyaltyCardData.unlockedRewards.push(newReward);
                newlyUnlockedRewards.push(newReward);
            }
        });

        // Check for 7-day streak reward
        if (newStreak === STREAK_REWARD_THRESHOLD) {
             const streakReward = {
                programRewardId: '7_day_streak',
                rewardCode: generateRewardCode('STR'),
                unlockedAt: admin.firestore.Timestamp.now(),
                description: "7 Day Streak! Free Fries!",
                isStreakReward: true
            };
            loyaltyCardData.unlockedRewards.push(streakReward);
            newlyUnlockedRewards.push(streakReward);
            loyaltyCardData.currentStreak = 0; // Reset streak after reward is given
        }
        
        transaction.set(loyaltyCardRef, loyaltyCardData, { merge: true });

        return {
            status: 'success',
            message: 'Stamp added!',
            currentStamps: loyaltyCardData.currentStamps,
            totalStampsRequired: totalStampsRequired,
            newlyUnlockedRewards: newlyUnlockedRewards
        };
    });
});

exports.importAllergens = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admin users can import allergen data.');
    }

    const importedData = data.items;
    if (!importedData || !Array.isArray(importedData)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid data format. Expected an array of items.');
    }

    const batch = db.batch();
    const menuItemsRef = db.collection('menuItems');
    let updatedCount = 0;
    let createdCount = 0;

    for (const item of importedData) {
        const querySnapshot = await menuItemsRef.where('name', '==', item.item).limit(1).get();

        if (!querySnapshot.empty) {
            // Update existing item
            const docRef = querySnapshot.docs[0].ref;
            batch.update(docRef, {
                allergens: item.allergens,
                notes: item.notes,
                category: item.category,
                lastEditedAt: admin.firestore.FieldValue.serverTimestamp(),
                lastEditedBy: context.auth.token.name || context.auth.token.email,
            });
            updatedCount++;
        } else {
            // Create new item
            const newDocRef = menuItemsRef.doc();
            batch.set(newDocRef, {
                name: item.item,
                category: item.category,
                allergens: item.allergens,
                notes: item.notes,
                active: true,
                lastEditedAt: admin.firestore.FieldValue.serverTimestamp(),
                lastEditedBy: context.auth.token.name || context.auth.token.email,
            });
            createdCount++;
        }
    }

    try {
        await batch.commit();
        return { status: 'success', message: `Import successful. Updated: ${updatedCount}, Created: ${createdCount}` };
    } catch (error) {
        console.error("Error committing allergen import batch:", error);
        throw new functions.https.HttpsError('internal', 'An error occurred while importing the allergen data.');
    }
});

/**
 * Cloud Function: redeemReward
 * Redeems a reward and handles card completion/trophy creation.
 */
exports.redeemReward = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admin users can redeem rewards.');
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

        let loyaltyCardData = doc.data();
        loyaltyCardData.unlockedRewards = loyaltyCardData.unlockedRewards || [];

        const rewardToRedeemIndex = loyaltyCardData.unlockedRewards.findIndex(r => r.rewardCode === rewardCode);
        if (rewardToRedeemIndex === -1) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid or already redeemed reward code.');
        }
        
        const redeemedReward = loyaltyCardData.unlockedRewards[rewardToRedeemIndex];
        loyaltyCardData.unlockedRewards.splice(rewardToRedeemIndex, 1); // Remove the reward

        // Log the redemption
        db.collection('rewardsRedeemed').add({
            userId: userId,
            rewardCode: rewardCode,
            redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
            staffId: staffId,
            storeId: storeId,
            rewardDescription: redeemedReward.description,
        });

        // --- Card Completion and Trophy Logic ---
        const programDoc = await db.collection('loyaltyPrograms').doc(loyaltyCardData.activeProgramId || DEFAULT_PROGRAM_ID).get();
        const programRules = programDoc.data();
        const finalReward = programRules.rewards.find(r => r.threshold === programRules.totalStampsRequired);

        // Check if the redeemed reward was the final one for the card
        if (finalReward && redeemedReward.programRewardId === finalReward.id) {
            // 1. Create a "Trophy" of the completed card
            const trophyData = {
                userId: userId,
                completedAt: admin.firestore.FieldValue.serverTimestamp(),
                stampHistory: loyaltyCardData.stamps,
                programName: programRules.name || 'Standard Card'
            };
            db.collection('completedLoyaltyCards').add(trophyData);

            // 2. Reset the main loyalty card to start a new one
            loyaltyCardData = {
                ...loyaltyCardData,
                currentStamps: 0,
                stamps: [],
                unlockedRewards: [], // Clear all pending rewards
                lastClaimedRewardThreshold: 0,
                completedCardCount: (loyaltyCardData.completedCardCount || 0) + 1
            };
            transaction.set(customerLoyaltyCardRef, loyaltyCardData);
            
            return { status: 'success', message: `Reward redeemed & new card started!` };
        } else {
            // Just an intermediate or streak reward, just update the card
            transaction.update(customerLoyaltyCardRef, {
                unlockedRewards: loyaltyCardData.unlockedRewards
            });
            return { status: 'success', message: `Reward "${redeemedReward.description}" redeemed successfully.` };
        }
    });
});

// --- adminAdjustStamp function remains unchanged ---
exports.adminAdjustStamp = functions.https.onCall(async (data, context) => {
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
        loyaltyCardData.stamps = loyaltyCardData.stamps || [];
        const adjustmentLogEntry = {
            timestamp: admin.firestore.Timestamp.now(),
            method: 'AdminAdjust',
            oldStamps: loyaltyCardData.currentStamps,
            newStamps: newStampCount,
            reason: reason || 'Manual adjustment by admin',
            adminId: adminId
        };
        loyaltyCardData.stamps.push(adjustmentLogEntry);
        loyaltyCardData.currentStamps = newStampCount;
        transaction.update(customerLoyaltyCardRef, loyaltyCardData);
        return { status: 'success', message: `Stamps adjusted to ${newStampCount}.`, newStamps: newStampCount };
    });
});