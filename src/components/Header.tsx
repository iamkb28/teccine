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
          <div className="flex items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-14 xl:gap-16 px-3 sm:px-4 w-full max-w-full">
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
                className="h-[8.16rem] sm:h-[11.22rem] md:h-[14.28rem] lg:h-[20.4rem] xl:h-[24.48rem] drop-shadow-lg w-auto max-w-[calc(50vw-5rem)] sm:max-w-none"
              />
            </motion.div>

            {/* ChatGPT stamp - larger than logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 5 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex-shrink-0 z-10"
            >
              <div className="relative w-[10.2rem] h-[10.2rem] sm:w-[14.28rem] sm:h-[14.28rem] md:w-[18.36rem] md:h-[18.36rem] lg:w-[24.48rem] lg:h-[24.48rem] xl:w-[26.52rem] xl:h-[26.52rem] max-w-[calc(50vw-5rem)] sm:max-w-none">
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
