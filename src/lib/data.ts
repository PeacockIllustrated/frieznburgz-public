import { MenuItem, MenuCategory, AllergenItem } from "@/types"

export const MENU_ITEMS: MenuItem[] = [
    // Beef Burgz
    {
        id: 'beef-1',
        name: 'The Classic',
        description: 'Cheese with shredded lettuce, diced onions, pickles and a classic burger sauce.',
        price: 8.50,
        category: 'Beef Burgz',
    },
    {
        id: 'beef-2',
        name: 'Fussy',
        description: 'Only beef and cheese.',
        price: 8.50,
        category: 'Beef Burgz',
    },
    {
        id: 'beef-3',
        name: 'Original',
        description: 'Cheese plus grilled onions, pickles and a house sweet-and-smoky style sauce.',
        price: 8.50,
        category: 'Beef Burgz',
    },
    {
        id: 'beef-4',
        name: 'Delicate',
        description: 'Cheese, shredded lettuce, spicy pickled onions, fresh chilli and a chipotle-style sauce.',
        price: 8.50,
        category: 'Beef Burgz',
        is_spicy: true,
    },
    {
        id: 'beef-5',
        name: 'American',
        description: 'Cheese with diced onion, pickles, ketchup and mustard.',
        price: 8.50,
        category: 'Beef Burgz',
    },

    // Chix Burgz
    {
        id: 'chix-1',
        name: 'Fussy',
        description: 'Only chicken and cheese.',
        price: 8.50,
        category: 'Chix Burgz',
    },
    {
        id: 'chix-2',
        name: 'Light Chix',
        description: 'Cheese, lettuce and a creamy garlic-style sauce.',
        price: 8.50,
        category: 'Chix Burgz',
    },
    {
        id: 'chix-3',
        name: 'Tangy Chix',
        description: 'Cheese, lettuce, pickled onions, chillies and a hot smoky or chipotle-style sauce.',
        price: 8.50,
        category: 'Chix Burgz',
        is_spicy: true,
    },
    {
        id: 'chix-4',
        name: 'Crunchy Chix',
        description: 'Cheese with dijon-style coleslaw and a house sauce.',
        price: 8.50,
        category: 'Chix Burgz',
    },
    {
        id: 'chix-5',
        name: 'Sweet n’ Smokey Chix',
        description: 'Cheese, pickles and a sweet-smoky house sauce.',
        price: 8.50,
        category: 'Chix Burgz',
    },

    // Vegetarian
    {
        id: 'veg-1',
        name: 'Vegetarian Option',
        description: 'Swap any meat for Halloumi / “oumi” cheese.',
        price: 6.50,
        category: 'Vegetarian',
        is_veggie: true,
    },

    // Add Inside Your Burger
    { id: 'add-in-1', name: 'Beef Patty', price: 1.50, category: 'Add Inside Your Burger' },
    { id: 'add-in-2', name: 'Bacon', price: 1.50, category: 'Add Inside Your Burger' },
    { id: 'add-in-3', name: 'Pastrami', price: 1.50, category: 'Add Inside Your Burger' },
    { id: 'add-in-4', name: 'Shoestring Onionz', price: 1.50, category: 'Add Inside Your Burger' },
    { id: 'add-in-5', name: 'Cheeze', price: 0.50, category: 'Add Inside Your Burger' },
    { id: 'add-in-6', name: 'MEAT BOOST', description: 'Beef patty + pastrami + bacon', price: 4.00, category: 'Add Inside Your Burger' },

    // Add Into Your Box
    { id: 'add-box-1', name: 'Oumi Cheeze', price: 2.50, category: 'Add Into Your Box', is_veggie: true },
    { id: 'add-box-2', name: 'Coleslaw', price: 1.50, category: 'Add Into Your Box', is_veggie: true },
    { id: 'add-box-3', name: 'Cheese Sauce & Bacon Crumbz', price: 2.00, category: 'Add Into Your Box' },
    { id: 'add-box-4', name: 'Plain Filletz', price: 3.50, category: 'Add Into Your Box' },
    { id: 'add-box-5', name: 'Spicy Filletz', price: 3.50, category: 'Add Into Your Box', is_spicy: true },
    { id: 'add-box-6', name: 'Filletz of the Week', price: 5.50, category: 'Add Into Your Box' },

    // Cheesecakez
    { id: 'cake-1', name: 'Biscoff', price: 4.50, category: 'Cheesecakez', is_veggie: true },
    { id: 'cake-2', name: 'Lemon', price: 4.50, category: 'Cheesecakez', is_veggie: true },
    { id: 'cake-3', name: 'Oreo', price: 4.50, category: 'Cheesecakez', is_veggie: true },
    { id: 'cake-4', name: 'Banoffee', price: 4.50, category: 'Cheesecakez', is_veggie: true },
    { id: 'cake-5', name: 'San Sebastian', price: 4.50, category: 'Cheesecakez', is_veggie: true },

    // Milkshakez
    { id: 'shake-1', name: 'Vanilla', price: 3.50, category: 'Milkshakez', is_veggie: true },
    { id: 'shake-2', name: 'Strawberry', price: 3.50, category: 'Milkshakez', is_veggie: true },
    { id: 'shake-3', name: 'Chocolate', price: 3.50, category: 'Milkshakez', is_veggie: true },
    { id: 'shake-4', name: 'Banana', price: 3.50, category: 'Milkshakez', is_veggie: true },
    { id: 'shake-5', name: 'Flavour of the Week', description: 'Ask staff for details', price: 4.50, category: 'Milkshakez', is_veggie: true },

    // Extra Sauce
    { id: 'sauce-1', name: 'Creamy Garlic', price: 0.50, category: 'Extra Sauce', is_veggie: true },
    { id: 'sauce-2', name: 'Heinz Ketchup', price: 0.50, category: 'Extra Sauce', is_veggie: true },
    { id: 'sauce-3', name: 'Smokey BBQ', price: 0.50, category: 'Extra Sauce', is_veggie: true },
    { id: 'sauce-4', name: 'Chipotle Mayo', price: 0.50, category: 'Extra Sauce', is_veggie: true },
    { id: 'sauce-5', name: 'Sweet n’ Smokey', price: 0.50, category: 'Extra Sauce', is_veggie: true },
    { id: 'sauce-6', name: 'Burger Classic', price: 0.50, category: 'Extra Sauce', is_veggie: true },
    { id: 'sauce-7', name: 'Garlic Parmesan', price: 0.50, category: 'Extra Sauce', is_veggie: true },
    { id: 'sauce-8', name: 'Hot Cheese', price: 1.50, category: 'Extra Sauce', is_veggie: true },

    // Breakfast
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

    // Hot Drinks
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
        times: 'Mon-Sat: 12-9pm | Sun: 2-9pm',
    },
    {
        name: 'Byker, Newcastle',
        address: '247 Shields Road, NE6 1DQ',
        times: 'Mon-Sat: 12-9pm | Sun: 2-9pm',
    },
    {
        name: 'Forest Hall',
        address: '7 Station Road, NE12 7AR',
        times: 'Mon-Sat: 12-9pm | Sun: 2-9pm',
    },
    {
        name: 'Whitley Bay',
        address: '164 Whitley Road, NE26 2LX',
        times: 'Mon-Sat: 12-9pm | Sun: 2-9pm',
    }
]

