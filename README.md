# Friez n Burgz

A mobile-first Next.js website and admin dashboard for Friez n Burgz burger restaurant.

## Features

- 🍔 **Public Website**: Homepage with weekly specials, full menu, allergen information, and recruitment
- 🎛️ **Admin Dashboard**: Manage weekly specials with business logic enforcement
- 📱 **Mobile-First**: Optimized for phones (375px+) with responsive breakpoints
- 🎨 **Bold Design**: Dark theme with vibrant red/yellow accents
- 🔒 **Supabase Backend**: PostgreSQL with Row Level Security

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp env-template.txt .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── (public)/       # Public pages
│   ├── app/            # Admin dashboard
│   ├── auth/           # Authentication
│   └── actions/        # Server actions
├── components/
│   └── ui/             # Reusable components
├── lib/
│   ├── supabase/       # Database clients
│   └── data.ts         # Static data
└── types/              # TypeScript types
```

## Database Setup

1. Create a Supabase project
2. Run the migration from `supabase/migrations/20240523000000_init.sql`
3. Add your Supabase credentials to `.env.local`

## Environment Variables

Required:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Key Pages

- `/` - Homepage with specials and menu
- `/allergens` - Allergen information matrix
- `/customer-links` - Social media and review links
- `/recruitment` - Job application form
- `/app` - Admin dashboard (requires auth)
- `/app/specials` - Manage weekly specials

## Admin Dashboard

The admin dashboard allows you to:
- View all specials grouped by type (burger, fillet, shake)
- Set one active special per type
- Create and edit specials with live preview
- Manage dates and pricing

## Design System

**Colors:**
- Primary (Red): `#e71e26`
- Secondary (Yellow): `#fbae29`
- Background: `#050505`
- Surface: `#2f2f2f`

**Typography:**
- Headings: Fraunces-like serif
- Body: Futura-like geometric sans

## Known Issues

- Build currently fails due to missing `@radix-ui/react-slot` dependency for `asChild` prop pattern
- Auth login page is a placeholder - needs Supabase Auth UI integration

## Next Steps

1. Install `@radix-ui/react-slot` and update Button component
2. Integrate Supabase Auth UI for login
3. Add image upload functionality
4. Implement recruitment applications view in admin
5. Add tests

## License

Private project for Friez n Burgz.
