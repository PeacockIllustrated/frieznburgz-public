// --- staff-training/firebase-config.js ---
// Centralizes Firebase configuration for the entire training portal.

// Your Firebase configuration (copy-pasted from your console)
const firebaseConfig = {
    apiKey: "AIzaSyA4hS3texgNpdQbjj8QIECY4n0Nl3SWwTo",
    authDomain: "friez-burgz.firebaseapp.com",
    projectId: "friez-burgz",
    storageBucket: "friez-burgz.firebasestorage.app",
    messagingSenderId: "369360939966",
    appId: "1:369360939966:web:760d870c8c0f2a8f6667ef",
    measurementId: "G-67WXCWCC2X"
};

// Initialize Firebase app if it hasn't been already
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get and export Firebase service instances
export const auth = firebase.auth();
export const db = firebase.firestore();
