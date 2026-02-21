import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchReactions,
  updateReaction, 
  getUserSelectedReaction, 
  setUserSelectedReaction,
} from '@/lib/reactions-api';
import { getTodayPost } from '@/data/posts';

const defaultCounts: Record<string, number> = {
  '👍': 0,
  '❤️': 0,
  '🤔': 0,
  '🔥': 0,
  '💡': 0,
};

export const useGlobalReactions = () => {
  const queryClient = useQueryClient();
  const todayPost = getTodayPost();
  const postId = todayPost?.id || 'default';
  
  const [selected, setSelected] = useState<string | null>(
    () => getUserSelectedReaction(postId)
  );

  // Sync selected state with localStorage when postId changes
  useEffect(() => {
    setSelected(getUserSelectedReaction(postId));
  }, [postId]);

  // Fetch reactions from FastAPI backend, polling every 5 seconds
  const { data, isLoading, error } = useQuery({
    queryKey: ['reactions', postId],
    queryFn: () => fetchReactions(postId),
    refetchInterval: 5000,
    retry: 2,
    placeholderData: { counts: defaultCounts },
  });

  // Mutation to update reactions
  const mutation = useMutation({
    mutationFn: (emoji: string) => updateReaction(emoji, postId),
    onMutate: async (emoji: string) => {
      await queryClient.cancelQueries({ queryKey: ['reactions', postId] });

      const previousData = queryClient.getQueryData<{ counts: Record<string, number> }>(['reactions', postId]);

      // Optimistically update counts
      if (previousData) {
        const newCounts = { ...previousData.counts };
        const current = selected;

        if (current === emoji) {
          // Toggle off
          newCounts[emoji] = Math.max(0, (newCounts[emoji] || 0) - 1);
        } else {
          newCounts[emoji] = (newCounts[emoji] || 0) + 1;
          if (current) {
            newCounts[current] = Math.max(0, (newCounts[current] || 0) - 1);
          }
        }

        queryClient.setQueryData(['reactions', postId], { counts: newCounts });
      }

      return { previousData };
    },
    onSuccess: (response) => {
      // Update local state from backend response
      const newReaction = response.user_reaction || null;
      setSelected(newReaction);
      setUserSelectedReaction(postId, newReaction);
      // Sync counts from server
      if (response.counts) {
        queryClient.setQueryData(['reactions', postId], { counts: response.counts });
      }
    },
    onError: (_err, _emoji, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['reactions', postId], context.previousData);
      }
    },
  });

  const handleUpdateReaction = (emoji: string) => {
    if (mutation.isPending) return;
    mutation.mutate(emoji);
  };

  return {
    counts: data?.counts || defaultCounts,
    selected,
    updateReaction: handleUpdateReaction,
    isLoading,
    isUpdating: mutation.isPending,
    error,
  };
};
