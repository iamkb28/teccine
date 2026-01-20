# Real-Time Reaction Count System

## Overview

This repository now includes a secure real-time reaction count system powered by Firebase Realtime Database with a backend API for secure write operations.

### Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Frontend  │ ◄─READ──┤  Firebase RTDB   │ ◄─WRITE─┤  Backend Server  │
│   (React)   │         │  (Real-time DB)  │         │  (Express + SDK) │
└─────────────┘         └──────────────────┘         └──────────────────┘
       │                                                      ▲
       └──────────────── UPDATE VIA API ─────────────────────┘
```

### Key Features

- ✅ **Real-time updates**: Frontend receives instant updates via Firebase listeners
- ✅ **Secure writes**: Only backend can write to Firebase (read-only for users)
- ✅ **Atomic operations**: Transactions prevent race conditions
- ✅ **Optimistic UI updates**: Instant feedback with automatic rollback on errors
- ✅ **No polling**: Real-time listeners eliminate the need for periodic polling

## Setup Instructions

### 1. Firebase Configuration

#### Enable Firebase Realtime Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Build** > **Realtime Database**
4. Click **Create Database**
5. Choose a location and start in **test mode**

#### Deploy Security Rules

Deploy the provided security rules to restrict write access:

**For Realtime Database** (from `database.rules.json`):
```json
{
  "rules": {
    "reactions": {
      ".read": true,
      ".write": false
    }
  }
}
```

**For Firestore** (from `firestore.rules`):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reactions/{docId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

**Deploy via Firebase Console:**
1. Go to **Realtime Database** > **Rules**
2. Paste the rules
3. Click **Publish**

**Or via Firebase CLI:**
```bash
firebase deploy --only database
firebase deploy --only firestore:rules
```

### 2. Backend Setup

See [`firebase-backend/README.md`](./firebase-backend/README.md) for detailed backend setup instructions.

**Quick Start:**
```bash
cd firebase-backend
npm install
cp .env.example .env
# Edit .env with your Firebase Admin SDK credentials
npm start
```

### 3. Frontend Configuration

Add the following environment variables to your frontend `.env` file:

```env
# Firebase Client SDK (read-only access)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Backend API URL
VITE_BACKEND_API_URL=http://localhost:3001
```

### 4. Initialize Data (Optional)

Initialize the database with default reaction counts:

```bash
curl -X POST http://localhost:3001/api/reactions/initialize
```

## How It Works

### Frontend Real-Time Listener

The frontend uses Firebase Realtime Database's `onValue` listener to receive instant updates:

```typescript
import { subscribeToReactions } from '@/lib/reactions-api';

// Subscribe to real-time updates
const unsubscribe = subscribeToReactions((counts) => {
  console.log('Reaction counts updated:', counts);
});

// Cleanup when done
unsubscribe();
```

### Backend Write Operations

All write operations go through the backend API which has Firebase Admin SDK privileges:

```typescript
// Frontend sends update request to backend
const response = await fetch('http://localhost:3001/api/reactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emoji: '👍',
    action: 'increment',
    previousEmoji: '❤️' // optional
  })
});
```

### Security Model

```
┌──────────────────────────────────────────────────────┐
│                  Security Layers                     │
├──────────────────────────────────────────────────────┤
│ 1. Firebase Rules: Read-only for public             │
│ 2. Backend API: Validates all write requests        │
│ 3. Admin SDK: Only backend has write privileges     │
│ 4. CORS: Restricts API access to your domain        │
└──────────────────────────────────────────────────────┘
```

## API Endpoints

### Backend API

See [`firebase-backend/README.md`](./firebase-backend/README.md) for complete API documentation.

**Main Endpoints:**
- `GET /health` - Health check
- `GET /api/reactions` - Fetch reaction counts
- `POST /api/reactions` - Update reaction counts
- `POST /api/reactions/initialize` - Initialize default counts

## Development

### Running Locally

1. **Start Backend:**
   ```bash
   cd firebase-backend
   npm install
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   npm install
   npm run dev
   ```

3. **Test Real-time Updates:**
   - Open multiple browser windows
   - Click reactions in one window
   - Observe instant updates in all windows

## Deployment

### Backend Deployment

Deploy the backend to any Node.js hosting service:

- **Railway**: See [firebase-backend/README.md](./firebase-backend/README.md#deploy-to-railway)
- **Render**: See [firebase-backend/README.md](./firebase-backend/README.md#deploy-to-render)
- **Heroku**: See [firebase-backend/README.md](./firebase-backend/README.md#deploy-to-heroku)
- **Vercel**: Serverless function deployment

### Frontend Deployment

Update environment variables in your hosting platform (Vercel, Netlify, etc.):

```env
VITE_BACKEND_API_URL=https://your-backend.railway.app
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
# ... other Firebase config
```

## Migration from Firestore

The codebase includes backward-compatible functions for Firestore:

```typescript
// New: Realtime Database + Backend API
import { subscribeToReactions, updateReaction } from '@/lib/reactions-api';

// Legacy: Direct Firestore access (deprecated)
import { 
  fetchReactionsFromFirestore, 
  updateReactionFirestore 
} from '@/lib/reactions-api';
```

To migrate:
1. Set up Firebase Realtime Database
2. Deploy security rules
3. Set up backend server
4. Update `VITE_BACKEND_API_URL` environment variable
5. The app will automatically use the new system

## Troubleshooting

### Real-time Updates Not Working

1. Check Firebase Realtime Database rules are deployed
2. Verify `VITE_FIREBASE_DATABASE_URL` is set correctly
3. Check browser console for Firebase errors
4. Ensure Firebase Realtime Database is enabled in console

### Backend API Errors

1. Verify all environment variables are set in backend `.env`
2. Check Firebase Admin SDK credentials are correct
3. Ensure service account has necessary permissions
4. Review backend logs for specific errors

### CORS Issues

1. Update `FRONTEND_URL` in backend `.env`
2. In production, set specific domain instead of `*`
3. Ensure credentials are properly configured

## Performance Considerations

- **Real-time listeners**: More efficient than polling (no repeated requests)
- **Optimistic updates**: Instant UI feedback with automatic rollback
- **Atomic transactions**: Backend uses transactions to prevent race conditions
- **Connection pooling**: Firebase SDK manages connections efficiently

## Security Best Practices

✅ **Implemented:**
- Read-only Firebase rules for public access
- Backend API with validation
- Admin SDK for secure write operations
- Environment variable protection

⚠️ **Consider Adding:**
- Rate limiting (e.g., express-rate-limit)
- User authentication if needed
- Request signing/verification
- DDoS protection

## License

MIT
