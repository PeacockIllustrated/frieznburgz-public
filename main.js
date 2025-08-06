// --- main.js (CORRECTED & FINALIZED FOR PICKLE & PEACH) ---
// Main application entry point and orchestrator.

// --- Module Imports ---
import { auth } from './firebase.js';
import { initAuth, showAuth, hideAuth } from './auth.js';
import { showPage, initSidebarNav, showDashboardContainer, hideDashboardContainer } from './ui.js';
import { renderDashboardOverviewPage, openModal, closeModal, showQuickAdjustmentModal } from './dashboard.js';
import { renderStockManagementPage, getAllStockItems, getCurrentStockItems } from './stock.js';
import { renderStaffPage } from './staff.js';
import { renderWastageLogPage } from './wastage.js';
import { renderLoyaltyManagementPage } from './loyaltyManagement.js';
import { renderOrdersPage } from './orders.js';
import { renderSuppliersPage } from './suppliers.js';
import { renderSettingsPage, loadSavedTheme } from './settings.js';

// --- DOM Elements ---
const logoutBtn = document.getElementById('logoutBtn');
const currentLocationDisplay = document.getElementById('currentLocationDisplay');

// --- App Initialization & State Management ---

function initializeApp() {
    console.log('Initializing Pickle & Peach Admin Portal...');
    loadSavedTheme(); // Apply saved theme on startup before showing anything
    initAuth();
    initSidebarNav(renderPageContent);
    logoutBtn.addEventListener('click', handleLogout);
    auth.onAuthStateChanged(handleAuthStateChange);
}

function handleAuthStateChange(user) {
    if (user) {
        console.log(`User authenticated: ${user.email}`);
        hideAuth();
        showDashboard();
    } else {
        console.log('User is not authenticated.');
        hideDashboardContainer();
        showAuth();
    }
}

function showDashboard() {
    showDashboardContainer();
    currentLocationDisplay.textContent = 'Admin Dashboard';
    showPage('dashboard');
    renderPageContent('dashboard');
    console.log('Dashboard shown.');
}

async function handleLogout() {
    try {
        await auth.signOut();
        console.log('User logged out successfully.');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to log out.');
    }
}

async function renderPageContent(pageId) {
    console.log(`Rendering content for page: ${pageId}`);
    switch (pageId) {
        case 'dashboard':
            await renderDashboardOverviewPage();
            break;
        case 'stock-management':
            await renderStockManagementPage();
            break;
        case 'staff':
            await renderStaffPage();
            break;
        case 'wastage-log':
            await renderWastageLogPage();
            break;
        case 'loyalty-management': 
            await renderLoyaltyManagementPage();
            break;
        case 'orders':
            await renderOrdersPage();
            break;
        case 'suppliers':
            await renderSuppliersPage();
            break;
        case 'settings':
            renderSettingsPage();
            break;
        default:
            console.warn(`No rendering function found for page: ${pageId}`);
            document.getElementById('dashboardContent').innerHTML = `<p>Page not found: ${pageId}</p>`;
            break;
    }
}

/**
 * Shows a full-screen feedback overlay with an icon and message.
 * @param {'processing'|'success'|'error'} state The state to display.
 * @param {string} message The message to show.
 */
function showFeedbackOverlay(state, message) {
    const overlay = document.getElementById('feedback-overlay');
    const iconContainer = document.getElementById('feedback-icon-container');
    const messageEl = document.getElementById('feedback-message');

    if (!overlay || !iconContainer || !messageEl) return;

    messageEl.textContent = message;
    overlay.className = 'feedback-overlay'; // Reset classes
    iconContainer.innerHTML = ''; // Clear previous icon

    let iconClass = '';
    let stateClass = 'processing';

    switch (state) {
        case 'success':
            stateClass = 'success';
            iconClass = 'fas fa-check';
            break;
        case 'error':
            stateClass = 'error';
            iconClass = 'fas fa-times';
            break;
        case 'processing':
            stateClass = 'processing';
            iconClass = 'fas fa-hand-pointer';
            break;
    }
    
    overlay.classList.add(stateClass);
    const icon = document.createElement('i');
    icon.className = iconClass;
    iconContainer.appendChild(icon);

    overlay.classList.add('visible');
}

/** Hides the feedback overlay. */
function hideFeedbackOverlay() {
    const overlay = document.getElementById('feedback-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
    }
}

// --- Global App Object ---
// Expose functions to the window object so they can be called from other modules or the console.
window.mainApp = {
    handleNavigationClick: renderPageContent,
    openModal,
    closeModal,
    showQuickAdjustmentModal,
    showFeedbackOverlay,
    hideFeedbackOverlay,
    getCurrentStockItems,
    getAllStockItems,
    // The import functions will be attached to this object by import-data.js
};

// --- App Entry Point ---
document.addEventListener('DOMContentLoaded', initializeApp);
