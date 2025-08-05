// --- firebase.js ---

import { firebaseConfig } from './config.js'; // Import your Firebase config

// Initialize Firebase app if it hasn't been already
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Firebase service instances
export const auth = firebase.auth();
export const db = firebase.firestore();
export const functions = firebase.functions(); // Make sure this line is here

console.log('Firebase initialized and services exported for ADMIN DASHBOARD.');