export const ALLERGEN_ITEMS: AllergenItem[] = [
    // We'll keep the existing structure but ideally this should be populated with real data too.
    // For now, I'll map some of the new items to likely allergens based on names.
    { id: '1', name: 'The Classic', category: 'Beef Burgz', allergens: ['gluten', 'milk', 'mustard', 'eggs'] },
    { id: '2', name: 'Baconator', category: 'Beef Burgz', allergens: ['gluten', 'milk', 'mustard', 'eggs', 'sulphites'] },
    { id: '3', name: 'Hot Chick', category: 'Chix Burgz', allergens: ['gluten', 'milk', 'eggs', 'celery'] },
    { id: '4', name: 'The OG Bird', category: 'Chix Burgz', allergens: ['gluten', 'eggs', 'mustard'] },
    { id: '5', name: 'Skin-on Fries', category: 'Sides', allergens: [] },
    { id: '6', name: 'Mac n Cheese Bites', category: 'Sides', allergens: ['gluten', 'milk'] },
    { id: '7', name: 'Sausage & Egg Muffin', category: 'Breakfast', allergens: ['gluten', 'eggs', 'milk', 'soya'] },
    { id: '8', name: 'Vanilla Bean', category: 'Milkshakez', allergens: ['milk'] },
    { id: '9', name: 'Double Choc', category: 'Milkshakez', allergens: ['milk', 'soya'] },
]
