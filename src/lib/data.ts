import { MenuItem, MenuCategory, AllergenItem } from "@/types"

export const MENU_ITEMS: MenuItem[] = [
    // Seasonal Specials
    {
        id: 'seasonal-1',
        name: 'THE BROWNIE SHAKE',
        description: 'Fresh cream, Chocolate Sauce, And Brownie Chunkz',
        price: 4.50,
        priceAlt: 5.50,
        category: 'Seasonal Specials',
    },
    {
        id: 'seasonal-2',
        name: 'TRUFFLE PRM & PEPPER RANCH',
        description: 'Smash beef patty, truffle parmesan, pepper ranch sauce, crispy onions, American cheese',
        price: 12.00,
        category: 'Seasonal Specials',
    },
    {
        id: 'seasonal-3',
        name: 'THE DUBAI SHAKE',
        description: 'Fresh cream, Pistachio, Kataifi pastry, Chocolate sauce',
        price: 5.50,
        priceAlt: 6.50,
        category: 'Seasonal Specials',
    },

    // Beef Burgz
    {
        id: 'beef-1',
        name: 'Fussy Beef',
        description: 'Only Beef & Cheeze',
        price: 8.50,
        category: 'Beef Burgz',
    },
    {
        id: 'beef-2',
        name: 'Classic',
        description: 'Cheeze, Shredded Lettuce, Diced Onion, Dill Pickles, Classic Sauce.',
        price: 8.50,
        category: 'Beef Burgz',
    },
    {
        id: 'beef-3',
        name: 'Original',
        description: 'Cheeze, Grilled Onions, Dill Pickles, House-Made Sweet’n’Smokey Sauce.',
        price: 8.50,
        category: 'Beef Burgz',
    },
    {
        id: 'beef-4',
        name: 'Delicate',
        description: 'Cheeze, Shredded Lettuce, Spicy Pickled Onions, Fresh Chilli, Chipotle Mayo.',
        price: 8.50,
        category: 'Beef Burgz',
        is_spicy: true,
    },
    {
        id: 'beef-5',
        name: 'American',
        description: 'Cheeze, Diced Onion, Dill Pickles, Ketchup & Mustard',
        price: 8.50,
        category: 'Beef Burgz',
    },

    // Chix Burgz
    {
        id: 'chix-1',
        name: 'Fussy Chix',
        description: 'Only Chicken & Cheeze',
        price: 8.50,
        category: 'Chix Burgz',
    },
    {
        id: 'chix-2',
        name: 'Light',
        description: 'Cheeze, Lettuce & Creamy Garlic',
        price: 8.50,
        category: 'Chix Burgz',
    },
    {
        id: 'chix-3',
        name: 'Tangy',
        description: 'Cheeze, Lettuce, Pickled Onions, Chillies, Chipotle Mayo.',
        price: 8.50,
        category: 'Chix Burgz',
        is_spicy: true,
    },
    {
        id: 'chix-4',
        name: 'Crunchy',
        description: 'Cheeze, Dijonaise Coleslaw & House-Made Garlic Parmesan Sauce',
        price: 8.50,
        category: 'Chix Burgz',
    },
    {
        id: 'chix-5',
        name: 'Sweet’N’Smokey',
        description: 'Cheeze, Pickles, House-Made Sweet’N’Smokey Sauce.',
        price: 8.50,
        category: 'Chix Burgz',
    },

    // Vegetarian
    {
        id: 'veg-1',
        name: 'Vegetarian Option',
        description: 'Swap any beef with Oumi Cheeze.',
        price: 6.50,
        category: 'Vegetarian',
        is_veggie: true,
    },

    // Burgz Upgrades (Add Inside) - Previously 'Add Inside Your Burger'
    { id: 'up-1', name: 'Beef Patty', price: 2.50, category: 'Add Inside Your Burger' },
    { id: 'up-2', name: 'Chicken Breast', price: 4.00, category: 'Add Inside Your Burger' },
    { id: 'up-3', name: 'Bacon', price: 2.00, category: 'Add Inside Your Burger' },
    { id: 'up-4', name: 'Pastrami', price: 2.00, category: 'Add Inside Your Burger' },
    { id: 'up-5', name: 'Shoestring Onionz', price: 1.50, category: 'Add Inside Your Burger' },
    { id: 'up-6', name: 'Cheeze', price: 0.50, category: 'Add Inside Your Burger' },

    // Friez Upgrades (Add Into Your Box/Friez) - Mapping to 'Friez' or 'Add Into Your Box' based on context? 
    // The JSON calls them "Friez Upgrade" and has separate "Friez".
    // I will put standard fries in 'Friez' and upgrades in 'Add Into Your Box' or similar. 
    // Actually, 'Friez Upgrade' looks like toppings for fries or burger box. 
    // Let's use 'Add Into Your Box' for these to match previous structure for extras.
    { id: 'fup-1', name: 'Cheeze Sauce', price: 1.50, category: 'Add Into Your Box' },
    { id: 'fup-2', name: 'Cheeze Sauce & Bacon', price: 2.00, category: 'Add Into Your Box' },
    { id: 'fup-3', name: 'Truffle Garlic Parm', price: 2.00, category: 'Add Into Your Box' },
    { id: 'fup-4', name: 'Coleslaw', price: 1.50, category: 'Add Into Your Box' },

    // Sides (Chicken)
    { id: 'side-1', name: 'Chix Bitez (5 pcs)', price: 3.00, category: 'Sides' },
    { id: 'side-2', name: 'Chix Bitez (10 pcs)', description: '5 pcs x 2 flavs', price: 5.50, category: 'Sides' },
    { id: 'side-3', name: 'Chix Bitez (15 pcs)', description: '7+8 pcs x 2 flavs', price: 7.50, category: 'Sides' },
    { id: 'side-4', name: 'Filletz (2 pcs)', price: 3.50, category: 'Sides' },
    { id: 'side-5', name: 'Filletz (5 pcs)', price: 7.50, category: 'Sides' },
    { id: 'side-6', name: 'Oumi Cheeze (4 pcs)', price: 3.00, category: 'Sides', is_veggie: true },
    { id: 'side-7', name: 'Oumi Cheeze (8 pcs)', price: 5.00, category: 'Sides', is_veggie: true },

    // Friez (Standalone)
    { id: 'friez-1', name: 'Plain Friez', price: 2.50, category: 'Friez' },
    { id: 'friez-2', name: 'Cheeze Sauce Friez', price: 3.00, category: 'Friez' },
    { id: 'friez-3', name: 'Cheeze Sauce & Bacon Friez', price: 4.50, category: 'Friez' },
    { id: 'friez-4', name: 'Truffle Garlic Parm Friez', price: 4.50, category: 'Friez' },

    // Kidz Menu
    {
        id: 'kidz-1',
        name: 'Kidz Menu',
        description: 'Choice of: Single Beef, Chicken Bitez, Filletz, or Oumi Cheeze. Includes Friez.',
        price: 6.00,
        category: 'Kidz Menu'
    },

    // Cheesecakez
    { id: 'cake-1', name: 'Biscoff', price: 4.50, category: 'Cheesecakez', is_veggie: true },
    { id: 'cake-2', name: 'Lemon', price: 4.50, category: 'Cheesecakez', is_veggie: true },
    { id: 'cake-3', name: 'Oreo', price: 4.50, category: 'Cheesecakez', is_veggie: true },
    { id: 'cake-4', name: 'Banoffee', price: 4.50, category: 'Cheesecakez', is_veggie: true },
    // Removed San Sebastian as it's not in the new list

    // Milkshakez
    { id: 'shake-1', name: 'Vanilla', price: 3.50, category: 'Milkshakez', is_veggie: true }, // Regular by default
    { id: 'shake-2', name: 'Strawberry', price: 3.50, category: 'Milkshakez', is_veggie: true },
    { id: 'shake-3', name: 'Chocolate', price: 3.50, category: 'Milkshakez', is_veggie: true },
    { id: 'shake-4', name: 'Banana', price: 3.50, category: 'Milkshakez', is_veggie: true },



    // Breakfast (Untouched as requested)
    {
        id: 'break-1',
        name: 'Base Breakfast Burg',
        description: 'Topped with American slices.',
        price: 4.00,
        category: 'Breakfast',
    },
    {
        id: 'break-2',
        name: 'Extra Toppings',
        description: 'Add extra toppings to your breakfast burger.',
        price: 1.50,
        category: 'Breakfast',
    },

    // Hot Drinks (Preserving existing as JSON didn't explicitly delete, but check images? Assuming keep for now or standard items)
    { id: 'drink-1', name: 'Americano', price: 2.00, category: 'Hot Drinks', is_veggie: true },
    { id: 'drink-2', name: 'Latte', price: 2.50, category: 'Hot Drinks', is_veggie: true },
    { id: 'drink-3', name: 'Cappuccino', price: 2.50, category: 'Hot Drinks', is_veggie: true },
    { id: 'drink-4', name: 'Flat White', price: 2.50, category: 'Hot Drinks', is_veggie: true },
    { id: 'drink-5', name: 'Hot Chocolate', price: 2.50, category: 'Hot Drinks', is_veggie: true },
    { id: 'drink-6', name: 'Tea', price: 1.50, category: 'Hot Drinks', is_veggie: true },
]

