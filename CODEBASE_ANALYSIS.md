# Friez n Burgz - Codebase Analysis

## 1. Application Summary

**Friez n Burgz** is a comprehensive restaurant management system built for a multi-location burger restaurant chain. The application serves as an admin dashboard for managing various aspects of restaurant operations across multiple locations (South Shields, Forrest Hall, Byker, Whitley Bay, and Newcastle City Center).

### Core Functionality:

1. **Multi-Location Management**
   - Location selection after login
   - Location-specific data isolation
   - Multi-location admin access

2. **Inventory & Stock Management**
   - Real-time stock tracking per location
   - Stock adjustments and transactions
   - Category-based organization (Meat, Cheese, Produce, Bread, etc.)
   - Critical stock alerts
   - Stock activity logs with transaction grouping

3. **Order Management**
   - Create and manage supplier orders
   - Order tracking and receipt
   - Supplier relationship management
   - Automatic stock updates on order receipt

4. **Wastage Tracking**
   - Log waste entries with reasons
   - Waste history for the past 7 days
   - User attribution for waste entries

5. **Staff Management**
   - Staff profiles with location assignment
   - Training progress tracking (handbook completion, quiz scores)
   - Role-based access control (admin, manager, staff)
   - Staff training system with quizzes

6. **Rota/Scheduling**
   - Weekly shift management
   - Staff assignment to shifts
   - Calendar view for shift planning

7. **Loyalty Program**
   - Customer stamp cards
   - Reward unlocking system
   - 7-day streak rewards
   - Admin reward redemption
   - Cloud Functions for stamp management

8. **Allergen Management**
   - Allergen matrix for menu items
   - FSA (Food Standards Agency) 14 major allergens compliance
   - Version control for allergen data
   - Staff handbook with allergen procedures and training
   - Allergen data import/export

9. **Settings & Configuration**
   - User preferences
   - Location settings

### Technical Stack:
- **Frontend**: Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Backend**: Firebase (Firestore, Authentication, Cloud Functions)
- **Authentication**: Email/Password and Google Sign-In
- **Database**: Firestore (NoSQL)
- **Hosting**: Firebase Hosting (likely)

### Architecture:
- Modular ES6 architecture with separation of concerns
- Template-based rendering system
- Single Page Application (SPA) structure
- Firebase SDK v9 (compat mode)

---

## 2. Cleanup Opportunities

### 2.1 File Organization
- **Duplicate Assets**: `logo.png` and `logo-alt.png` exist in both root `assets/` and `public/assets/` directories
- **Inconsistent Structure**: Template files are in root, but some HTML files are in `public/` subdirectories
- **Unused/Dead Code**: Potential unused files in `staff-training/assets/ph` directory

### 2.2 Code Quality
- **Console Statements**: 107+ `console.log/warn/error` statements throughout codebase - should be removed or replaced with proper logging
- **Hardcoded Values**: 
  - Hardcoded password in `staff-training/register-profile.js` (line 10: `GATEKEEPER_PASSWORD = "FNB-STAFF!"`)
  - Hardcoded admin user details in `import-admin.js` (name, email, phone)
- **Magic Numbers**: Transaction grouping window (10 minutes) hardcoded without explanation
- **Firebase Config Exposed**: Firebase configuration is in client-side code (acceptable but should be documented)

### 2.3 Dependency Management
- **Missing Root package.json**: No root-level `package.json` for frontend dependencies/build tools
- **No Build System**: No webpack/vite/rollup configuration for bundling
- **No Package Lock**: Only `functions/package-lock.json` exists, no root-level lock file

### 2.4 Template Files
- All `*-template.js` files should be organized in a `templates/` directory instead of root
- Consider consolidating template functions into a single module per feature area

### 2.5 Error Handling
- Inconsistent error handling patterns
- Some functions use `alert()` for errors (poor UX)
- Missing try-catch blocks in several async functions

### 2.6 Security Concerns
- **Hardcoded Secret**: Gatekeeper password is in source code
- **Client-Side Admin Checks**: Some admin checks are done client-side only
- **No Firestore Security Rules File**: `firestore.rules` not visible in codebase (should be version controlled)

### 2.7 Code Duplication
- Multiple Firebase config files (`firebase.js`, `staff-training/firebase-config.js`, `public/loyalty/firebase-loyalty-config.js`)
- Duplicate authentication patterns in loyalty and staff-training subdirectories

