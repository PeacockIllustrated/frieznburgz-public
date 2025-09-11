// --- allergens-template.js ---
// Contains HTML template functions for the Allergens module.

/**
 * Creates the basic HTML structure for a content page.
 * @param {string} title - The title to display at the top of the page.
 * @param {string} contentHtml - The HTML content to place below the title.
 * @returns {string} The complete HTML for the page section.
 */
export function createPageHtml(title, contentHtml) {
    return `
        <h2 class="page-title">${title}</h2>
        <div class="page-content">
            ${contentHtml}
        </div>
    `;
}
