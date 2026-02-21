export interface ReactionCounts {
  [emoji: string]: number;
}

export interface ReactionsResponse {
  counts: ReactionCounts;
  user_reaction?: string;
}

const defaultCounts: ReactionCounts = {
  '👍': 0,
  '❤️': 0,
  '🤔': 0,
  '🔥': 0,
  '💡': 0,
};

/**
 * Get or create a stable user ID stored in localStorage
 */
export const getUserId = (): string => {
  let userId = localStorage.getItem('teccine_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('teccine_user_id', userId);
  }
  return userId;
};

/**
 * Fetch current reaction counts from the FastAPI backend
 */
export const fetchReactions = async (postId: string): Promise<ReactionsResponse> => {
  try {
    const res = await fetch(`/api/reactions/${postId}`);
    if (!res.ok) throw new Error('Failed to fetch reactions');
    return await res.json();
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return { counts: defaultCounts };
  }
};

/**
 * Send a reaction update to the FastAPI backend.
 * Passing an empty emoji removes the user's current reaction.
 * Passing the same emoji the user already selected removes it (toggle off).
 * Passing a different emoji switches to it.
 */
export const updateReaction = async (
  emoji: string,
  postId: string
): Promise<ReactionsResponse> => {
  try {
    const res = await fetch(`/api/reactions/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: getUserId(), emoji }),
    });
    if (!res.ok) throw new Error('Failed to update reaction');
    return await res.json();
  } catch (error) {
    console.error('Error updating reaction:', error);
    return { counts: defaultCounts };
  }
};

/**
 * Get user's selected reaction (stored locally per user per post)
 */
export const getUserSelectedReaction = (postId: string): string | null => {
  return localStorage.getItem(`userSelectedReaction_${postId}`) || null;
};

/**
 * Set user's selected reaction (stored locally per user per post)
 */
export const setUserSelectedReaction = (postId: string, emoji: string | null): void => {
  if (emoji) {
    localStorage.setItem(`userSelectedReaction_${postId}`, emoji);
  } else {
    localStorage.removeItem(`userSelectedReaction_${postId}`);
  }
};
