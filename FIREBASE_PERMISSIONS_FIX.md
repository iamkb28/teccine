# Fix: Firebase "Missing or insufficient permissions" Error

## Quick Fix

This error means your Firestore security rules are blocking access. Here's how to fix it:

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **"Firestore Database"** in the left sidebar
4. Click the **"Rules"** tab

### Step 2: Update Security Rules

Replace your current rules with this:

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

### Step 3: Publish Rules

1. Click **"Publish"** button (top right)
2. Wait a few seconds for rules to propagate

### Step 4: Test Again

1. Refresh your app
2. Try clicking a reaction again
3. The error should be gone!

## Why This Happens

- **Production Mode**: If you created the database in Production Mode, it blocks all access by default
- **Test Mode Expired**: If you were in Test Mode, it expires after 30 days
- **Rules Not Published**: Rules need to be published to take effect

## Verify Rules Are Working

1. In Firebase Console → Firestore Database → Rules tab
2. Click **"Rules Playground"** (top right)
3. Test with:
   - Location: `reactions/global-reactions`
   - Operation: `get` (for read)
   - Click "Run"
   - Should show ✅ "Simulated read allowed"
4. Test with:
   - Location: `reactions/global-reactions`
   - Operation: `update` (for write)
   - Click "Run"
   - Should show ✅ "Simulated write allowed"

## Alternative: More Secure Rules (Optional)

If you want more security later, you can use:

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

But for now, the simple `allow read, write: if true;` rule will work perfectly for reactions.

## Still Having Issues?

1. **Check you clicked "Publish"** - Rules don't apply until published
2. **Wait a few seconds** - Rules can take 10-30 seconds to propagate
3. **Refresh your app** - Clear cache and reload
4. **Check browser console** - Look for specific error messages
5. **Verify Firebase config** - Make sure your `.env` file has correct values
