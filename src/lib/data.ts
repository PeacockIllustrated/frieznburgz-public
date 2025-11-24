import { MenuItem, MenuCategory, AllergenItem } from "@/types"

export const MENU_ITEMS: MenuItem[] = [
    // Beef Burgz
    {
        id: '1',
        name: 'The Classic',
        description: 'Double smashed patty, american cheese, pickles, house sauce.',
        price: 9.50,
        category: 'Beef Burgz',
    },
    {
        id: '2',
        name: 'Baconator',
        description: 'Double patty, crispy bacon, cheese sauce, caramelized onions.',
        price: 11.00,
        category: 'Beef Burgz',
    },
    // Chix Burgz
    {
        id: '3',
        name: 'Hot Chick',
        description: 'Fried chicken thigh, spicy slaw, pickles, hot honey.',
        price: 10.50,
        category: 'Chix Burgz',
        is_spicy: true,
    },
    {
        id: '4',
        name: 'The OG Bird',
        description: 'Fried chicken, lettuce, mayo.',
        price: 9.00,
        category: 'Chix Burgz',
    },
    // Sides
    {
        id: '5',
        name: 'Skin-on Fries',
        description: 'Rosemary salt.',
        price: 4.00,
        category: 'Sides',
        is_vegan: true,
    },
    {
        id: '6',
        name: 'Mac n Cheese Bites',
        description: 'With truffle mayo.',
        price: 6.00,
        category: 'Sides',
        is_veggie: true,
    },
    // Breakfast
    {
        id: '7',
        name: 'Sausage & Egg Muffin',
        description: 'Sausage patty, fried egg, cheese.',
        price: 6.50,
        category: 'Breakfast',
    },
    // Milkshakez
    {
        id: '8',
        name: 'Vanilla Bean',
        price: 5.00,
        category: 'Milkshakez',
        is_veggie: true,
    },
    {
        id: '9',
        name: 'Double Choc',
        price: 5.50,
        category: 'Milkshakez',
        is_veggie: true,
    }
]

export const LOCATIONS = [
    {
        name: 'Downtown',
        address: '123 Burger Lane, City Centre',
        times: 'Mon-Sun: 11am - 10pm',
    },
    {
        name: 'Westside',
        address: '45 West Ave, Westside',
        times: 'Mon-Sun: 11am - 11pm',
    }
]

export const ALLERGEN_ITEMS: AllergenItem[] = [
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
