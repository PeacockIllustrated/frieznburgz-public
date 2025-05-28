// --- ui.js ---
// General UI utility functions for managing page visibility and navigation.

// --- DOM Elements ---
const mainDashboardContainer = document.getElementById('mainDashboardContainer');
const sidebarNavItems = document.querySelectorAll('.nav-item'); // All sidebar navigation links
const contentPages = document.querySelectorAll('.content-page'); // All content sections

/**
 * Initializes sidebar navigation click listeners.
 * Sets up dynamic page switching.
 */
export function initSidebarNav() {
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            const pageId = event.currentTarget.dataset.page; // Get page ID from data-page attribute
            if (pageId) {
                showPage(pageId); // Show the selected page
                updateSidebarActiveState(pageId); // Update active class
            }
        });
    });
    console.log('Sidebar navigation initialized.');
}

/**
 * Shows a specific content page and hides all others.
 * @param {string} pageId - The ID of the page to show (e.g., 'dashboard', 'stock-management').
 */
export function showPage(pageId) {
    contentPages.forEach(page => {
        if (page.id === `${pageId}Page`) { // Match ID with 'Page' suffix (e.g., 'dashboardPage')
            page.classList.add('active-page');
            page.style.display = 'block'; // Ensure it's displayed
        } else {
            page.classList.remove('active-page');
            page.style.display = 'none'; // Ensure it's hidden
        }
    });
    console.log(`Showing page: ${pageId}`);
}

/**
 * Hides all content pages.
 */
export function hideAllPages() {
    contentPages.forEach(page => {
        page.classList.remove('active-page');
        page.style.display = 'none';
    });
    console.log('All content pages hidden.');
}

/**
 * Updates the 'active' class on sidebar navigation items.
 * @param {string} activePageId - The ID of the currently active page.
 */
function updateSidebarActiveState(activePageId) {
    sidebarNavItems.forEach(item => {
        if (item.dataset.page === activePageId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Shows the main dashboard container.
 * This is a utility for main.js to call, if needed.
 */
export function showDashboardContainer() {
    mainDashboardContainer.style.display = 'grid'; // Use grid for dashboard layout
    console.log('Main dashboard container shown.');
}

/**
 * Hides the main dashboard container.
 * This is a utility for main.js to call, if needed.
 */
export function hideDashboardContainer() {
    mainDashboardContainer.style.display = 'none';
    console.log('Main dashboard container hidden.');
}
