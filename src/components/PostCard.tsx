import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lightbulb, Zap, Users } from 'lucide-react';
import { Post } from '@/data/posts';
import { cn } from '@/lib/utils';
import { useLocalReaction } from '@/hooks/use-local-reaction';

interface PostCardProps {
  post: Post;
  isToday?: boolean;
}

const themeClasses = {
  coral: 'border-l-primary',
  teal: 'border-l-secondary',
  purple: 'border-l-accent',
};

const themeBgClasses = {
  coral: 'bg-primary/5',
  teal: 'bg-secondary/5',
  purple: 'bg-accent/5',
};

const PostCard = ({ post, isToday = false }: PostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(isToday);
  const theme = post.theme || 'coral';
  const { selected, updateReaction } = useLocalReaction(post.id);

  const sections = [
    {
      icon: Lightbulb,
      title: 'What it means',
      content: post.whatItMeans,
      iconColor: 'text-amber-500',
    },
    {
      icon: Zap,
      title: 'Why it matters',
      content: post.whyItMatters,
      iconColor: 'text-primary',
    },
    {
      icon: Users,
      title: 'Fields impacted',
      content: null,
      fields: post.fieldsImpacted,
      iconColor: 'text-secondary',
    },
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'bg-card rounded-2xl overflow-hidden border-l-4 shadow-card hover:shadow-card-hover transition-all duration-300',
        themeClasses[theme]
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 md:p-8 text-left group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isToday && (
              <span className={cn(
                'inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3',
                themeBgClasses[theme],
                theme === 'coral' && 'text-primary',
                theme === 'teal' && 'text-secondary',
                theme === 'purple' && 'text-accent'
              )}>
                Today's Update
              </span>
            )}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{post.emoji}</span>
              <h2 className="font-display text-xl md:text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                {post.title}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(post.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-muted/50 rounded-xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <section.icon className={cn('w-5 h-5', section.iconColor)} />
                    <h3 className="font-display font-semibold text-card-foreground">
                      {section.title}
                    </h3>
                  </div>
                  {section.content && (
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  )}
                  {section.fields && (
                    <div className="flex flex-wrap gap-2">
                      {section.fields.map((field) => (
                        <span
                          key={field.name}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                        >
                          <span>{field.icon}</span>
                          <span>{field.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end px-6 md:px-8 pb-4">
        <motion.button
          onClick={() => updateReaction('❤️')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'relative flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
            selected === '❤️'
              ? 'bg-primary/20 shadow-md'
              : 'bg-muted hover:bg-muted/80'
          )}
          aria-label="Love"
        >
          <span className="text-lg">❤️</span>
          {selected === '❤️' && (
            <motion.div
          layoutId={`selected-reaction-${post.id}`}
              className="absolute inset-0 rounded-full border-2 border-primary"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      </div>
    </motion.article>
  );
};

export default PostCard;
