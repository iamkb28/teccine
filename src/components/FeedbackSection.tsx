import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const placeholders = [
  "Tell us what you liked...",
  "What topic should we cover next?",
  "Any suggestions for improvement?",
  "How can we explain things better?",
];

const FeedbackSection = () => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isTyping) return;
    
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    console.log('Feedback submitted:', feedback);
    setIsSubmitted(true);
    setFeedback('');

    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <section className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border shadow-lg z-50">
      <div className="container max-w-3xl mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center gap-3 py-2"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center"
              >
                <Check className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <span className="font-display font-semibold text-foreground">
                Thank you for your feedback! 🎉
              </span>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="flex gap-3 items-end"
            >
              <div className="flex-1 relative">
                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <textarea
                  ref={textareaRef}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  placeholder={placeholders[placeholderIndex]}
                  rows={1}
                  className={cn(
                    'w-full pl-12 pr-4 py-3 rounded-xl bg-muted border-2 border-transparent',
                    'focus:border-primary focus:outline-none focus:ring-0',
                    'placeholder:text-muted-foreground/60 resize-none',
                    'transition-all duration-200'
                  )}
                />
              </div>
              <motion.button
                type="submit"
                disabled={!feedback.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'px-6 py-3 rounded-xl font-display font-semibold flex items-center gap-2',
                  'gradient-primary text-primary-foreground',
                  'shadow-button hover:opacity-90 transition-opacity',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                )}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default FeedbackSection;
