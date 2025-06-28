// --- staff-training/register-profile.js ---

import { db, auth } from './firebase-config.js';
// We need the locations array to populate the dropdown.
// Assuming it's exported from the main project's config.js
import { locations } from '../config.js'; 

document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    const emailInput = document.getElementById('email');
    const locationSelect = document.getElementById('location');
    const formMessage = document.getElementById('form-message');
    const submitBtn = document.getElementById('submitProfileBtn');

    // Populate the location dropdown
    if (locations && locationSelect) {
        locationSelect.innerHTML = '<option value="" disabled selected>-- Select your store --</option>';
        locations.forEach(loc => {
            const option = document.createElement('option');
            option.value = loc.id;
            option.textContent = loc.name;
            locationSelect.appendChild(option);
        });
    }

    // This page's logic is driven by the auth state
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Pre-fill the email address and make it read-only
            emailInput.value = user.email;

            // Handle form submission
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                submitBtn.disabled = true;
                submitBtn.textContent = 'Saving...';
                formMessage.textContent = '';

                // Get data from the form
                const staffData = {
                    name: document.getElementById('fullName').value.trim(),
                    email: user.email,
                    phone: document.getElementById('phone').value.trim(),
                    locationId: document.getElementById('location').value,
                    startDate: document.getElementById('startDate').value.trim(),
                    role: "Employee" // Default role for new sign-ups
                };

                // Basic validation
                if (!staffData.name || !staffData.phone || !staffData.locationId || !staffData.startDate) {
                    formMessage.textContent = 'Please fill out all fields.';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save My Profile';
                    return;
                }

                try {
                    // Save the data to Firestore using the user's UID as the document ID
                    const staffDocRef = db.collection('staff').doc(user.uid);
                    await staffDocRef.set(staffData);

                    // Also create their progress document at the same time
                    const progressDocRef = db.collection('users').doc(user.uid);
                    await progressDocRef.set({
                        readSections: [],
                        quizHistory: []
                    });

                    formMessage.style.color = 'var(--success-green)';
                    formMessage.textContent = 'Profile saved successfully! Redirecting to training...';

                    // Redirect to the main handbook page after a short delay
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);

                } catch (error) {
                    console.error("Error saving profile:", error);
                    formMessage.style.color = 'var(--red)';
                    formMessage.textContent = 'Could not save profile. Please try again.';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save My Profile';
                }
            });

        } else {
            // If for some reason user gets here without being logged in, send them to the login page.
            window.location.href = 'login.html';
        }
    });
});
