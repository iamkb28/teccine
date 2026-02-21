import { useState } from 'react';
import { 
  getUserSelectedReaction, 
  setUserSelectedReaction,
} from '@/lib/reactions-api';

export const useLocalReaction = (postId: string) => {
  const [selected, setSelected] = useState<string | null>(
    () => getUserSelectedReaction(postId)
  );

  const updateReaction = (emoji: string) => {
    const next = selected === emoji ? null : emoji;
    setSelected(next);
    setUserSelectedReaction(postId, next);
  };

  return { selected, updateReaction };
};
