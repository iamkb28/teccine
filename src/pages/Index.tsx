import { useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import EmojiReactions from '@/components/EmojiReactions';
import FeedbackSection from '@/components/FeedbackSection';
import CountdownTimer from '@/components/CountdownTimer';
import DailyStreak from '@/components/DailyStreak';
import EnrollmentBanner from '@/components/EnrollmentBanner';
import { getTodayPost, getArchivedPosts } from '@/data/posts';

const Index = () => {
  const [showArchive, setShowArchive] = useState(false);
  const todayPost = getTodayPost();
  const archivedPosts = getArchivedPosts();

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="container max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Today's Post */}
        {todayPost && (
          <section>
            <PostCard post={todayPost} isToday />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <EmojiReactions />
            </motion.div>
          </section>
        )}

        {/* Daily Streak */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <DailyStreak />
        </motion.section>

        {/* Countdown Timer */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <CountdownTimer />
        </motion.section>

        {/* Archive Section */}
        {archivedPosts.length > 0 && (
          <section>
            <motion.button
              onClick={() => setShowArchive(!showArchive)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Archive className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                <span className="font-display font-semibold text-foreground text-sm sm:text-base truncate">
                  Previous Updates
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium flex-shrink-0">
                  {archivedPosts.length}
                </span>
              </div>
              <motion.div
                animate={{ rotate: showArchive ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </motion.div>
            </motion.button>

            {showArchive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                {archivedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        )}
      </main>

      <FeedbackSection />
      <EnrollmentBanner />
    </div>
  );
};

export default Index;
