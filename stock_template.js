// --- stock-template.js ---
// Provides HTML templating for stock item display.

/**
 * Generates the HTML string for a single stock item.
 * @param {Object} item - The item object with properties like id, name, unit, currentStock, reorderPoint, reorderQuantity.
 * @returns {string} The HTML string for the stock item.
 */
export function createStockItemHtml(item) {
    // Ensure numeric values are indeed numbers for calculations
    const currentStock = typeof item.currentStock === 'number' ? item.currentStock : 0;
    const reorderPoint = typeof item.reorderPoint === 'number' ? item.reorderPoint : 0;
    const reorderQuantity = typeof item.reorderQuantity === 'number' ? item.reorderQuantity : 0;

    let stockStatusClass = '';
    let fillHeight = '0%';

    if (currentStock <= reorderPoint / 2) {
        stockStatusClass = 'critical';
    } else if (currentStock <= reorderPoint) {
        stockStatusClass = 'low';
    } else {
        stockStatusClass = 'good';
    }

    // Calculate fill height based on a hypothetical max stock for visual representation.
    // This helps the visual indicator scale somewhat dynamically.
    const visualMaxStock = Math.max(currentStock, reorderQuantity * 2, reorderPoint * 3, 100);
    if (currentStock >= 0 && visualMaxStock > 0) {
        fillHeight = `${Math.min(100, (currentStock / visualMaxStock) * 100)}%`;
    }

    return `
        <div class="stock-indicator-circle ${stockStatusClass}">
             <div class="stock-indicator-fill" style="height: ${fillHeight};"></div>
        </div>
        <span class="item-name">${item.name} (${item.unit || 'units'})</span>
        <div class="stock-controls">
            <button class="control-button decrement-btn">-</button>
            <input type="number" class="stock-input" value="${currentStock}" min="0">
            <button class="control-button increment-btn">+</button>
        </div>
        <button class="add-stock-button reorder-btn" title="Message Supplier">
            <i class="fas fa-plus"></i>
        </button>
    `;
}
