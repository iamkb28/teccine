import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReactions, updateReaction, getUserSelectedReaction, setUserSelectedReaction } from '@/lib/reactions-api';

const defaultCounts: Record<string, number> = {
  '👍': 0,
  '❤️': 0,
  '🤔': 0,
  '🔥': 0,
  '💡': 0,
};

export const useGlobalReactions = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(() => getUserSelectedReaction());

  // Sync selected state with localStorage
  useEffect(() => {
    const stored = getUserSelectedReaction();
    setSelected(stored);
  }, []);

  // Fetch reactions from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['reactions'],
    queryFn: fetchReactions,
    refetchInterval: 5000, // Refetch every 5 seconds to get latest counts
    staleTime: 2000, // Consider data stale after 2 seconds
    retry: 2,
    // Fallback to defaults if API fails
    placeholderData: { counts: defaultCounts },
  });

  // Mutation to update reactions
  const mutation = useMutation({
    mutationFn: updateReaction,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reactions'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<{ counts: Record<string, number> }>(['reactions']);

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

        queryClient.setQueryData(['reactions'], { counts: newCounts });
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['reactions'], context.previousData);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['reactions'] });
    },
  });

  const handleUpdateReaction = (emoji: string) => {
    // Prevent multiple rapid clicks
    if (mutation.isPending) {
      return;
    }

    if (selected === emoji) {
      // Deselecting - decrease count
      const currentSelected = selected;
      setSelected(null);
      setUserSelectedReaction(null);
      mutation.mutate({
        emoji,
        action: 'decrement',
      }, {
        onError: () => {
          // Rollback UI state on error
          setSelected(currentSelected);
          setUserSelectedReaction(currentSelected);
        }
      });
    } else {
      // Selecting new reaction
      const previousEmoji = selected || undefined;
      const newSelected = emoji;
      setSelected(newSelected);
      setUserSelectedReaction(newSelected);
      mutation.mutate({
        emoji,
        action: 'increment',
        previousEmoji,
      }, {
        onError: () => {
          // Rollback UI state on error
          setSelected(previousEmoji || null);
          setUserSelectedReaction(previousEmoji || null);
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
