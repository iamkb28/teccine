import { motion } from 'framer-motion';
import TypewriterText from './TypewriterText';
import { Sparkles } from 'lucide-react';
import teccineLogo from '@/assets/teccine-logo.png';
import chatgptLogo from '@/assets/ChatGPT Image Jan 17, 2026, 05_52_43 PM.png';

const Header = () => {
  return (
    <header className="gradient-hero pt-2 md:pt-4 pb-6 md:pb-8 overflow-hidden">
      {/* Top bar with logo, badge, and verified sticker */}
      <div className="relative mb-8 overflow-visible">
        {/* Centered container with logo and stamp */}
        <div className="flex flex-col gap-3">
          {/* Logo and stamp in a centered horizontal container */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-7 lg:gap-9 xl:gap-11 px-3 sm:px-4">
            {/* Teccine logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <img 
                src={teccineLogo} 
                alt="Teccine - Your daily dose of tech news" 
                className="h-32 sm:h-44 md:h-56 lg:h-80 xl:h-96 drop-shadow-lg"
              />
            </motion.div>

            {/* ChatGPT stamp - larger than logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 5 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex-shrink-0 z-10"
            >
              <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-96 lg:h-96 xl:w-[26rem] xl:h-[26rem]">
                {/* ChatGPT logo */}
                <img 
                  src={chatgptLogo} 
                  alt="ChatGPT" 
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </div>

          {/* Fresh Daily badge - center aligned */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Fresh daily at 9 AM</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main header content - center aligned */}
      <div className="container max-w-4xl mx-auto text-center px-4">

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
          {['🔮 AI', '📱 Mobile', '🎮 Gaming', '🔒 Privacy'].map((tag) => (
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
