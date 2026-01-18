/**
 * Example Backend API for Global Reactions
 * 
 * This is a simple Express.js example. You can use any backend framework.
 * 
 * To use this:
 * 1. Install dependencies: npm install express cors
 * 2. Run: node backend-example.js
 * 3. Set VITE_API_BASE_URL=http://localhost:3000 in your .env file
 * 
 * For production, you'll want to:
 * - Use a proper database (PostgreSQL, MongoDB, etc.)
 * - Add authentication/rate limiting
 * - Use environment variables for configuration
 * - Deploy to a hosting service (Vercel, Railway, Render, etc.)
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // In production, specify your domain
  credentials: true
}));
app.use(express.json());

// In-memory storage (use a database in production!)
let reactionCounts = {
  '👍': 42,
  '❤️': 28,
  '🤔': 15,
  '🔥': 33,
  '💡': 21,
};

// GET /api/reactions - Fetch current reaction counts
app.get('/api/reactions', (req, res) => {
  res.json({ counts: reactionCounts });
});

// POST /api/reactions - Update reaction counts
app.post('/api/reactions', (req, res) => {
  const { emoji, action, previousEmoji } = req.body;

  if (!emoji || !action) {
    return res.status(400).json({ error: 'Missing emoji or action' });
  }

  // Initialize emoji if it doesn't exist
  if (!reactionCounts[emoji]) {
    reactionCounts[emoji] = 0;
  }

  if (action === 'increment') {
    reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
    
    // Decrease previous emoji if switching reactions
    if (previousEmoji && reactionCounts[previousEmoji]) {
      reactionCounts[previousEmoji] = Math.max(0, reactionCounts[previousEmoji] - 1);
    }
  } else if (action === 'decrement') {
    reactionCounts[emoji] = Math.max(0, (reactionCounts[emoji] || 0) - 1);
  } else {
    return res.status(400).json({ error: 'Invalid action. Use "increment" or "decrement"' });
  }

  res.json({ counts: reactionCounts });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Reactions API server running on http://localhost:${PORT}`);
  console.log(`GET  /api/reactions - Fetch reaction counts`);
  console.log(`POST /api/reactions - Update reaction counts`);
});
