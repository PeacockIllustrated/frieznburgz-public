// --- firebase.js (in ROOT directory) ---

import { firebaseConfig } from './config.js'; // Import your Firebase config

// Initialize Firebase app if it hasn't been already
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Firebase service instances
export const auth = firebase.auth();
export const db = firebase.firestore();

console.log('Firebase initialized and services exported for ADMIN DASHBOARD.');
