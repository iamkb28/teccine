import { motion } from 'framer-motion';
import TypewriterText from './TypewriterText';
import { Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="gradient-hero py-12 md:py-20 px-4">
      <div className="container max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Fresh daily at 9 AM</span>
        </motion.div>

        <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
          <TypewriterText text="Daily Tech Explained Simply" delay={70} />
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto"
        >
          One tech update, explained simply, every day ✨
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          {['🔮 AI', '📱 Mobile', '🎮 Gaming', '🔒 Privacy'].map((tag, i) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full bg-card text-sm font-medium shadow-card hover:shadow-card-hover transition-shadow cursor-default"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
