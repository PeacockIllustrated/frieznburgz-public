// --- staff-training/register-profile.js (Final Version) ---

import { db, auth } from './firebase-config.js';
import { locations } from '../config.js'; 

document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    const locationSelect = document.getElementById('location');
    const formMessage = document.getElementById('form-message');
    const submitBtn = document.getElementById('submitProfileBtn');

    // Populate location dropdown
    if (locations && locationSelect) {
        locationSelect.innerHTML = '<option value="" disabled selected>-- Select your store --</option>';
        locations.forEach(loc => {
            if(loc.id !== 'all_locations') {
                 const option = document.createElement('option');
                 option.value = loc.id;
                 option.textContent = loc.name;
                 locationSelect.appendChild(option);
            }
        });
    }

    // Handle form submission
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
        formMessage.textContent = '';

        // Get all data from the form
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim(); // Get password
        const staffData = {
            name: document.getElementById('fullName').value.trim(),
            email: email,
            phone: document.getElementById('phone').value.trim(),
            locationId: document.getElementById('location').value,
            startDate: document.getElementById('startDate').value.trim(),
            role: "Employee"
        };

        if (!staffData.name || !email || !password || !staffData.phone || !staffData.locationId || !staffData.startDate) {
            formMessage.textContent = 'Please fill out all fields, including email and password.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save My Profile';
            return;
        }

        try {
            // Step 1: Create the user in Firebase Authentication
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Step 2: Use the new user's UID to create their documents in Firestore
            const staffDocRef = db.collection('staff').doc(user.uid);
            await staffDocRef.set(staffData);

            const progressDocRef = db.collection('users').doc(user.uid);
            await progressDocRef.set({ readSections: [], quizHistory: [] });

            formMessage.style.color = 'var(--success-green)';
            formMessage.textContent = 'Profile created! Please log in to continue.';

            // Redirect to the login page after a short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error("Error creating profile:", error);
            formMessage.style.color = 'var(--red)';
            formMessage.textContent = `Could not create profile: ${error.message}`;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save My Profile';
        }
    });
});
