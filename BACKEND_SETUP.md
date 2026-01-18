# Backend API Setup for Global Reactions

The reactions system now uses a backend API to store counts globally across all users. This ensures that:
- ✅ Reaction counts persist even if users clear their cache
- ✅ All users see the same global counts
- ✅ Counts are consistent across all devices and browsers

## Quick Setup Options

### Option 1: Use a Serverless Function (Recommended for Quick Setup)

#### Vercel Serverless Function

Create `api/reactions.js` in your project:

```javascript
// api/reactions.js
export default async function handler(req, res) {
  // Use Vercel KV, Upstash, or any database
  // This is just an example structure
  
  if (req.method === 'GET') {
    // Fetch from database
    const counts = await getReactionCounts();
    return res.json({ counts });
  }
  
  if (req.method === 'POST') {
    const { emoji, action, previousEmoji } = req.body;
    // Update in database
    await updateReactionCounts(emoji, action, previousEmoji);
    const counts = await getReactionCounts();
    return res.json({ counts });
  }
}
```

#### Netlify Functions

Create `netlify/functions/reactions.js`:

```javascript
exports.handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    // Fetch from database
    return {
      statusCode: 200,
      body: JSON.stringify({ counts: await getReactionCounts() })
    };
  }
  
  if (event.httpMethod === 'POST') {
    const { emoji, action, previousEmoji } = JSON.parse(event.body);
    // Update in database
    await updateReactionCounts(emoji, action, previousEmoji);
    return {
      statusCode: 200,
      body: JSON.stringify({ counts: await getReactionCounts() })
    };
  }
};
```

### Option 2: Use a Database Service

#### Firebase Firestore Example

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, increment } from 'firebase/firestore';

const db = getFirestore();

export async function getReactions() {
  const docRef = doc(db, 'reactions', 'global');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().counts : defaultCounts;
}

export async function updateReaction(emoji, action, previousEmoji) {
  const docRef = doc(db, 'reactions', 'global');
  
  if (action === 'increment') {
    await updateDoc(docRef, {
      [`counts.${emoji}`]: increment(1),
      ...(previousEmoji && { [`counts.${previousEmoji}`]: increment(-1) })
    });
  } else {
    await updateDoc(docRef, {
      [`counts.${emoji}`]: increment(-1)
    });
  }
}
```

#### Supabase Example

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function getReactions() {
  const { data } = await supabase
    .from('reactions')
    .select('counts')
    .eq('id', 'global')
    .single();
  return data?.counts || defaultCounts;
}

export async function updateReaction(emoji, action, previousEmoji) {
  // Use Supabase RPC or update query
  await supabase.rpc('update_reaction', {
    emoji,
    action,
    previous_emoji: previousEmoji
  });
}
```

### Option 3: Simple Express Server (See backend-example.js)

1. Copy `backend-example.js` to your backend project
2. Install dependencies: `npm install express cors`
3. Run: `node backend-example.js`
4. Set `VITE_API_BASE_URL=http://localhost:3000` in your `.env` file

**Note:** The example uses in-memory storage. For production, connect it to a database.

## Environment Configuration

1. Copy `.env.example` to `.env`
2. Set your API URL:
   ```
   VITE_API_BASE_URL=https://your-api-domain.com
   ```

## API Endpoints Required

Your backend needs to implement these endpoints:

### GET `/api/reactions`
Returns current reaction counts.

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

### POST `/api/reactions`
Updates reaction counts.

**Request Body:**
```json
{
  "emoji": "👍",
  "action": "increment",
  "previousEmoji": "❤️"  // optional, only when switching reactions
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

## Testing Without Backend

If you want to test the frontend without a backend, you can temporarily modify `src/lib/reactions-api.ts` to use mock data:

```typescript
export const fetchReactions = async (): Promise<ReactionsResponse> => {
  // Mock implementation for testing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ counts: defaultCounts });
    }, 500);
  });
};
```

## Production Considerations

- **Database**: Use a proper database (PostgreSQL, MongoDB, etc.)
- **Rate Limiting**: Prevent abuse with rate limiting
- **CORS**: Configure CORS properly for your domain
- **Authentication**: Consider adding auth if needed
- **Caching**: Use Redis or similar for high-traffic scenarios
- **Error Handling**: Implement proper error handling and logging
