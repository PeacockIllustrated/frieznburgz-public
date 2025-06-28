// --- staff-training/firebase-config.js ---
// Self-contained Firebase config for the training portal.

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA4hS3texgNpdQbjj8QIECY4n0Nl3SWwTo",
    authDomain: "friez-burgz.firebaseapp.com",
    projectId: "friez-burgz",
    storageBucket: "friez-burgz.firebasestorage.app",
    messagingSenderId: "369360939966",
    appId: "1:369360939966:web:760d870c8c0f2a8f6667ef",
    measurementId: "G-67WXCWCC2X"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
