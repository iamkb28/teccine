# Teccine - Daily Tech Health

## Overview

Teccine is a React-based Progressive Web App (PWA) that delivers daily tech news updates in a simple, digestible format. The app features a single-page layout displaying one tech update per day with explanations of what it means and why it matters. Key features include emoji reactions with global counts, daily visit streaks, countdown timers to the next post, feedback collection, and push notification support for daily reminders.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library (Radix UI primitives)
- **Animations**: Framer Motion for smooth transitions and micro-interactions
- **State Management**: React Query (@tanstack/react-query) for server state, React hooks for local state
- **Routing**: React Router DOM with simple two-page structure (Index and NotFound)
- **PWA**: vite-plugin-pwa for service worker generation, manifest, and installability

### Data Layer
- **Posts**: Static data stored in `src/data/posts.ts` with TypeScript interfaces
- **Reactions**: Global reaction counts synced via Firebase (Firestore and Realtime Database)
- **User Preferences**: Local storage for streak tracking, selected reactions, and notification dismissal

### Reactions System Architecture
The emoji reactions feature uses a hybrid approach:
- **Read Path**: Firebase Realtime Database with real-time listeners for instant updates across all users
- **Write Path**: Backend API (Express.js) with Firebase Admin SDK for secure write operations
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on errors
- **Fallback**: Local storage and default counts when Firebase is unavailable

### Component Structure
- **Pages**: `src/pages/` - Route-level components (Index, NotFound)
- **Components**: `src/components/` - Feature components (Header, PostCard, EmojiReactions, etc.)
- **UI Components**: `src/components/ui/` - Reusable shadcn/ui primitives
- **Hooks**: `src/hooks/` - Custom React hooks (use-global-reactions, use-mobile, use-toast)
- **Lib**: `src/lib/` - Utility functions and service modules (firebase-config, notifications, reactions-api)

### Key Design Patterns
- **Custom Hooks**: Business logic encapsulated in hooks (useGlobalReactions, useIsMobile)
- **Real-time Subscriptions**: Firebase onValue listeners for live reaction updates
- **Progressive Enhancement**: App works offline with cached data, enhanced when online

## External Dependencies

### Firebase Services
- **Firestore**: Document database for reaction count persistence
- **Realtime Database**: Real-time sync for reaction counts across clients
- **Configuration**: Environment variables prefixed with `VITE_FIREBASE_*`
- **Security Rules**: Read-only for clients, write access via backend only (`database.rules.json`)

### Backend API (Optional)
- **Location**: `firebase-backend/` directory
- **Purpose**: Secure write operations to Firebase using Admin SDK
- **Stack**: Express.js with cors and firebase-admin packages
- **Deployment**: Configurable via `VITE_BACKEND_API_URL` environment variable

### Third-Party Libraries
- **UI**: Radix UI primitives, Lucide icons, class-variance-authority
- **Date Handling**: date-fns for date manipulation
- **Forms**: react-hook-form with @hookform/resolvers
- **Carousel**: embla-carousel-react
- **Drawer**: vaul for mobile drawer components
- **Testing**: Vitest with @testing-library/jest-dom

### Environment Variables Required
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_DATABASE_URL
VITE_BACKEND_API_URL (optional, for custom backend)
```