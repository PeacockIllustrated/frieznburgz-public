// --- staff-training/register-profile.js (Final Corrected Version) ---

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
    const loadingSpinner = document.getElementById('loading-spinner'); // Get spinner
    const formWrapper = document.querySelector('.auth-card'); // Get form wrapper

    // Hide spinner and show form once the page is ready
    if(loadingSpinner) loadingSpinner.style.display = 'none';
    if(formWrapper) formWrapper.style.display = 'block';

    // Populate the location dropdown
    if (locations && locationSelect) {
        locationSelect.innerHTML = '<option value="" disabled selected>-- Select your store --</option>';
        locations.forEach(loc => {
            if(loc.id !== 'all_locations') { // Don't let new staff select "all locations"
                 const option = document.createElement('option');
                 option.value = loc.id;
                 option.textContent = loc.name;
                 locationSelect.appendChild(option);
            }
        });
    }

    // This page's logic is only accessible to a logged-in user.
    const user = auth.currentUser;
    if (user) {
        emailInput.value = user.email;
    } else {
        // This is a fallback, but the auth script should prevent this state.
        console.error("No user found. Redirecting to login.");
        window.location.href = 'login.html';
        return;
    }

    // Handle form submission
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        formMessage.textContent = '';

        const staffData = {
            name: document.getElementById('fullName').value.trim(),
            email: user.email,
            phone: document.getElementById('phone').value.trim(),
            locationId: document.getElementById('location').value,
            startDate: document.getElementById('startDate').value.trim(),
            role: "Employee" // Default role
        };

        if (!staffData.name || !staffData.phone || !staffData.locationId || !staffData.startDate) {
            formMessage.textContent = 'Please fill out all fields.';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save My Profile';
            return;
        }

        try {
            const staffDocRef = db.collection('staff').doc(user.uid);
            await staffDocRef.set(staffData);

            const progressDocRef = db.collection('users').doc(user.uid);
            await progressDocRef.set({ readSections: [], quizHistory: [] });

            formMessage.style.color = 'var(--success-green)';
            formMessage.textContent = 'Profile saved! Redirecting to training...';

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
});
