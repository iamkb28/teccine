import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLocalReaction } from '@/hooks/use-local-reaction';

const reactions = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💡', label: 'Insightful' },
];

const EmojiReactions = () => {
  const { selected, updateReaction } = useLocalReaction('global');

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {reactions.map(({ emoji, label }) => (
        <motion.button
          key={emoji}
          onClick={() => updateReaction(emoji)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'relative flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
            selected === emoji
              ? 'bg-primary/20 shadow-md'
              : 'bg-muted hover:bg-muted/80'
          )}
          aria-label={label}
        >
          <span className="text-lg">{emoji}</span>
          {selected === emoji && (
            <motion.div
              layoutId="selected-reaction"
              className="absolute inset-0 rounded-full border-2 border-primary"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default EmojiReactions;
