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
