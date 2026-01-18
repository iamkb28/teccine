import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment
} from 'firebase/firestore';
import { getFirestoreDB } from './firebase-config';

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
  '👍': 42,
  '❤️': 28,
  '🤔': 15,
  '🔥': 33,
  '💡': 21,
};

const REACTIONS_DOC_ID = 'global-reactions';

/**
 * Fetch current reaction counts from Firebase Firestore
 */
export const fetchReactions = async (): Promise<ReactionsResponse> => {
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
    console.error('Error fetching reactions:', error);
    // Return defaults on error
    return { counts: defaultCounts };
  }
};

/**
 * Update reaction count in Firebase Firestore
 */
export const updateReaction = async (
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
    const updateData: Record<string, any> = {};

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
    return fetchReactions();
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
