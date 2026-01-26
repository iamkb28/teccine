import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchReactionsFromFirestore,
  updateReaction, 
  getUserSelectedReaction, 
  setUserSelectedReaction,
  subscribeToReactions 
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
  
  const [selected, setSelected] = useState<string | null>(() => {
    const stored = getUserSelectedReaction();
    // Check if stored reaction is for current post
    const storedPostId = localStorage.getItem('userSelectedReactionPostId');
    if (storedPostId === postId) return stored;
    return null;
  });

  // Sync selected state with localStorage
  useEffect(() => {
    const storedPostId = localStorage.getItem('userSelectedReactionPostId');
    if (storedPostId === postId) {
      const stored = getUserSelectedReaction();
      setSelected(stored);
    } else {
      setSelected(null);
      setUserSelectedReaction(null);
    }
  }, [postId]);

  // Set up real-time listener for Firestore
  useEffect(() => {
    const unsubscribe = subscribeToReactions(postId, (counts) => {
      // Update the query cache with real-time data
      queryClient.setQueryData(['reactions', postId], { counts });
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [queryClient, postId]);

  // Fetch reactions from Firebase (initial load)
  const { data, isLoading, error } = useQuery({
    queryKey: ['reactions', postId],
    queryFn: () => fetchReactionsFromFirestore(), // This would need to be updated to accept postId if you want to fetch specific post counts initially
    staleTime: Infinity, // Data is always fresh via real-time listener
    retry: 2,
    // Fallback to defaults if API fails
    placeholderData: { counts: defaultCounts },
  });

  // Mutation to update reactions
  const mutation = useMutation({
    mutationFn: (vars: any) => updateReaction(vars, postId),
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reactions', postId] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<{ counts: Record<string, number> }>(['reactions', postId]);

      // Optimistically update
      if (previousData) {
        const newCounts = { ...previousData.counts };
        
        if (variables.action === 'increment') {
          newCounts[variables.emoji] = (newCounts[variables.emoji] || 0) + 1;
          if (variables.previousEmoji) {
            newCounts[variables.previousEmoji] = Math.max(0, (newCounts[variables.previousEmoji] || 0) - 1);
          }
        } else {
          newCounts[variables.emoji] = Math.max(0, (newCounts[variables.emoji] || 0) - 1);
        }

        queryClient.setQueryData(['reactions', postId], { counts: newCounts });
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['reactions', postId], context.previousData);
      }
    },
  });

  const handleUpdateReaction = (emoji: string) => {
    if (mutation.isPending) return;

    if (selected === emoji) {
      const currentSelected = selected;
      setSelected(null);
      setUserSelectedReaction(null);
      localStorage.removeItem('userSelectedReactionPostId');
      mutation.mutate({ emoji, action: 'decrement' }, {
        onError: () => {
          setSelected(currentSelected);
          setUserSelectedReaction(currentSelected);
          localStorage.setItem('userSelectedReactionPostId', postId);
        }
      });
    } else {
      const previousEmoji = selected || undefined;
      const newSelected = emoji;
      setSelected(newSelected);
      setUserSelectedReaction(newSelected);
      localStorage.setItem('userSelectedReactionPostId', postId);
      mutation.mutate({ emoji, action: 'increment', previousEmoji }, {
        onError: () => {
          setSelected(previousEmoji || null);
          setUserSelectedReaction(previousEmoji || null);
          if (!previousEmoji) localStorage.removeItem('userSelectedReactionPostId');
        }
      });
    }
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

  return {
    counts: data?.counts || defaultCounts,
    selected,
    updateReaction: handleUpdateReaction,
    isLoading,
    isUpdating: mutation.isPending,
    error,
  };
};
