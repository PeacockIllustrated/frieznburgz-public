// --- settings.js ---
// Manages the rendering and logic for the Settings page.

import { getSelectedLocation } from './config.js'; // For location display
// No specific Firebase imports needed for static content, but keep if future settings need DB interaction

// DOM Element for the settings page
const settingsPage = document.getElementById('settingsPage');

/**
 * Renders the Settings page content.
 * Includes options for Staff Training, Company Handbook, and App User Guide.
 */
export async function renderSettingsPage() {
    const selectedLocationId = getSelectedLocation();
    const locationDisplayName = selectedLocationId ?
        selectedLocationId.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') :
        'Global'; // Default if no location selected, though settings are usually global/admin controlled

    settingsPage.innerHTML = `
        <h2 class="page-title">Settings & Resources</h2>
        <p>Manage application settings and access important resources for ${locationDisplayName}.</p>

        <div class="settings-grid">
            <!-- Staff Training Hub -->
            <div class="settings-card">
                <div class="settings-header">
                    <h3 class="settings-section-title">Staff Training Hub</h3>
                </div>
                <div class="settings-content">
                    <p>Access and log staff training completions.</p>
                    <button id="viewStaffTrainingBtn" class="auth-button quick-action-btn small-btn">
                        <i class="fas fa-user-graduate"></i> Go to Staff Training
                    </button>
                </div>
            </div>

            <!-- Company Handbook (Accordion) -->
            <div class="settings-card accordion-card">
                <div class="settings-header" data-target="companyHandbookContent">
                    <h3 class="settings-section-title">Company Handbook</h3>
                    <i class="fas fa-chevron-down accordion-icon"></i>
                </div>
                <div id="companyHandbookContent" class="settings-content accordion-content">
                    <p>This section outlines company policies, procedures, and employee expectations.</p>
                    <p><strong>Key Topics:</strong></p>
                    <ul>
                        <li><i class="fas fa-arrow-right list-bullet"></i> Dress Code & Appearance</li>
                        <li><i class="fas fa-arrow-right list-bullet"></i> Health & Safety Guidelines</li>
                        <li><i class="fas fa-arrow-right list-bullet"></i> Customer Service Standards</li>
                        <li><i class="fas fa-arrow-right list-bullet"></i> Food Handling Procedures</li>
                        <li><i class="fas fa-arrow-right list-bullet"></i> Anti-Discrimination Policy</li>
                    </ul>
                    <p>For a full version, please consult your physical handbook or internal shared drive.</p>
                </div>
            </div>

            <!-- App User Guide (Accordion) -->
            <div class="settings-card accordion-card">
                <div class="settings-header" data-target="appUserGuideContent">
                    <h3 class="settings-section-title">App User Guide</h3>
                    <i class="fas fa-chevron-down accordion-icon"></i>
                </div>
                <div id="appUserGuideContent" class="settings-content accordion-content">
                    <p>A comprehensive guide to using the Friez n Burgz Admin Dashboard features.</p>
                    <p><strong>Sections Include:</strong></p>
                    <ul>
                        <li><i class="fas fa-arrow-right list-bullet"></i> Dashboard Overview & Alerts</li>
                        <li><i class="fas fa-arrow-right list-bullet"></i> Managing Stock Inventory</li>
                        <li><i class="fas fa-arrow-right list-bullet"></i> Logging & Reviewing Wastage</li>
                        <li><i class="fas fa-arrow-right list-bullet"></i> Staff Training Records</li>
                        <li><i class="fas fa-arrow-right list-bullet"></i> Quick Actions & Modals</li>
                    </ul>
                    <p>If you require further assistance, contact IT support.</p>
                </div>
            </div>

            <!-- Future Settings (Example) -->
            <div class="settings-card">
                <div class="settings-header">
                    <h3 class="settings-section-title">User Management</h3>
                </div>
                <div class="settings-content">
                    <p>Manage user accounts and permissions (Coming Soon).</p>
                    <button class="auth-button quick-action-btn small-btn disabled" disabled>
                        <i class="fas fa-users-cog"></i> Manage Users
                    </button>
                </div>
            </div>

        </div>
    `;

    // Attach event listeners after content is rendered
    const viewStaffTrainingBtn = document.getElementById('viewStaffTrainingBtn');
    if (viewStaffTrainingBtn) {
        viewStaffTrainingBtn.addEventListener('click', () => {
            if (window.mainApp && typeof window.mainApp.handleNavigationClick === 'function') {
                window.mainApp.handleNavigationClick('staff-training'); // Navigate to staff training page
            } else {
                console.error('Navigation handler not available.');
            }
        });
    }

    // Initialize accordion behavior for handbook and user guide
    const accordionHeaders = settingsPage.querySelectorAll('.settings-header[data-target]');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const contentId = header.dataset.target;
            const contentElement = document.getElementById(contentId);
            const parentCard = header.closest('.accordion-card');

            if (contentElement && parentCard) {
                parentCard.classList.toggle('active');
            }
        });
    });

    console.log('Settings page rendered.');
}
