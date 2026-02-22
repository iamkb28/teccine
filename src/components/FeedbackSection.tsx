import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import emailjs from '@emailjs/browser';

const placeholders = [
  "Tell us what you liked...",
  "What topic should we cover next?",
  "Any suggestions for improvement?",
  "How can we explain things better?",
];

const MAX_TEXTAREA_HEIGHT = 200;

const FeedbackSection = () => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isTyping) return;
    
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set height based on scrollHeight, with min and max constraints
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 48), MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${newHeight}px`;
    // Enable scroll only when content overflows the max height
    setIsOverflow(textarea.scrollHeight > MAX_TEXTAREA_HEIGHT);
  }, [feedback]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (serviceId && templateId && publicKey) {
      emailjs.send(
        serviceId,
        templateId,
        { message: feedback, to_email: 'dailyteccine@gmail.com' },
        publicKey
      ).catch((err) => {
        console.error('EmailJS send error:', err);
      });
    }

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
              className="flex gap-2 sm:gap-3 items-start"
            >
              <div className="flex-1 relative">
                <MessageCircle className="absolute left-3 sm:left-4 top-[14px] sm:top-[18px] w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none z-10" />
                <textarea
                  ref={textareaRef}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  placeholder={placeholders[placeholderIndex]}
                  rows={1}
                  className={cn(
                    'w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-muted border-2 border-transparent',
                    'focus:border-primary focus:outline-none focus:ring-0',
                    'placeholder:text-muted-foreground/60 resize-none',
                    'transition-all duration-200',
                    'min-h-[48px] max-h-[200px]',
                    isOverflow ? 'overflow-y-auto' : 'overflow-y-hidden',
                    'text-sm sm:text-base',
                    'leading-relaxed break-words',
                    'whitespace-pre-wrap'
                  )}
                  style={{ height: '48px' }}
                />
              </div>
              <motion.button
                type="submit"
                disabled={!feedback.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-display font-semibold flex items-center justify-center gap-2',
                  'gradient-primary text-primary-foreground',
                  'shadow-button hover:opacity-90 transition-opacity',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
                  'flex-shrink-0 min-h-[48px]'
                )}
              >
                <Send className="w-4 h-4 flex-shrink-0" />
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
