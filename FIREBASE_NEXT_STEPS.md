# Firebase Database Setup - Next Steps Checklist

You've created your Firebase database! Here's what you need to do next:

## ✅ What You've Done
- [x] Created Firebase project
- [x] Created Firestore database

## 📋 What You Need to Do Next

### Step 1: Get Your Firebase Configuration (Required)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon ⚙️** next to "Project Overview"
4. Select **"Project settings"**
5. Scroll down to **"Your apps"** section
6. Click the **Web icon** (`</>`) to add a web app
   - If you already have a web app, click on it
7. Copy the **firebaseConfig** values

You'll see something like this:
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

### Step 2: Set Up Environment Variables (Required)

1. Create a `.env` file in your project root (same folder as `package.json`)
2. Add these lines with YOUR Firebase values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Important:**
- Replace all the values with YOUR actual Firebase config values
- Don't include quotes around the values
- Make sure there are no spaces around the `=` sign

### Step 3: Set Up Security Rules (Required if Production Mode)

**If you created the database in Production Mode:**

1. Go to Firebase Console → **Firestore Database** → **Rules** tab
2. Replace the rules with:

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

3. Click **"Publish"** to save

**If you're in Test Mode:** You can skip this for now, but update rules before going to production.

### Step 4: Install Firebase Package (Required)

Run this command in your project:

```bash
npm install firebase
```

### Step 5: Test It Works

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open your app in the browser

3. Click on a reaction emoji

4. Check Firebase Console → Firestore Database:
   - You should see a `reactions` collection
   - Inside it, a `global-reactions` document
   - The document should have a `counts` field with emoji counts

5. Click different reactions - counts should update!

## 🎯 Quick Checklist

- [ ] Got Firebase config from Project Settings
- [ ] Created `.env` file with Firebase config
- [ ] Set up security rules (if production mode)
- [ ] Ran `npm install firebase`
- [ ] Started dev server (`npm run dev`)
- [ ] Tested clicking reactions
- [ ] Verified data appears in Firestore Database

## 🐛 Common Issues

### "Firebase configuration is missing" error
- ✅ Check `.env` file exists in project root
- ✅ Verify all 6 Firebase variables are set
- ✅ Make sure variable names start with `VITE_`
- ✅ Restart your dev server after creating `.env`

### "Permission denied" error
- ✅ If Production Mode: Set up security rules (Step 3)
- ✅ Make sure you clicked "Publish" after updating rules
- ✅ Check Rules tab in Firebase Console

### Counts not updating
- ✅ Check browser console (F12) for errors
- ✅ Verify security rules allow writes
- ✅ Make sure Firebase config is correct in `.env`

## 📝 What the Database Needs

From the database side, you need:

1. **Collection:** `reactions` (will be created automatically)
2. **Document:** `global-reactions` (will be created automatically)
3. **Field:** `counts` (map/object with emoji counts)

**Good news:** The app will create all of this automatically when you first click a reaction! You don't need to manually create anything in the database.

## ✨ You're Done When...

- ✅ App loads without errors
- ✅ You can click reactions
- ✅ Counts update when clicking
- ✅ Data appears in Firestore Database
- ✅ Counts persist after page refresh

That's it! Your database is ready. Just configure your app with the Firebase credentials and you're good to go! 🚀
