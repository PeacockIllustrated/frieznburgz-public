export type SpecialType = 'burger' | 'fillet' | 'shake';

export interface Special {
    id: string;
    type: SpecialType;
    title: string;
    slug: string;
    subtitle?: string | null;
    description: string;
    price?: number | null;
    image_url?: string | null;
    is_active: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
    created_at: string;
    updated_at: string;
}

export type MenuCategory =
    | 'Beef Burgz'
    | 'Chix Burgz'
    | 'Vegetarian'
    | 'Sides'
    | 'Breakfast'
    | 'Milkshakez'
    | 'Cheesecakez'
    | 'Hot Drinks'
    | 'Add Inside Your Burger'
    | 'Add Into Your Box'
    | 'Extra Sauce';

export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price?: number;
    category: MenuCategory;
    is_vegan?: boolean;
    is_veggie?: boolean;
    is_spicy?: boolean;
}

export type Allergen =
    | 'gluten'
    | 'eggs'
    | 'milk'
    | 'soya'
    | 'mustard'
    | 'sesame'
    | 'fish'
    | 'celery'
    | 'sulphites';

export interface AllergenItem {
    id: string;
    name: string;
    category: MenuCategory;
    allergens: Allergen[];
}

export interface RecruitmentApplication {
    id: string;
    name: string;
    email: string;
    phone: string;
    preferredLocation: string;
    desiredRole: string;
    availability: string;
    message: string;
    created_at: string;
}