### 2.8 Documentation
- **No README.md**: Missing project documentation
- **No API Documentation**: No documentation for Firestore collections structure
- **No Deployment Guide**: Missing deployment instructions

---

## 3. Improvement Opportunities

### 3.1 Performance
- **Bundle Optimization**: Implement module bundling (webpack/vite) to reduce HTTP requests
- **Code Splitting**: Lazy load modules for better initial load time
- **Caching Strategy**: Implement service worker for offline functionality
- **Image Optimization**: Compress and optimize logo assets
- **Database Queries**: Add pagination for large collections (staff, orders, stock)

### 3.2 User Experience
- **Loading States**: Add skeleton loaders or spinners consistently
- **Error Messages**: Replace `alert()` with toast notifications (partially implemented)
- **Form Validation**: Client-side validation feedback before submission
- **Responsive Design**: Improve mobile responsiveness
- **Keyboard Navigation**: Improve accessibility with keyboard shortcuts
- **Search & Filter**: Add search/filter functionality for stock, staff, orders lists

### 3.3 Code Architecture
- **State Management**: Consider implementing a state management solution (Redux/Vuex-like pattern)
- **Type Safety**: Add TypeScript or JSDoc types for better IDE support
- **Testing**: Add unit tests and integration tests
- **Error Boundaries**: Implement error boundary patterns
- **Environment Variables**: Use environment variables for configuration (different Firebase projects for dev/prod)

### 3.4 Features
- **Real-time Updates**: Add real-time listeners for stock changes across locations
- **Notifications**: Push notifications for critical stock alerts
- **Reporting**: Advanced analytics and reporting dashboard
- **Export/Import**: CSV/Excel export for stock, orders, wastage reports
- **Multi-language Support**: i18n support if expanding
- **Audit Trail**: Comprehensive audit logging for all critical operations
- **Backup/Restore**: Data backup and restore functionality

### 3.5 Security
- **Firestore Security Rules**: Review and document security rules
- **Admin Token Management**: Proper admin token checking in Cloud Functions
- **Input Sanitization**: Sanitize all user inputs
- **Rate Limiting**: Implement rate limiting on Cloud Functions
- **Secret Management**: Move hardcoded secrets to environment variables or Firebase config

### 3.6 Development Workflow
- **Linting**: Add ESLint configuration
- **Formatting**: Add Prettier for consistent code formatting
- **Pre-commit Hooks**: Husky for pre-commit linting/formatting
- **CI/CD**: GitHub Actions or similar for automated testing and deployment
- **Version Control**: Ensure `.gitignore` properly excludes sensitive files

### 3.7 Data Management
- **Database Indexing**: Ensure proper Firestore indexes are configured
- **Data Migration Scripts**: Version-controlled migration scripts for schema changes
- **Data Validation**: Schema validation for Firestore documents
- **Bulk Operations**: Improve bulk import/export functionality

### 3.8 Monitoring & Analytics
- **Error Tracking**: Integrate Sentry or similar for error tracking
- **Analytics**: Firebase Analytics for user behavior
- **Performance Monitoring**: Firebase Performance Monitoring
- **Logging**: Structured logging for Cloud Functions

### 3.9 Testing
- **Unit Tests**: Jest/Vitest for unit testing
- **Integration Tests**: Firebase Emulator Suite for integration testing
- **E2E Tests**: Playwright/Cypress for end-to-end testing
- **Test Coverage**: Aim for 70%+ code coverage

### 3.10 Mobile
- **PWA**: Convert to Progressive Web App for mobile app-like experience
- **Mobile App**: Consider React Native or Flutter for native mobile apps
- **Responsive Improvements**: Better mobile-first design

---

## 4. Requirements & Information Needed for Full Control

### 4.1 Firebase Project Access
- [ ] **Firebase Console Access**: Admin access to Firebase project
- [ ] **Firestore Security Rules**: Current security rules file (`firestore.rules`)
- [ ] **Storage Rules**: Firebase Storage security rules (if using storage)
- [ ] **Firebase Config**: Confirmation of all Firebase project settings
- [ ] **Service Account**: Service account key for server-side operations (if needed)
- [ ] **API Keys**: List of all API keys and their purposes

