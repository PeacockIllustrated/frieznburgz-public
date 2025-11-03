# Friez n Burgz - Admin Dashboard

A comprehensive restaurant management system for multi-location operations, built with vanilla JavaScript and Firebase.

## Features

- **Multi-Location Management**: Support for multiple restaurant locations
- **Inventory & Stock Management**: Real-time stock tracking with critical alerts
- **Order Management**: Supplier order creation and tracking
- **Wastage Tracking**: Log and monitor waste with history
- **Staff Management**: Staff profiles, training progress, and role-based access
- **Rota/Scheduling**: Weekly shift management and staff assignment
- **Loyalty Program**: Customer stamp cards with reward system
- **Allergen Management**: FSA-compliant allergen matrix with version control
- **Training Portal**: Staff handbook with quiz system

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Backend**: Firebase (Firestore, Authentication, Cloud Functions)
- **Authentication**: Email/Password and Google Sign-In
- **Database**: Firestore (NoSQL)

## Prerequisites

- Node.js 18+ (for Cloud Functions)
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore, Authentication, and Functions enabled

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd frieznburgz
```

### 2. Install Dependencies

```bash
# Install Cloud Functions dependencies
cd functions
npm install
cd ..

# Install root dependencies (for development tools)
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase configuration and secrets.

### 4. Firebase Setup

1. Login to Firebase:
```bash
firebase login
```

2. Initialize Firebase (if not already done):
```bash
firebase init
```

3. Set your Firebase project:
```bash
firebase use <your-project-id>
```

### 5. Configure Firestore Security Rules

Review and deploy Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

### 6. Deploy Cloud Functions

```bash
firebase deploy --only functions
```

### 7. Deploy Hosting

```bash
firebase deploy --only hosting
```

## Development

### Local Development Server

For local development, you can use any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000

# Using VS Code Live Server extension
```

Then open `http://localhost:8000` in your browser.

### Firebase Emulators (Recommended)

For a more complete development experience:

```bash
# Start emulators
firebase emulators:start

# Start only specific emulators
firebase emulators:start --only firestore,auth,functions
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Lint and fix
npm run lint:fix
```

## Project Structure

```
frieznburgz/
├── assets/                 # Static assets (logos, images)
├── functions/              # Cloud Functions
│   ├── index.js           # Function definitions
│   └── package.json       # Function dependencies
├── handbook/              # Staff handbook modules
├── public/                # Public-facing pages (loyalty, employee flow)
├── staff-training/        # Staff training portal
├── templates/             # HTML template generators
├── utils/                 # Utility modules (logging, config)
├── *.js                   # Main application modules
├── index.html             # Main entry point
├── style.css              # Main stylesheet
├── config.js              # Application configuration
├── firebase.js            # Firebase initialization
└── main.js                # Application entry point
```

## Configuration

### Locations

Add or modify locations in `config.js`:

```javascript
export const locations = [
    { id: 'location_id', name: 'Location Name' },
    // ...
];
```

### Stock Categories

Stock categories and icons are configured in `config.js` under `itemCategoryIcons`.

### Firebase Configuration

Firebase configuration is loaded from environment variables. Set these in `.env`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## First-Time Setup

### 1. Create Admin User

After deploying and logging in with your Firebase account, open the browser console and run:

```javascript
import { importAdminUser } from './import-admin.js';
await importAdminUser();
```

**Note**: Update `import-admin.js` with your admin details before running, or modify after creation.

### 2. Seed Initial Data

```javascript
// Seed allergens
import { seedAllergens } from './seed.js';
await seedAllergens();

// Seed training data
// This runs automatically on first load, but can be triggered manually
```

## Firestore Collections

### Main Collections

- `staff` - Staff member profiles
- `locations/{locationId}/items` - Stock items per location
- `orders` - Supplier orders
- `wastage` - Waste log entries
- `menuItems` - Menu items with allergen data
- `allergenVersions` - Versioned allergen matrices
- `loyaltyCards` - Customer loyalty cards
- `loyaltyPrograms` - Loyalty program configurations
- `users` - Training progress data

See `CODEBASE_ANALYSIS.md` for detailed schema documentation.

## Deployment

### Production Deployment

```bash
# Build and deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Environment Variables in Production

For Cloud Functions, set environment variables:

```bash
firebase functions:config:set secret.gatekeeper_password="your_password"
```

Then access in functions:

```javascript
const gatekeeperPassword = functions.config().secret.gatekeeper_password;
```

For client-side environment variables, they must be available at build time. For vanilla JS projects, consider using Firebase Remote Config or a config endpoint.

## Troubleshooting

### Authentication Issues

- Ensure Firebase Authentication is enabled in the Firebase Console
- Check that your email provider is enabled (Email/Password, Google, etc.)
- Verify Firestore security rules allow authentication

### Firestore Permission Errors

- Review Firestore security rules
- Ensure user has proper role/permissions
- Check that user document exists in `staff` collection

### Cloud Functions Errors

- Check function logs: `firebase functions:log`
- Verify function dependencies are installed: `cd functions && npm install`
- Ensure Node.js version matches (18)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting: `npm run lint`
4. Test thoroughly
5. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions, please contact [support contact] or open an issue in the repository.

## Changelog

See `CHANGELOG.md` for version history and updates.