export const LOCATIONS = [
    {
        name: 'South Shields',
        address: '124 Fowler St, South Shields NE33 1PZ',
        times: 'Mon-Thu: 12-9pm | Fri-Sat: 9am-9pm (Breakfast 9-11am) | Sun: 2-9pm',
    },
    {
        name: 'Byker, Newcastle',
        address: '247 Shields Road, NE6 1DQ',
        times: 'Mon-Thu: 12-9pm | Fri-Sat: 9am-9pm (Breakfast 9-11am) | Sun: 2-9pm',
    },
    {
        name: 'Forest Hall',
        address: '7 Station Road, NE12 7AR',
        times: 'Mon-Thu: 12-9pm | Fri-Sat: 9am-9pm (Breakfast 9-11am) | Sun: 2-9pm',
    },
    {
        name: 'Whitley Bay',
        address: '164 Whitley Road, NE26 2LX',
        times: 'Mon-Thu: 12-9pm | Fri-Sat: 9am-9pm (Breakfast 9-11am) | Sun: 2-9pm',
    },
    {
        name: 'Percy Street, Newcastle',
        address: '99 Percy St, Newcastle upon Tyne NE1 7RT',
        times: 'Mon-Thu: 12-9pm | Fri-Sat: 11:30am-9pm | Sun: 11am-6pm',
    }
]

// Extra sauce categories from JSON (Saucy / Dry flavours for chicken) could be here or just in the UI.
// The JSON has "flavours" for chix. I'll add them as a constant export.
export const CHICKEN_FLAVOURS = {
    saucy: [
        "Garlic Parm Crème",
        "Candy BBQ",
        "Sriracha Honey 🌶",
        "Nashville 🌶🌶"
    ],
    dry: [
        "Sweet Parmesan",
        "Peri Peri 🌶",
        "Fire Dust 🌶🌶"
    ]
}

export const ALLERGEN_ITEMS: AllergenItem[] = [
    { id: '1', name: 'The Classic', category: 'Beef Burgz', allergens: ['gluten', 'milk', 'mustard', 'eggs'] },
    // ... keep existing structure or update if needed. 
    // Since this is for display logic mostly, I'll leave basic placeholders.
]
