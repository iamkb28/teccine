# Firebase Backend for Reaction System

This backend server provides secure write access to the Firebase Realtime Database for the reaction count system. Frontend clients have read-only access while this backend handles all write operations securely using Firebase Admin SDK.

## Features

- ✅ Secure write access to Firebase Realtime Database using Admin SDK
- ✅ Read-only access for frontend clients
- ✅ Atomic transaction updates to prevent race conditions
- ✅ CORS support for frontend integration
- ✅ Health check endpoint for monitoring
- ✅ Graceful error handling and logging

## Prerequisites

- Node.js 18.0.0 or higher
- Firebase project with Realtime Database enabled
- Firebase Admin SDK service account credentials

## Setup Instructions

### 1. Install Dependencies

```bash
cd firebase-backend
npm install
```

### 2. Configure Firebase Admin SDK

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### 3. Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open the downloaded service account JSON file and copy the values to `.env`:
   ```
   FIREBASE_PROJECT_ID=<project_id from JSON>
   FIREBASE_PRIVATE_KEY_ID=<private_key_id from JSON>
   FIREBASE_PRIVATE_KEY=<private_key from JSON - keep the quotes and newlines>
   FIREBASE_CLIENT_EMAIL=<client_email from JSON>
   FIREBASE_CLIENT_ID=<client_id from JSON>
   FIREBASE_CLIENT_CERT_URL=<client_x509_cert_url from JSON>
   FIREBASE_DATABASE_URL=<your database URL>
   ```

3. Set your frontend URL:
   ```
   FRONTEND_URL=http://localhost:5173
   ```

### 4. Configure Firebase Realtime Database Rules

Deploy the following security rules to your Firebase Realtime Database:

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

To deploy:
1. Go to Firebase Console > Realtime Database > Rules
2. Paste the rules above
3. Click **Publish**

### 5. Run the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will run on `http://localhost:3001` by default.

### 6. Initialize Reaction Counts (Optional)

Initialize the database with default reaction counts:

```bash
curl -X POST http://localhost:3001/api/reactions/initialize
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status and Firebase connection state.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:00:00.000Z",
  "firebase": "connected"
}
```

### Get Reactions
```
GET /api/reactions
```
Fetch current reaction counts. (Frontend can also read directly from Firebase)

**Response:**
```json
{
  "counts": {
    "👍": 42,
    "❤️": 28,
    "🤔": 15,
    "🔥": 33,
    "💡": 21
  }
}
```

### Update Reactions
```
POST /api/reactions
```
Update reaction counts securely.

**Request Body:**
```json
{
  "emoji": "👍",
  "action": "increment",
  "previousEmoji": "❤️"
}
```

**Response:**
```json
{
  "counts": {
    "👍": 43,
    "❤️": 27,
    "🤔": 15,
    "🔥": 33,
    "💡": 21
  }
}
```

### Initialize Reactions
```
POST /api/reactions/initialize
```
Initialize database with default reaction counts.

**Response:**
```json
{
  "message": "Reactions initialized successfully",
  "counts": { ... }
}
```

## Deployment

### Deploy to Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and deploy:
   ```bash
   railway login
   railway init
   railway up
   ```

3. Set environment variables in Railway dashboard

### Deploy to Render

1. Create a new Web Service on [Render](https://render.com/)
2. Connect your GitHub repository
3. Set build command: `cd firebase-backend && npm install`
4. Set start command: `cd firebase-backend && npm start`
5. Add environment variables in Render dashboard

### Deploy to Vercel (Serverless)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard

### Deploy to Heroku

1. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

2. Set environment variables:
   ```bash
   heroku config:set FIREBASE_PROJECT_ID=xxx
   heroku config:set FIREBASE_PRIVATE_KEY="xxx"
   # ... set all other variables
   ```

3. Deploy:
   ```bash
   git subtree push --prefix firebase-backend heroku main
   ```

## Security Considerations

- ✅ Backend uses Firebase Admin SDK with full privileges
- ✅ Frontend has read-only access via Firebase security rules
- ✅ All writes go through backend API with validation
- ✅ CORS configured to allow only your frontend domain
- ✅ Environment variables protect sensitive credentials
- ⚠️  Add rate limiting for production (e.g., using express-rate-limit)
- ⚠️  Consider adding authentication if needed

## Troubleshooting

### Firebase Admin SDK Initialization Failed
- Verify all environment variables are set correctly
- Check that private key includes `\n` for newlines
- Ensure service account has necessary permissions

### CORS Errors
- Update `FRONTEND_URL` in `.env` to match your frontend domain
- In production, set specific domain instead of `*`

### Connection Issues
- Verify `FIREBASE_DATABASE_URL` is correct
- Check Firebase Realtime Database is enabled in console
- Ensure network/firewall allows Firebase connections

## Monitoring and Logging

The server logs all requests and errors to console. For production:

1. Use a logging service (e.g., LogDNA, Papertrail)
2. Set up error tracking (e.g., Sentry)
3. Monitor health endpoint for uptime

## License

MIT
