# Firebase Setup Guide for Global Reactions

This guide will help you set up Firebase Firestore to store reaction counts globally across all users.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard:
   - Enter project name (e.g., "teccine-reactions")
   - Enable/disable Google Analytics (optional)
   - Click **"Create project"**

## Step 2: Enable Firestore Database

### Option A: Production Mode (Recommended for Real Apps)

1. In your Firebase project, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"**
   - This sets up secure default rules
   - You'll need to configure security rules (see Step 7)
4. Select a location (choose closest to your users)
5. Click **"Enable"**

### Option B: Test Mode (For Development Only)

1. In your Firebase project, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - ⚠️ **Warning:** This allows open read/write access for 30 days
   - Only use for testing, not production!
4. Select a location (choose closest to your users)
5. Click **"Enable"**

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register your app (give it a nickname like "Teccine Web")
6. Copy the **firebaseConfig** object

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4: Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Important:** 
- Replace the values with your actual Firebase config values
- Never commit `.env` to git (it's already in `.gitignore`)
- Restart your dev server after adding environment variables

## Step 5: Install Firebase Dependencies

Run this command in your project:

```bash
npm install firebase
```

## Step 6: Initialize Firestore Data (Optional)

The app will automatically create the initial document with default counts when first accessed. However, you can manually initialize it:

1. Go to Firestore Database in Firebase Console
2. Click **"Start collection"**
3. Collection ID: `reactions`
4. Document ID: `global-reactions`
5. Add a field:
   - Field: `counts`
   - Type: `map`
   - Value:
     ```json
     {
       "👍": 42,
       "❤️": 28,
       "🤔": 15,
       "🔥": 33,
       "💡": 21
     }
     ```
6. Click **"Save"**

## Step 7: Set Up Security Rules

**If you started in Production Mode**, you need to configure rules before your app can access Firestore.

**If you started in Test Mode**, you should update these rules before going to production.

1. Go to **Firestore Database** → **Rules** tab
2. Choose one of the rule sets below based on your needs:

### Option 1: Public Read/Write (Simplest - Good for Reactions)

This allows anyone to read and write reactions. Perfect for a public reactions feature:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reactions/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**When to use:** Public apps where anyone can react (like your current setup)

### Option 2: Public Read, Authenticated Write (More Secure)

Only authenticated users can update reactions, but anyone can read:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reactions/{document=**} {
      allow read: if true;
      allow write: if request.auth != null; // Only logged-in users can write
    }
  }
}
```

**When to use:** If you add user authentication later

### Option 3: Rate-Limited Public Access (Recommended for Production)

Limits how often users can write to prevent abuse:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reactions/{document=**} {
      allow read: if true;
      allow write: if request.time > resource.data.lastWrite + duration.value(5, 's');
    }
  }
}
```

**Note:** This requires storing a `lastWrite` timestamp field. More complex but safer.

### Option 4: Cloud Function Validation (Most Secure)

Use Cloud Functions to validate and update reactions, then set rules to deny direct writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reactions/{document=**} {
      allow read: if true;
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

**When to use:** For maximum security and validation

3. Click **"Publish"** to save your rules

⚠️ **Important Notes:**
- If you're in Production Mode, you MUST set rules before your app will work
- Test Mode automatically allows all access for 30 days
- Always test your rules using the Rules Playground in Firebase Console
- For production apps, consider Option 2 or 3 for better security

## Step 8: Test Your Setup

1. Start your dev server: `npm run dev`
2. Open your app in the browser
3. Click on a reaction emoji
4. Check Firebase Console → Firestore Database
5. You should see the `reactions` collection with `global-reactions` document
6. The counts should update in real-time!

## Troubleshooting

### "Firebase configuration is missing" error
- Make sure your `.env` file exists and has all Firebase variables
- Check that variable names start with `VITE_`
- Restart your dev server after changing `.env`

### "Permission denied" error
- **If you're in Production Mode:** You MUST set up security rules first (see Step 7)
- **If you're in Test Mode:** Rules should allow: `allow read, write: if true;`
- Check your Firestore security rules in Firebase Console → Rules tab
- Make sure you clicked "Publish" after updating rules
- Test your rules using the Rules Playground in Firebase Console

### Counts not updating
- Check browser console for errors
- Verify Firestore rules allow writes
- Check network tab to see if requests are being made
- Verify your Firebase project ID is correct

### Firebase not initialized
- Make sure you've installed Firebase: `npm install firebase`
- Check that all environment variables are set correctly
- Verify your Firebase project is active in Firebase Console

## Firebase Free Tier Limits

Firebase offers a generous free tier:
- **50K reads/day**
- **20K writes/day**
- **20K deletes/day**

For most apps, this is more than enough! If you exceed limits, Firebase will notify you.

## Next Steps

- ✅ Your reactions are now stored globally in Firebase
- ✅ All users see the same counts
- ✅ Counts persist even if cache is cleared
- ✅ Real-time updates across all users

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)
- Check `src/lib/firebase-config.ts` for configuration
- Check `src/lib/reactions-api.ts` for Firestore operations
