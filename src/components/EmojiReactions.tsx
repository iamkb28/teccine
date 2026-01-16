import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const reactions = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🤔', label: 'Thinking' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💡', label: 'Insightful' },
];

const EmojiReactions = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({
    '👍': 42,
    '❤️': 28,
    '🤔': 15,
    '🔥': 33,
    '💡': 21,
  });

  const handleReaction = (emoji: string) => {
    if (selected === emoji) {
      setSelected(null);
      setCounts(prev => ({ ...prev, [emoji]: prev[emoji] - 1 }));
    } else {
      if (selected) {
        setCounts(prev => ({ ...prev, [selected]: prev[selected] - 1 }));
      }
      setSelected(emoji);
      setCounts(prev => ({ ...prev, [emoji]: prev[emoji] + 1 }));
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground mr-2">React:</span>
      {reactions.map(({ emoji, label }) => (
        <motion.button
          key={emoji}
          onClick={() => handleReaction(emoji)}
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
          <span className="text-muted-foreground">{counts[emoji]}</span>
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
