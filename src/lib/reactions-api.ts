import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  onSnapshot
} from 'firebase/firestore';
import { ref, onValue, get } from 'firebase/database';
import { getFirestoreDB, getRealtimeDB } from './firebase-config';

export interface ReactionCounts {
  [emoji: string]: number;
}

export interface ReactionsResponse {
  counts: ReactionCounts;
}

export interface UpdateReactionRequest {
  emoji: string;
  action: 'increment' | 'decrement';
  previousEmoji?: string;
}

const defaultCounts: ReactionCounts = {
  '👍': 0,
  '❤️': 0,
  '🤔': 0,
  '🔥': 0,
  '💡': 0,
};

const REACTIONS_DOC_ID = 'global-reactions';

/**
 * Update reaction count via Firestore Transactions
 * Ensures global consistency and security via Firestore rules
 */
export const updateReaction = async (
  request: UpdateReactionRequest,
  postId: string
): Promise<ReactionsResponse> => {
  try {
    const db = getFirestoreDB();
    const docRef = doc(db, 'reactions', postId);

    // Build update object for atomic update
    const updateData: Record<string, any> = {};

    if (request.action === 'increment') {
      updateData[`counts.${request.emoji}`] = increment(1);
      if (request.previousEmoji) {
        updateData[`counts.${request.previousEmoji}`] = increment(-1);
      }
    } else {
      updateData[`counts.${request.emoji}`] = increment(-1);
    }

    try {
      await updateDoc(docRef, updateData);
    } catch (e: any) {
      if (e.code === 'not-found') {
        // Initialize for this post if doc doesn't exist
        const initialCounts = { ...defaultCounts };
        if (request.action === 'increment') {
          initialCounts[request.emoji] = 1;
        }
        await setDoc(docRef, { counts: initialCounts });
      } else {
        throw e;
      }
    }
    
    // Fetch updated counts
    const updatedSnap = await getDoc(docRef);
    return { counts: updatedSnap.exists() ? updatedSnap.data().counts : defaultCounts };
  } catch (error) {
    console.error('Error updating reaction:', error);
    return { counts: defaultCounts };
  }
};

/**
 * Subscribe to real-time reaction count updates from Firestore for a specific post
 */
export const subscribeToReactions = (
  postId: string,
  callback: (counts: ReactionCounts) => void
): (() => void) => {
  try {
    const db = getFirestoreDB();
    const docRef = doc(db, 'reactions', postId);
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data.counts || defaultCounts);
      } else {
        callback(defaultCounts);
      }
    }, (error) => {
      console.error('Error subscribing to reactions:', error);
      callback(defaultCounts);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up real-time listener:', error);
    callback(defaultCounts);
    return () => {};
  }
};

/**
 * Legacy Firestore implementation (kept for backward compatibility)
 * Can be removed once fully migrated to Realtime Database + Backend
 */
export const fetchReactionsFromFirestore = async (): Promise<ReactionsResponse> => {
  try {
    const db = getFirestoreDB();
    const docRef = doc(db, 'reactions', REACTIONS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return { counts: data.counts || defaultCounts };
    } else {
      // Initialize with default counts if document doesn't exist
      await setDoc(docRef, { counts: defaultCounts });
      return { counts: defaultCounts };
    }
  } catch (error) {
    console.error('Error fetching reactions from Firestore:', error);
    // Return defaults on error
    return { counts: defaultCounts };
  }
};

/**
 * Legacy Firestore update (kept for backward compatibility)
 * Can be removed once fully migrated to Realtime Database + Backend
 */
export const updateReactionFirestore = async (
  request: UpdateReactionRequest
): Promise<ReactionsResponse> => {
  try {
    const db = getFirestoreDB();
    const docRef = doc(db, 'reactions', REACTIONS_DOC_ID);

    // Check if document exists, create it if it doesn't
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, { counts: defaultCounts });
    }

    // Build update object for atomic update
    const updateData: Record<string, ReturnType<typeof increment>> = {};

    if (request.action === 'increment') {
      // Increment the selected emoji
      updateData[`counts.${request.emoji}`] = increment(1);

      // Decrement previous emoji if switching reactions
      if (request.previousEmoji) {
        updateData[`counts.${request.previousEmoji}`] = increment(-1);
      }
    } else {
      // Decrement the emoji
      updateData[`counts.${request.emoji}`] = increment(-1);
    }

    // Perform atomic update (all changes in one operation)
    await updateDoc(docRef, updateData);

    // Fetch updated counts to return latest state
    const updatedSnap = await getDoc(docRef);
    if (updatedSnap.exists()) {
      const data = updatedSnap.data();
      const counts = data.counts || defaultCounts;
      return { counts };
    }

    return { counts: defaultCounts };
  } catch (error) {
    console.error('Error updating reaction:', error);
    // Try to fetch current state on error
    return fetchReactionsFromFirestore();
  }
};

/**
 * Get user's selected reaction (stored locally per user)
 */
export const getUserSelectedReaction = (): string | null => {
  return localStorage.getItem('userSelectedReaction');
};

/**
 * Set user's selected reaction (stored locally per user)
 */
export const setUserSelectedReaction = (emoji: string | null): void => {
  if (emoji) {
    localStorage.setItem('userSelectedReaction', emoji);
  } else {
    localStorage.removeItem('userSelectedReaction');
  }
};
