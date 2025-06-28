// --- functions/index.js ---

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the Firebase Admin SDK
admin.initializeApp();

/**
 * A callable Cloud Function to grant a user admin privileges.
 * This function can only be called by an already existing admin,
 * except for the very first time it's run to bootstrap the first admin.
 */
exports.addAdminRole = functions.https.onCall(async (data, context) => {
  // --- Security Check (IMPORTANT) ---
  // For production, you would uncomment this block to ensure only admins can create other admins.
  // For the very first run, you MUST keep this commented out to create the first admin.
  /*
  if (context.auth.token.admin !== true) {
    console.log("Request from non-admin user:", context.auth.uid);
    throw new functions.https.HttpsError(
      'permission-denied', 
      'Only admins can add other admins.'
    );
  }
  */

  const email = data.email;
  if (!email || !(typeof email === 'string') || email.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument', 
      'The function must be called with a valid "email" argument.'
    );
  }

  try {
    // Get the user account by email address
    const user = await admin.auth().getUserByEmail(email);
    
    // Set the custom user claim { admin: true } on that user's token
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
    console.log(`Successfully made ${email} (UID: ${user.uid}) an admin.`);
    return {
      message: `Success! ${email} has been made an admin. They must log out and log back in for the changes to take effect.`,
    };
  } catch (err) {
    console.error("Error in addAdminRole function:", err);
    throw new functions.https.HttpsError(
      'unknown', 
      `An error occurred while trying to make the user an admin: ${err.message}`
    );
  }
});
