/**
 * Firebase Backend Server for Reaction System
 * 
 * This Express.js server handles secure updates to the Firebase Realtime Database.
 * Only the backend has write permissions, while frontend clients have read-only access.
 */

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Default reaction counts - matches frontend default values
const DEFAULT_REACTION_COUNTS = {
  '👍': 42,
  '❤️': 28,
  '🤔': 15,
  '🔥': 33,
  '💡': 21,
};

// Initialize Firebase Admin SDK
let db;
try {
  // Initialize with service account credentials
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  db = admin.database();
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  console.error('Please ensure all required environment variables are set in .env file');
  process.exit(1);
}

// Enable CORS for your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json());

// Middleware for request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * GET /api/reactions - Fetch current reaction counts
 * This endpoint is optional since frontend can read directly from Firebase
 */
app.get('/api/reactions', async (req, res) => {
  try {
    const reactionsRef = db.ref('reactions/global-reactions');
    const snapshot = await reactionsRef.once('value');
    const counts = snapshot.val() || DEFAULT_REACTION_COUNTS;

    res.json({ counts });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({ error: 'Failed to fetch reactions' });
  }
});

/**
 * POST /api/reactions - Update reaction counts securely
 * Only this backend can write to Firebase
 */
app.post('/api/reactions', async (req, res) => {
  try {
    const { emoji, action, previousEmoji } = req.body;

    // Validation
    if (!emoji || !action) {
      return res.status(400).json({ error: 'Missing emoji or action' });
    }

    if (action !== 'increment' && action !== 'decrement') {
      return res.status(400).json({ error: 'Invalid action. Use "increment" or "decrement"' });
    }

    const reactionsRef = db.ref('reactions/global-reactions');

    // Use transaction to ensure atomic updates and avoid race conditions
    await reactionsRef.transaction((currentData) => {
      const counts = currentData || DEFAULT_REACTION_COUNTS;

      // Initialize emoji count if it doesn't exist
      if (typeof counts[emoji] !== 'number') {
        counts[emoji] = 0;
      }

      if (action === 'increment') {
        counts[emoji] += 1;

        // Decrease previous emoji if switching reactions
        if (previousEmoji && counts[previousEmoji]) {
          counts[previousEmoji] = Math.max(0, counts[previousEmoji] - 1);
        }
      } else if (action === 'decrement') {
        counts[emoji] = Math.max(0, counts[emoji] - 1);
      }

      return counts;
    });

    // Fetch updated counts
    const snapshot = await reactionsRef.once('value');
    const counts = snapshot.val();

    res.json({ counts });
  } catch (error) {
    console.error('Error updating reactions:', error);
    res.status(500).json({ error: 'Failed to update reactions' });
  }
});

/**
 * POST /api/reactions/initialize - Initialize reaction counts
 * Useful for first-time setup
 */
app.post('/api/reactions/initialize', async (req, res) => {
  try {
    const reactionsRef = db.ref('reactions/global-reactions');
    const snapshot = await reactionsRef.once('value');

    if (!snapshot.exists()) {
      await reactionsRef.set(DEFAULT_REACTION_COUNTS);
      res.json({ 
        message: 'Reactions initialized successfully',
        counts: DEFAULT_REACTION_COUNTS 
      });
    } else {
      res.json({ 
        message: 'Reactions already initialized',
        counts: snapshot.val() 
      });
    }
  } catch (error) {
    console.error('Error initializing reactions:', error);
    res.status(500).json({ error: 'Failed to initialize reactions' });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebase: db ? 'connected' : 'disconnected',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n🚀 Firebase Backend Server running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /health - Health check`);
  console.log(`  GET  /api/reactions - Fetch reaction counts`);
  console.log(`  POST /api/reactions - Update reaction counts`);
  console.log(`  POST /api/reactions/initialize - Initialize default counts\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
