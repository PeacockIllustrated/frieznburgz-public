// --- import-admin.js ---
// A one-time script to provision the primary admin user.
// To be called manually from the browser developer console.

import { db, auth } from './firebase.js';

/**
 * Creates the staff profile and adds the UID to the admin config.
 * IMPORTANT: This should only be run ONCE for the initial setup.
 * The user calling this MUST be logged in to get their UID.
 */
export async function importAdminUser() {
    const user = auth.currentUser;

    if (!user) {
        alert("Error: You must be logged in to provision an admin account.");
        console.error("Admin import failed: No authenticated user found.");
        return;
    }

    const userId = user.uid;
    console.log(`Attempting to provision admin rights for user UID: ${userId}`);

    const confirmImport = confirm(
        "Are you sure you want to create an admin staff profile for the currently logged-in user?\n\n" +
        "This will:\n" +
        "1. Create a document in /staff/" + userId + "\n" +
        "2. Add your UID to /_internal/admin_config\n\n" +
        "This is for initial setup and should not be run multiple times."
    );

    if (!confirmImport) {
        console.log("Admin import cancelled by user.");
        return;
    }

    // --- Define Admin User Data ---
    const adminStaffData = {
      name: "Tom Peacock",
      email: "peacockillustrated@gmail.com",
      phone: "07494860722",
      locationId: "all_locations", // Special identifier for admin with access to all
      startDate: "October 2023",
      role: "Admin"
    };

    // --- Firestore Document References ---
    const staffDocRef = db.collection('staff').doc(userId);
    const adminConfigRef = db.collection('_internal').doc('admin_config');

    // --- Use a BATCH write to ensure both operations succeed or fail together ---
    const batch = db.batch();

    // 1. Set the staff document with the admin's details
    batch.set(staffDocRef, adminStaffData);

    // 2. Update the admin_config document to include this user's UID
    // Using `arrayUnion` prevents duplicates if run accidentally more than once.
    batch.update(adminConfigRef, {
        adminUids: firebase.firestore.FieldValue.arrayUnion(userId)
    });

    try {
        await batch.commit();
        alert(`Successfully provisioned admin user "${adminStaffData.name}" with UID: ${userId}. Please refresh the page.`);
        console.log("Admin import successful. Staff document and admin config updated.");
    } catch (error) {
        alert("An error occurred during admin import. Check the console for details.");
        console.error("Error during admin import batch commit:", error);
        console.error("IMPORTANT: Please check your Firestore Security Rules to ensure you have permission to write to '/staff' and '/_internal'.");
    }
}
