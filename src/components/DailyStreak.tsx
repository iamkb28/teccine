import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Trophy } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  lastVisit: string;
  longestStreak: number;
}

const getToday = () => new Date().toISOString().split('T')[0];

const getDaysDifference = (date1: string, date2: string) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const DailyStreak = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastVisit: '',
    longestStreak: 0,
  });
  const [isNewDay, setIsNewDay] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dailyTechStreak');
    const today = getToday();
    
    if (stored) {
      const data: StreakData = JSON.parse(stored);
      const daysDiff = getDaysDifference(data.lastVisit, today);
      
      if (data.lastVisit === today) {
        // Already visited today
        setStreakData(data);
      } else if (daysDiff === 1) {
        // Consecutive day - increment streak!
        const newStreak = data.currentStreak + 1;
        const newData: StreakData = {
          currentStreak: newStreak,
          lastVisit: today,
          longestStreak: Math.max(data.longestStreak, newStreak),
        };
        setStreakData(newData);
        localStorage.setItem('dailyTechStreak', JSON.stringify(newData));
        setIsNewDay(true);
      } else {
        // Missed a day - reset streak
        const newData: StreakData = {
          currentStreak: 1,
          lastVisit: today,
          longestStreak: data.longestStreak,
        };
        setStreakData(newData);
        localStorage.setItem('dailyTechStreak', JSON.stringify(newData));
        setIsNewDay(true);
      }
    } else {
      // First visit ever
      const newData: StreakData = {
        currentStreak: 1,
        lastVisit: today,
        longestStreak: 1,
      };
      setStreakData(newData);
      localStorage.setItem('dailyTechStreak', JSON.stringify(newData));
      setIsNewDay(true);
    }
  }, []);

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '✨';
    return '🌱';
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return 'Legend status!';
    if (streak >= 14) return 'Two weeks strong!';
    if (streak >= 7) return 'One week champion!';
    if (streak >= 3) return 'Building momentum!';
    return 'Keep it going!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-streak via-streak/80 to-streak/60 p-4 text-white shadow-lg"
    >
      {/* Animated background particles */}
      {isNewDay && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              initial={{ 
                x: '50%', 
                y: '50%', 
                scale: 0 
              }}
              animate={{ 
                x: `${Math.random() * 100}%`, 
                y: `${Math.random() * 100}%`, 
                scale: [0, 1.5, 0],
                rotate: 360
              }}
              transition={{ 
                duration: 1.5, 
                delay: i * 0.1,
                ease: 'easeOut'
              }}
            >
              {['🎉', '⭐', '✨', '🔥', '💫', '🚀'][i]}
            </motion.span>
          ))}
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div
            animate={isNewDay ? { 
              scale: [1, 1.3, 1],
              rotate: [0, -10, 10, 0]
            } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex-shrink-0"
          >
            <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.div>
          
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <motion.span 
                className="text-2xl sm:text-3xl font-display font-bold"
                key={streakData.currentStreak}
                initial={{ scale: 1.5, y: -10 }}
                animate={{ scale: 1, y: 0 }}
              >
                {streakData.currentStreak}
              </motion.span>
              <span className="text-base sm:text-lg font-medium opacity-90">day streak</span>
              <span className="text-lg sm:text-xl">{getStreakEmoji(streakData.currentStreak)}</span>
            </div>
            <p className="text-xs sm:text-sm opacity-80">{getStreakMessage(streakData.currentStreak)}</p>
          </div>
        </div>

        {streakData.longestStreak > 1 && (
          <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-sm flex-shrink-0">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">Best: {streakData.longestStreak}</span>
          </div>
        )}
      </div>

      {/* Progress dots for the week */}
      <div className="flex items-center gap-2 mt-4">
        <Calendar className="w-4 h-4 opacity-60" />
        <div className="flex gap-1.5">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`w-3 h-3 rounded-full ${
                i < Math.min(streakData.currentStreak, 7)
                  ? 'bg-white'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
        <span className="text-xs opacity-60 ml-1">This week</span>
      </div>
    </motion.div>
  );
};

export default DailyStreak;
