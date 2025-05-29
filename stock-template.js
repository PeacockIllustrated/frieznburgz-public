// --- stock-template.js ---
// Provides HTML templating for stock item display.

// The getItemIconClass function is no longer strictly needed for display
// in this new UI, but keeping it commented out for potential future use
// or if icons are needed elsewhere.
/*
function getItemIconClass(item) {
    const category = item.category ? item.category.toLowerCase() : '';
    const itemId = item.id ? item.id.toLowerCase() : '';

    // Specific item overrides for more precise icons
    switch (itemId) {
        case 'beef_patties': return 'fas fa-burger'; // Burger icon for beef patties
        case 'bacon_strips': return 'fas fa-bacon';
        case 'american_cheese_slices':
        case 'halloumi_cheese':
        case 'mozzarella_patties': return 'fas fa-cheese'; // Generic cheese icon
        case 'honey_chilli_glaze':
        case 'special_sauce_base': return 'fas fa-jar'; // Jar for sauces/bases
        case 'crispy_onions': return 'fas fa-onion';
        case 'mango_puree': return 'fas fa-blender'; // Blender for milkshake puree
        case 'lettuce_shredded': return 'fas fa-leaf';
        case 'onions_diced': return 'fas fa-onion';
        case 'potatoes_fries': return 'fas fa-potato'; // Requires FA 6.0.0-beta3 or newer for 'fa-potato'
        case 'classic_sauce':
        case 'ketchup_heinz': return 'fas fa-bottle-droplet'; // Bottle for condiments
        case 'burger_buns': return 'fas fa-bread-slice';
        case 'frying_oil': return 'fas fa-oil-can';
        case 'disposable_gloves': return 'fas fa-hands'; // Generic hands or gloves
    }

    // General category-based icons
    if (category.includes('meat') || category.includes('filletz')) {
        return 'fas fa-drumstick-bite'; // Generic meat/poultry
    }
    if (category.includes('cheese')) {
        return 'fas fa-cheese';
    }
    if (category.includes('produce') || category.includes('vegetables')) {
        return 'fas fa-carrot'; // Generic vegetable
    }
    if (category.includes('sauce') || category.includes('condiment') || category.includes('ingredients')) {
        return 'fas fa-bottle-droplet'; // Generic sauce/liquid
    }
    if (category.includes('bread') || category.includes('baked goods')) {
        return 'fas fa-bread-slice';
    }
    if (category.includes('milkshake')) {
        return 'fas fa-mug-hot'; // Mug for milkshake related
    }
    if (category.includes('essentials')) {
        return 'fas fa-tools'; // Generic tools/essentials
    }

    return 'fas fa-box'; // Default fallback icon
}
*/

/**
 * Generates the HTML string for a single stock item.
 * @param {Object} item - The item object with properties like id, name, unit, currentStock, reorderPoint, reorderQuantity.
 * @returns {string} The HTML string for the stock item.
 */
export function createStockItemHtml(item) {
    const currentStock = typeof item.currentStock === 'number' ? item.currentStock : 0;

    // Corrected HTML structure with the new .stock-controls-group wrapper
    return `
        <span class="item-name">${item.name} (${item.unit || 'units'})</span>
        <div class="stock-controls-group">
            <div class="stock-controls">
                <button class="control-button decrement-btn">-</button>
                <input type="number" class="stock-input" value="${currentStock}" min="0">
                <button class="control-button increment-btn">+</button>
            </div>
            <button class="add-stock-button reorder-btn" title="Message Supplier">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
}
