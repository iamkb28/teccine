# Quick Start: Setting Up Your Reactions API

## Step 1: Choose Your Backend Option

### Option A: Firebase Firestore (Recommended - Easiest & Free!)

Firebase is the easiest option - no backend server needed! It works directly from your frontend.

1. **Follow the Firebase setup guide**: See `FIREBASE_SETUP.md` for detailed instructions
2. **Quick steps**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database (test mode)
   - Copy your Firebase config
   - Add config to `.env` file (see `.env.example`)
3. **Install Firebase**: `npm install firebase`
4. **Done!** Your reactions will be stored globally in Firebase

✅ **No API URL needed** - Firebase works directly from the frontend!

---

### Option B: Test Locally (Express.js Backend)

1. **Install dependencies** for the example backend:
   ```bash
   npm install express cors
   ```

2. **Run the backend server**:
   ```bash
   node backend-example.js
   ```
   You should see: `Reactions API server running on http://localhost:3000`

3. **Create a `.env` file** in your project root:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Start your frontend**:
   ```bash
   npm run dev
   ```

✅ **Your API URL is:** `http://localhost:3000`

---

### Option C: Deploy Custom Backend to Production

Choose one of these hosting services:

#### 1. **Vercel** (Easiest - Free)
- Go to [vercel.com](https://vercel.com)
- Create a new project
- Upload your backend code (or use the example)
- Deploy
- **Your API URL will be:** `https://your-project.vercel.app`

#### 2. **Railway** (Free tier available)
- Go to [railway.app](https://railway.app)
- Create new project → Deploy from GitHub
- **Your API URL will be:** `https://your-project.up.railway.app`

#### 3. **Render** (Free tier available)
- Go to [render.com](https://render.com)
- Create new Web Service
- **Your API URL will be:** `https://your-project.onrender.com`

#### 4. **Firebase Functions** (Free tier)
- Use Firebase Cloud Functions
- **Your API URL will be:** `https://your-region-your-project.cloudfunctions.net/api`

---

## Step 2: Configure Your Frontend

Once you have your API URL, create a `.env` file in your project root:

```env
VITE_API_BASE_URL=https://your-api-url.com
```

**Important:** 
- Don't include `/api/reactions` in the URL - that's added automatically
- Restart your dev server after changing `.env`
- For production, set this in your hosting platform's environment variables

---

## Step 3: Test It Works

1. Open your app in the browser
2. Click on a reaction emoji
3. Check the browser console (F12) for any errors
4. The count should update immediately

---

## Troubleshooting

**"Failed to fetch reactions" error?**
- Make sure your backend is running (if local)
- Check your API URL in `.env` is correct
- Verify CORS is enabled on your backend
- Check browser console for detailed error messages

**Counts not updating?**
- Check network tab in browser DevTools
- Verify API endpoints are responding correctly
- Make sure your backend implements both GET and POST `/api/reactions`

---

## Need Help?

- Check `BACKEND_SETUP.md` for detailed backend examples
- See `backend-example.js` for a working Express.js server
- Make sure your backend returns the correct JSON format (see API spec in BACKEND_SETUP.md)