### 4.2 Business Logic & Requirements
- [ ] **Role Definitions**: Detailed definition of each role (admin, manager, staff) and their permissions
- [ ] **Business Rules**: All business logic rules (e.g., when is stock considered "critical"?)
- [ ] **Workflow Documentation**: Step-by-step workflows for each feature
- [ ] **Data Relationships**: Document relationships between collections
- [ ] **Validation Rules**: Business validation rules (e.g., min/max stock levels)

### 4.3 Authentication & Authorization
- [ ] **Admin List**: Complete list of admin users
- [ ] **User Management Process**: How new users are added/removed
- [ ] **Custom Claims**: Details on Firebase custom claims usage
- [ ] **Authentication Providers**: All enabled auth providers and their configuration

### 4.4 Data Structure
- [ ] **Firestore Schema**: Complete schema documentation for all collections:
  - `staff` collection structure
  - `locations/{locationId}/items` structure
  - `orders` collection structure
  - `wastage` collection structure
  - `allergenVersions` and `menuItems` structure
  - `loyaltyCards` and `loyaltyPrograms` structure
  - `completedLoyaltyCards` structure
  - `rewardsRedeemed` structure
  - `_internal/admin_config` structure
  - `users` collection (training progress)
- [ ] **Data Migrations**: History of any data migrations
- [ ] **Seed Data**: Expected seed data for initial setup

### 4.5 Configuration
- [ ] **Location Configuration**: Process for adding/removing locations
- [ ] **Allergen Configuration**: Source of truth for allergen data
- [ ] **Loyalty Program Rules**: Complete loyalty program configuration
- [ ] **Stock Categories**: Complete list of stock categories and their configurations
- [ ] **Supplier Information**: Supplier data structure and management

### 4.6 External Integrations
- [ ] **Third-party Services**: List of any external APIs or services used
- [ ] **Payment Processing**: If any payment processing is implemented
- [ ] **Email/SMS Services**: If any notifications are sent via email/SMS

### 4.7 Deployment
- [ ] **Hosting Configuration**: Current hosting setup and configuration
- [ ] **Custom Domain**: Domain configuration and SSL setup
- [ ] **Environment Setup**: Dev/staging/production environment details
- [ ] **Deployment Process**: Current deployment workflow
- [ ] **Backup Strategy**: Current backup and disaster recovery plan

### 4.8 Security & Compliance
- [ ] **Security Audit**: Recent security audit results
- [ ] **Compliance Requirements**: GDPR, data protection requirements
- [ ] **Data Retention Policy**: How long data should be retained
- [ ] **Access Logs**: Where access logs are stored

### 4.9 Testing & Quality Assurance
- [ ] **Test Accounts**: Test user accounts for each role
- [ ] **Test Data**: Sample test data for development
- [ ] **Known Issues**: List of known bugs or issues
- [ ] **Browser Support**: Required browser support matrix

### 4.10 Documentation & Knowledge Transfer
- [ ] **User Manuals**: Existing user documentation
- [ ] **Admin Guides**: Admin operation guides
- [ ] **Architecture Decisions**: Historical architecture decisions and rationale
- [ ] **Change Log**: History of major changes/features

### 4.11 Development Environment
- [ ] **Node.js Version**: Required Node.js version
- [ ] **Firebase CLI Version**: Firebase CLI version used
- [ ] **IDE/Editor Preferences**: Any specific tooling preferences
- [ ] **Git Workflow**: Git branching strategy and workflow

### 4.12 Business Context
- [ ] **Company Information**: Company details and branding guidelines
- [ ] **Future Roadmap**: Planned features and enhancements
- [ ] **Performance Requirements**: Expected load and performance requirements
- [ ] **Support Contacts**: Key stakeholders and support contacts

---

## Priority Recommendations

### High Priority (Do First)
1. Remove hardcoded secrets and passwords
2. Add Firestore security rules to version control
3. Create comprehensive README.md
4. Set up proper environment variable management
5. Implement consistent error handling
6. Add root-level package.json with build tools

### Medium Priority (Next Sprint)
1. Consolidate duplicate Firebase config files
2. Organize template files into templates directory
3. Replace console.log with proper logging
4. Add ESLint and Prettier
5. Implement proper state management
6. Add unit tests for critical functions

### Low Priority (Backlog)
1. Performance optimizations
2. Advanced features (notifications, analytics)
3. Mobile app development
4. Comprehensive test coverage

---

*Analysis Date: Generated on request*
*Codebase Version: Current state as analyzed*

